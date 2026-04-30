/**
 * outreach:heatmap
 *
 * Reads the public.outreach_supply_heatmap view (cold-start Task 02) and
 * prints a sorted table. EMPTY (URGENT) cells on top — those are the
 * outreach target list. Read-only.
 *
 *   npm run outreach:heatmap                  # full table, urgent first
 *   npm run outreach:heatmap -- --empty-only  # only EMPTY (URGENT) rows
 *   npm run outreach:heatmap -- --csv         # CSV to stdout (pipe to file)
 */

import 'dotenv/config'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'node:path'

dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true })

import { getServiceClient } from './lib/supabase'

interface Row {
  city: string
  sub_category: string
  active_pros: number
  tasks_60d: number
  invitations: number
  coverage_status: 'EMPTY (URGENT)' | 'WEAK' | 'OK' | 'NO DEMAND'
}

interface Args {
  emptyOnly: boolean
  csv: boolean
}

function parseArgs(argv: string[]): Args {
  const out: Args = { emptyOnly: false, csv: false }
  for (const a of argv) {
    if (a === '--empty-only') out.emptyOnly = true
    else if (a === '--csv') out.csv = true
  }
  return out
}

const STATUS_RANK: Record<Row['coverage_status'], number> = {
  'EMPTY (URGENT)': 0,
  WEAK: 1,
  OK: 2,
  'NO DEMAND': 3,
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('outreach_supply_heatmap')
    .select('*')
  if (error) throw new Error(`heatmap read: ${error.message}`)
  let rows = (data ?? []) as Row[]

  if (args.emptyOnly) rows = rows.filter((r) => r.coverage_status === 'EMPTY (URGENT)')

  rows.sort((a, b) => {
    if (STATUS_RANK[a.coverage_status] !== STATUS_RANK[b.coverage_status]) {
      return STATUS_RANK[a.coverage_status] - STATUS_RANK[b.coverage_status]
    }
    if (a.tasks_60d !== b.tasks_60d) return b.tasks_60d - a.tasks_60d
    if (a.active_pros !== b.active_pros) return a.active_pros - b.active_pros
    if (a.city !== b.city) return a.city.localeCompare(b.city)
    return a.sub_category.localeCompare(b.sub_category)
  })

  if (args.csv) {
    console.log('city,sub_category,active_pros,tasks_60d,invitations,coverage_status')
    for (const r of rows) {
      console.log([r.city, r.sub_category, r.active_pros, r.tasks_60d, r.invitations, r.coverage_status].join(','))
    }
    return
  }

  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.coverage_status] = (acc[r.coverage_status] ?? 0) + 1
    return acc
  }, {})
  const summary = (['EMPTY (URGENT)', 'WEAK', 'OK', 'NO DEMAND'] as const)
    .map((s) => `${s}: ${counts[s] ?? 0}`)
    .join('  |  ')
  console.log(`Cells: ${rows.length}  |  ${summary}`)
  console.log()

  const header = ['status', 'city', 'sub_category', 'pros', 'tasks_60d', 'invites']
  const out = rows.map((r) => [
    r.coverage_status,
    r.city,
    r.sub_category,
    String(r.active_pros),
    String(r.tasks_60d),
    String(r.invitations),
  ])
  const widths = header.map((h, i) =>
    Math.max(h.length, ...out.map((row) => row[i].length))
  )
  const line = (cells: string[]) => cells.map((c, i) => c.padEnd(widths[i])).join('  ')

  console.log(line(header))
  console.log(line(widths.map((w) => '-'.repeat(w))))
  for (const row of out) console.log(line(row))
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
})
