/**
 * outreach:tasks
 *
 * Lists open TruDify tasks and shows which have been used as a "bait" in an
 * outreach campaign vs which haven't. Read-only — never writes anything.
 *
 *   npm run outreach:tasks                  # all open tasks (untouched first)
 *   npm run outreach:tasks -- --available   # only tasks not yet used as bait
 *   npm run outreach:tasks -- --used        # only tasks already used as bait
 */

import 'dotenv/config'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'node:path'

// .env.local has higher priority than .env (matches the rest of scripts/outreach/)
dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true })

import { getServiceClient } from './lib/supabase'

interface Row {
  id: string
  posted: string
  city: string
  subcategory: string | null
  title: string
  used_as_bait: boolean
  bait_at: string | null
  bait_status: string | null
  leads_total: number
  leads_sent: number
}

interface Args {
  filter: 'all' | 'available' | 'used'
}

function parseArgs(argv: string[]): Args {
  const out: Args = { filter: 'all' }
  for (const a of argv) {
    if (a === '--available') out.filter = 'available'
    else if (a === '--used') out.filter = 'used'
  }
  return out
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + '…'
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const supabase = getServiceClient()

  // Inline raw SQL via PostgREST RPC isn't possible on arbitrary SQL — but
  // the same shape as the query in the planning doc can be expressed with
  // two cheap queries: open tasks, then most-recent campaign per task_id.
  const { data: tasksData, error: tErr } = await supabase
    .from('tasks')
    .select('id, created_at, city, subcategory, title')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (tErr) throw new Error(`tasks lookup: ${tErr.message}`)
  const tasks = (tasksData ?? []) as Array<{
    id: string
    created_at: string
    city: string
    subcategory: string | null
    title: string
  }>
  if (tasks.length === 0) {
    console.log('No open tasks.')
    return
  }

  const taskIds = tasks.map((t) => t.id)
  const { data: campData, error: cErr } = await supabase
    .from('outreach_campaigns')
    .select('id, task_id, status, created_at')
    .in('task_id', taskIds)
    .order('created_at', { ascending: false })
  if (cErr) throw new Error(`campaigns lookup: ${cErr.message}`)
  const camps = (campData ?? []) as Array<{
    id: string
    task_id: string
    status: string
    created_at: string
  }>
  const mostRecentByTask = new Map<string, (typeof camps)[number]>()
  for (const c of camps) {
    if (!mostRecentByTask.has(c.task_id)) mostRecentByTask.set(c.task_id, c)
  }

  const campaignIds = Array.from(mostRecentByTask.values()).map((c) => c.id)
  const leadCounts = new Map<string, { total: number; sent: number }>()
  if (campaignIds.length > 0) {
    const { data: leadsData, error: lErr } = await supabase
      .from('outreach_leads')
      .select('campaign_id, status')
      .in('campaign_id', campaignIds)
    if (lErr) throw new Error(`leads lookup: ${lErr.message}`)
    for (const l of (leadsData ?? []) as Array<{ campaign_id: string; status: string }>) {
      const cur = leadCounts.get(l.campaign_id) ?? { total: 0, sent: 0 }
      cur.total += 1
      if (l.status === 'sent' || l.status === 'opened' || l.status === 'clicked') {
        cur.sent += 1
      }
      leadCounts.set(l.campaign_id, cur)
    }
  }

  const rows: Row[] = tasks.map((t) => {
    const c = mostRecentByTask.get(t.id)
    const counts = c ? leadCounts.get(c.id) : undefined
    return {
      id: t.id,
      posted: t.created_at.slice(0, 10),
      city: t.city,
      subcategory: t.subcategory,
      title: t.title,
      used_as_bait: !!c,
      bait_at: c?.created_at.slice(0, 10) ?? null,
      bait_status: c?.status ?? null,
      leads_total: counts?.total ?? 0,
      leads_sent: counts?.sent ?? 0,
    }
  })

  const filtered = rows.filter((r) => {
    if (args.filter === 'available') return !r.used_as_bait
    if (args.filter === 'used') return r.used_as_bait
    return true
  })

  // Untouched tasks first (so "what's available to bait" sits on top by default).
  filtered.sort((a, b) => {
    if (a.used_as_bait !== b.used_as_bait) return a.used_as_bait ? 1 : -1
    return a.posted < b.posted ? 1 : -1
  })

  console.log(`Open tasks: ${rows.length}  |  used as bait: ${rows.filter((r) => r.used_as_bait).length}  |  showing: ${filtered.length}`)
  console.log()

  const header = ['posted', 'city', 'subcategory', 'title', 'used', 'leads', 'task_id']
  const rowsOut = filtered.map((r) => [
    r.posted,
    r.city,
    r.subcategory ?? '',
    truncate(r.title.replace(/\s+/g, ' ').trim(), 48),
    r.used_as_bait ? `✓ ${r.bait_at} (${r.bait_status})` : '—',
    r.used_as_bait ? `${r.leads_sent}/${r.leads_total}` : '',
    r.id,
  ])

  const widths = header.map((h, i) =>
    Math.max(h.length, ...rowsOut.map((row) => row[i].length))
  )
  const line = (cells: string[]) => cells.map((c, i) => c.padEnd(widths[i])).join('  ')

  console.log(line(header))
  console.log(line(widths.map((w) => '-'.repeat(w))))
  for (const row of rowsOut) console.log(line(row))
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
})
