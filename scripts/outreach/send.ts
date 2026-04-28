/**
 * Outreach email sender.
 *
 *   npm run outreach:send                                 # most recent campaign with queued leads
 *   npm run outreach:send -- --campaign-id=<uuid>
 *   npm run outreach:send -- --campaign-id=<uuid> --max=20
 *   npm run outreach:send -- --dry-run                    # render emails to stdout, no send
 *
 * NEVER schedule this. Always run by hand. The "yes" gate before sending is
 * intentional — it's the human checkpoint that protects the sending domain.
 */

import 'dotenv/config'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { config as loadEnv } from 'dotenv'
import { createInterface } from 'node:readline/promises'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

import { getServiceClient } from './lib/supabase'
import { sendEmail } from './lib/resend'
import { signUnsubscribeToken, buildUnsubscribeUrl } from './lib/token'
import { cityLabelFor, subCategoryLabelFor } from './lib/labels'
import { subjectFor, senderNameFor } from './templates/subjects'
import { appendSendBatch, relativeToRepo } from './lib/md-log'

interface CliArgs {
  campaignId?: string
  max: number
  dryRun: boolean
  rateLimitMs: number
  yes: boolean
}

const TEMPLATE_DIR = resolve(__dirname, 'templates')

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    max: parseInt(process.env.OUTREACH_DAILY_CAP || '20', 10),
    dryRun: false,
    rateLimitMs: 30_000,
    yes: false,
  }
  for (const a of argv) {
    if (a.startsWith('--campaign-id=')) out.campaignId = a.slice('--campaign-id='.length)
    else if (a.startsWith('--max=')) out.max = Math.max(1, parseInt(a.slice('--max='.length), 10))
    else if (a === '--dry-run') out.dryRun = true
    else if (a.startsWith('--rate-limit-ms=')) out.rateLimitMs = parseInt(a.slice('--rate-limit-ms='.length), 10)
    else if (a === '--yes') out.yes = true
  }
  return out
}

interface CampaignRow {
  id: string
  city: string
  sub_category: string
  language: string
  task_id: string | null
  status: string
  log_path: string | null
}

interface LeadRow {
  id: string
  business_name: string
  email: string
}

interface TaskRow {
  id: string
  title: string
  slug: string
}

async function pickCampaign(supabase: ReturnType<typeof getServiceClient>, explicitId?: string): Promise<CampaignRow> {
  if (explicitId) {
    const { data, error } = await supabase
      .from('outreach_campaigns')
      .select('id, city, sub_category, language, task_id, status, log_path')
      .eq('id', explicitId)
      .single()
    if (error || !data) throw new Error(`campaign ${explicitId} not found: ${error?.message}`)
    return data as CampaignRow
  }

  // Most recent campaign with at least one queued lead.
  const { data: queued, error: qErr } = await supabase
    .from('outreach_leads')
    .select('campaign_id')
    .eq('status', 'queued')
    .limit(500)
  if (qErr) throw new Error(`queued leads lookup: ${qErr.message}`)
  if (!queued || queued.length === 0) {
    throw new Error('No campaigns with queued leads. Run outreach:fetch first.')
  }
  const campaignIds = Array.from(new Set(queued.map((r) => r.campaign_id as string)))
  const { data: camps, error: cErr } = await supabase
    .from('outreach_campaigns')
    .select('id, city, sub_category, language, task_id, status, log_path, created_at')
    .in('id', campaignIds)
    .order('created_at', { ascending: false })
    .limit(1)
  if (cErr || !camps || camps.length === 0) {
    throw new Error(`campaign lookup: ${cErr?.message ?? 'no rows'}`)
  }
  return camps[0] as CampaignRow
}

function loadTemplate(lang: 'bg' | 'ru' | 'ua'): { html: string; text: string } {
  const html = readFileSync(resolve(TEMPLATE_DIR, `${lang}.html`), 'utf8')
  const text = readFileSync(resolve(TEMPLATE_DIR, `${lang}.txt`), 'utf8')
  return { html, text }
}

interface RenderInput {
  businessName: string
  cityLabel: string
  subCategoryLabel: string
  taskTitle: string
  taskUrl: string
  unsubscribeUrl: string
  senderName: string
}

function render(template: string, vars: RenderInput): string {
  return template
    .replace(/\{\{businessName\}\}/g, escape(vars.businessName))
    .replace(/\{\{cityLabel\}\}/g, escape(vars.cityLabel))
    .replace(/\{\{subCategoryLabel\}\}/g, escape(vars.subCategoryLabel))
    .replace(/\{\{taskTitle\}\}/g, escape(vars.taskTitle))
    .replace(/\{\{taskUrl\}\}/g, vars.taskUrl)            // url, not escaped
    .replace(/\{\{unsubscribeUrl\}\}/g, vars.unsubscribeUrl)
    .replace(/\{\{senderName\}\}/g, escape(vars.senderName))
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await rl.question(question)).trim().toLowerCase()
  rl.close()
  return answer === 'yes' || answer === 'y'
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const supabase = getServiceClient()
  const lang = (process.env.OUTREACH_FORCE_LANG as 'bg' | 'ru' | 'ua') || undefined

  const campaign = await pickCampaign(supabase, args.campaignId)
  const campaignLang = (lang ?? campaign.language) as 'bg' | 'ru' | 'ua'
  if (!['bg', 'ru', 'ua'].includes(campaignLang)) {
    throw new Error(`Unsupported campaign language: ${campaignLang} (expected bg|ru|ua)`)
  }

  // Load bait task
  if (!campaign.task_id) throw new Error('Campaign has no task_id — cannot render email')
  const { data: task, error: tErr } = await supabase
    .from('tasks')
    .select('id, title, slug')
    .eq('id', campaign.task_id)
    .single()
  if (tErr || !task) throw new Error(`task lookup: ${tErr?.message ?? 'no row'}`)
  const taskRow = task as TaskRow

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
  const taskUrl = `${baseUrl.replace(/\/$/, '')}/${campaignLang}/tasks/${taskRow.slug}`

  // Pick queued leads
  const { data: leads, error: lErr } = await supabase
    .from('outreach_leads')
    .select('id, business_name, email')
    .eq('campaign_id', campaign.id)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(args.max)
  if (lErr) throw new Error(`leads lookup: ${lErr.message}`)
  const queuedLeads = (leads ?? []) as LeadRow[]

  // Total queued for status reporting
  const { count: totalQueued } = await supabase
    .from('outreach_leads')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'queued')

  const cityLabel = cityLabelFor(campaign.city, campaignLang)
  const subCategoryLabel = subCategoryLabelFor(campaign.sub_category, campaignLang)
  const subject = subjectFor(campaignLang, { cityLabel, subCategoryLabel })
  const senderName = senderNameFor(campaignLang)
  const { html: htmlTpl, text: textTpl } = loadTemplate(campaignLang)

  console.log(`▸ Campaign : ${campaign.id}`)
  console.log(`  city     : ${campaign.city} (${cityLabel})`)
  console.log(`  subcat   : ${campaign.sub_category} (${subCategoryLabel})`)
  console.log(`  language : ${campaignLang}`)
  console.log(`  task     : ${taskRow.title}`)
  console.log(`  url      : ${taskUrl}`)
  console.log(`  subject  : ${subject}`)
  console.log(`  queued   : ${totalQueued ?? '?'} total / ${queuedLeads.length} this batch`)
  console.log(`  rate     : 1 email per ${args.rateLimitMs / 1000}s`)
  console.log(`  dry-run  : ${args.dryRun ? 'YES' : 'no'}`)
  console.log()

  if (queuedLeads.length === 0) {
    console.log('No queued leads. Nothing to do.')
    return
  }

  // Dry-run: render the first lead and exit
  if (args.dryRun) {
    const lead = queuedLeads[0]
    const unsubToken = await signUnsubscribeToken(lead.email, campaign.id)
    const unsubscribeUrl = buildUnsubscribeUrl(unsubToken, baseUrl, campaignLang)
    const vars: RenderInput = {
      businessName: lead.business_name,
      cityLabel,
      subCategoryLabel,
      taskTitle: taskRow.title,
      taskUrl,
      unsubscribeUrl,
      senderName,
    }
    console.log(`--- Dry-run preview for ${lead.email} ---\n`)
    console.log(`Subject: ${subject}\n`)
    console.log('--- text ---')
    console.log(render(textTpl, vars))
    console.log('--- html ---')
    console.log(render(htmlTpl, vars))
    console.log(`\nUnsubscribe URL: ${unsubscribeUrl}`)
    return
  }

  // Confirmation gate
  if (!args.yes) {
    const ok = await confirm(`Send ${queuedLeads.length} emails now? Type "yes" to proceed: `)
    if (!ok) {
      console.log('Aborted.')
      return
    }
  }

  let sent = 0
  let failed = 0
  for (let i = 0; i < queuedLeads.length; i++) {
    const lead = queuedLeads[i]
    const unsubToken = await signUnsubscribeToken(lead.email, campaign.id)
    const unsubscribeUrl = buildUnsubscribeUrl(unsubToken, baseUrl, campaignLang)
    const vars: RenderInput = {
      businessName: lead.business_name,
      cityLabel,
      subCategoryLabel,
      taskTitle: taskRow.title,
      taskUrl,
      unsubscribeUrl,
      senderName,
    }
    const html = render(htmlTpl, vars)
    const text = render(textTpl, vars)

    try {
      const { id: messageId } = await sendEmail({
        to: lead.email,
        subject,
        html,
        text,
        unsubscribeUrl,
      })
      await supabase
        .from('outreach_leads')
        .update({
          status: 'sent',
          resend_message_id: messageId,
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', lead.id)
      sent++
      console.log(`  [${i + 1}/${queuedLeads.length}] ✓ ${lead.email} → ${messageId}`)
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      await supabase
        .from('outreach_leads')
        .update({ status: 'failed', last_error: msg })
        .eq('id', lead.id)
      console.log(`  [${i + 1}/${queuedLeads.length}] ✗ ${lead.email}: ${msg}`)
    }

    if (i < queuedLeads.length - 1) await sleep(args.rateLimitMs)
  }

  // Bounce count for the log
  const { count: bouncesToDate } = await supabase
    .from('outreach_leads')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'bounced')

  // Remaining queued
  const { count: remainingQueued } = await supabase
    .from('outreach_leads')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'queued')

  // Sent today (across all campaigns)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const { count: dailyCountAfter } = await supabase
    .from('outreach_leads')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', todayStart.toISOString())

  // Append to per-campaign log
  if (campaign.log_path) {
    const absLog = resolve(__dirname, '..', '..', campaign.log_path)
    appendSendBatch(
      absLog,
      {
        sent,
        failed,
        remainingQueued: remainingQueued ?? 0,
        bouncesToDate: bouncesToDate ?? 0,
        dailyCountAfter: dailyCountAfter ?? sent,
        dailyCap: args.max,
      },
      new Date(),
    )
  }

  // Flip campaign to 'sent' once queue drains
  if ((remainingQueued ?? 0) === 0) {
    await supabase.from('outreach_campaigns').update({ status: 'sent' }).eq('id', campaign.id)
  }

  console.log()
  console.log(`✓ Done. Sent: ${sent}, failed: ${failed}, remaining queued: ${remainingQueued ?? 0}.`)
  if (campaign.log_path) {
    console.log(`  Log: ${relativeToRepo(resolve(__dirname, '..', '..', campaign.log_path))}`)
  }
}

main().catch((err) => {
  console.error('✗ Send failed:', err)
  process.exit(1)
})
