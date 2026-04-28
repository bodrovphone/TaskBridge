/**
 * Outreach lead fetcher.
 *
 *   npm run outreach:fetch                       # auto-pick an open task
 *   npm run outreach:fetch -- --task-id=<uuid>   # explicit task
 *   npm run outreach:fetch -- --max-items=50     # cap Apify items (cost ctrl)
 *   npm run outreach:fetch -- --language=ru      # bg (default), ru, uk
 *   npm run outreach:fetch -- --no-csv           # skip writing the CSV alongside the log
 *
 * Safe to schedule (worst case: wastes Apify credits). Never sends email.
 */

import 'dotenv/config'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

import { getServiceClient } from './lib/supabase'
import { runGmapsActor } from './lib/apify'
import { filterLeads, summarizeSkipped, type NormalizedLead } from './lib/filters'
import { buildGmapsQuery, apifyLangCode } from './queries'
import {
  appendFetchResult,
  upsertIndex,
  writeStartedLog,
  relativeToRepo,
  type CampaignLogMeta,
} from './lib/md-log'

interface CliArgs {
  taskId?: string
  maxItems: number
  language: 'bg' | 'ru' | 'ua'
  writeCsv: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = { maxItems: 100, language: 'bg', writeCsv: true }
  for (const a of argv) {
    if (a.startsWith('--task-id=')) out.taskId = a.slice('--task-id='.length)
    else if (a.startsWith('--max-items=')) out.maxItems = Math.max(1, parseInt(a.slice('--max-items='.length), 10))
    else if (a.startsWith('--language=')) {
      const v = a.slice('--language='.length)
      if (v !== 'bg' && v !== 'ru' && v !== 'ua') throw new Error(`bad --language=${v} (use bg|ru|ua)`)
      out.language = v
    } else if (a === '--no-csv') out.writeCsv = false
  }
  return out
}

interface PickedTask {
  id: string
  title: string
  city: string
  subcategory: string | null
  category: string
  slug: string
}

async function pickTask(taskId: string | undefined): Promise<PickedTask> {
  const supabase = getServiceClient()

  if (taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, city, category, subcategory, slug, status')
      .eq('id', taskId)
      .single()
    if (error || !data) throw new Error(`Task ${taskId} not found: ${error?.message ?? 'no row'}`)
    return data as PickedTask
  }

  // Auto-pick: most recent open task with no campaign in the last 30 days.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentCampaigns, error: campErr } = await supabase
    .from('outreach_campaigns')
    .select('task_id')
    .gte('created_at', cutoff)
    .not('task_id', 'is', null)
  if (campErr) throw new Error(`outreach_campaigns lookup: ${campErr.message}`)
  const skipIds = new Set((recentCampaigns ?? []).map((c) => c.task_id as string))

  const { data: tasks, error: taskErr } = await supabase
    .from('tasks')
    .select('id, title, city, category, subcategory, slug, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)
  if (taskErr) throw new Error(`tasks lookup: ${taskErr.message}`)

  const candidate = (tasks ?? []).find((t) => !skipIds.has(t.id as string))
  if (!candidate) {
    throw new Error('No open task without a campaign in the last 30 days. Pass --task-id to override.')
  }
  return candidate as PickedTask
}

function leadsToCsv(leads: NormalizedLead[]): string {
  const headers = ['business_name', 'email', 'phone', 'website', 'gmaps_url', 'rating', 'reviews_count']
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const rows = leads.map((l) =>
    [l.business_name, l.email, l.phone, l.website, l.gmaps_url, l.rating, l.reviews_count]
      .map(escape)
      .join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const supabase = getServiceClient()

  console.log('▸ Picking task…')
  const task = await pickTask(args.taskId)
  const subCategory = task.subcategory ?? task.category
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
  const taskUrl = `${baseUrl.replace(/\/$/, '')}/${args.language}/tasks/${task.slug}`
  const gmapsQuery = buildGmapsQuery(task.city, subCategory, args.language)

  console.log(`  task    : ${task.title}`)
  console.log(`  id      : ${task.id}`)
  console.log(`  city    : ${task.city}`)
  console.log(`  subcat  : ${subCategory}`)
  console.log(`  query   : "${gmapsQuery}"`)
  console.log(`  language: ${args.language}`)
  console.log()

  // 1. Insert in_progress campaign row
  const startedAt = new Date()
  const { data: campRow, error: campInsErr } = await supabase
    .from('outreach_campaigns')
    .insert({
      city: task.city,
      sub_category: subCategory,
      gmaps_query: gmapsQuery,
      language: args.language,
      task_id: task.id,
      status: 'in_progress',
      started_at: startedAt.toISOString(),
    })
    .select('id')
    .single()
  if (campInsErr || !campRow) throw new Error(`campaign insert: ${campInsErr?.message ?? 'no row'}`)
  const campaignId = campRow.id as string
  console.log(`▸ Campaign created: ${campaignId}`)

  // 2. Started log
  const meta: CampaignLogMeta = {
    campaignId,
    city: task.city,
    subCategory,
    taskId: task.id,
    taskTitle: task.title,
    taskUrl,
    gmapsQuery,
    language: args.language,
  }
  const logPath = writeStartedLog(meta, startedAt)
  await supabase.from('outreach_campaigns').update({ log_path: relativeToRepo(logPath) }).eq('id', campaignId)
  upsertIndex({
    date: startedAt.toISOString().slice(0, 10),
    city: task.city,
    subCategory,
    status: 'in_progress',
    kept: null,
    logRelPath: relativeToRepo(logPath).replace(/^docs\/data\/outreach\//, ''),
  })
  console.log(`▸ Log: ${relativeToRepo(logPath)}`)

  // 3. Run Apify
  console.log(`▸ Running Apify (max ${args.maxItems} items)…`)
  let runResult
  try {
    runResult = await runGmapsActor(gmapsQuery, apifyLangCode(args.language), args.maxItems)
  } catch (err) {
    await supabase
      .from('outreach_campaigns')
      .update({ status: 'failed', finished_at: new Date().toISOString() })
      .eq('id', campaignId)
    throw err
  }
  console.log(`  apify run: ${runResult.runId}`)
  console.log(`  raw items: ${runResult.items.length}`)

  await supabase.from('outreach_campaigns').update({ apify_run_id: runResult.runId }).eq('id', campaignId)

  // 4. Filter
  console.log(`▸ Filtering…`)
  const { kept, skipped } = await filterLeads(runResult.items, {
    supabase,
    recentOutreachWindowDays: 90,
  })
  const skippedSummary = summarizeSkipped(skipped)
  console.log(`  kept   : ${kept.length}`)
  console.log(`  skipped: ${skipped.length}`)
  for (const [reason, count] of Object.entries(skippedSummary)) {
    console.log(`    - ${reason}: ${count}`)
  }

  // 5. Insert leads
  if (kept.length > 0) {
    const rows = kept.map((l) => ({ campaign_id: campaignId, ...l }))
    const { error: insErr } = await supabase.from('outreach_leads').insert(rows)
    if (insErr) throw new Error(`outreach_leads insert: ${insErr.message}`)
  }

  // 6. CSV (optional)
  let csvPath: string | undefined
  if (args.writeCsv && kept.length > 0) {
    csvPath = logPath.replace(/\.md$/, '.csv')
    writeFileSync(csvPath, leadsToCsv(kept), 'utf8')
  }

  // 7. Update logs + campaign status
  const finishedAt = new Date()
  appendFetchResult(
    logPath,
    {
      rawCount: runResult.items.length,
      keptCount: kept.length,
      skippedByReason: skippedSummary,
      apifyRunId: runResult.runId,
      csvPath,
    },
    finishedAt,
  )
  await supabase
    .from('outreach_campaigns')
    .update({ status: 'fetched', finished_at: finishedAt.toISOString() })
    .eq('id', campaignId)
  upsertIndex({
    date: startedAt.toISOString().slice(0, 10),
    city: task.city,
    subCategory,
    status: 'fetched',
    kept: kept.length,
    logRelPath: relativeToRepo(logPath).replace(/^docs\/data\/outreach\//, ''),
  })

  console.log()
  console.log(`✓ Done. Campaign ${campaignId} ready for send.`)
  console.log(`  npm run outreach:send -- --campaign-id=${campaignId} --dry-run`)
}

main().catch((err) => {
  console.error('✗ Fetch failed:', err)
  process.exit(1)
})
