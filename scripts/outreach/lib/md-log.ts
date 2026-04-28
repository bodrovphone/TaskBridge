/**
 * Markdown run-log writer.
 *
 * One file per campaign at docs/data/outreach/runs/<file>.md, plus an INDEX.md
 * with one row per run. Both are appended to as the campaign progresses
 * (started → fetched → sent batches).
 *
 * Files live under docs/ (not data/) to match the existing scheduled-task
 * convention. See docs/data/outreach/README.md for the full layout.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const REPO_ROOT = resolve(__dirname, '..', '..', '..')
const RUNS_DIR = resolve(REPO_ROOT, 'docs/data/outreach/runs')
const INDEX_PATH = resolve(REPO_ROOT, 'docs/data/outreach/INDEX.md')

export interface CampaignLogMeta {
  campaignId: string
  city: string
  subCategory: string
  taskId: string
  taskTitle: string
  taskUrl: string
  gmapsQuery: string
  language: string
}

export function logFileFor(meta: CampaignLogMeta, startedAt: Date): string {
  const date = startedAt.toISOString().slice(0, 10)        // YYYY-MM-DD
  const shortId = meta.taskId.slice(0, 8)
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
  const fname = `${date}__${slug(meta.city)}__${slug(meta.subCategory)}__${shortId}.md`
  return resolve(RUNS_DIR, fname)
}

export function writeStartedLog(meta: CampaignLogMeta, startedAt: Date): string {
  ensureDir(RUNS_DIR)
  const path = logFileFor(meta, startedAt)
  const body =
    `# Outreach run — ${meta.city} × ${meta.subCategory}\n` +
    `\n` +
    `- **Campaign ID:** \`${meta.campaignId}\`\n` +
    `- **Status:** \`in_progress\` (will flip to \`fetched\`, then \`sent\`)\n` +
    `- **Bait task:** [${meta.taskTitle}](${meta.taskUrl}) (\`${meta.taskId}\`)\n` +
    `- **City:** ${meta.city}\n` +
    `- **Sub-category:** ${meta.subCategory}\n` +
    `- **Language:** ${meta.language}\n` +
    `- **Apify query:** "${meta.gmapsQuery}"\n` +
    `- **Started:** ${formatTs(startedAt)}\n`
  writeFileSync(path, body, 'utf8')
  return path
}

export interface FetchSummary {
  rawCount: number
  keptCount: number
  skippedByReason: Record<string, number>
  apifyRunId: string
  csvPath?: string
}

export function appendFetchResult(logPath: string, summary: FetchSummary, finishedAt: Date): void {
  const lines: string[] = []
  lines.push('')
  lines.push(`## Fetch result — ${formatTs(finishedAt)}`)
  lines.push('')
  lines.push(`- Apify returned: ${summary.rawCount} raw leads`)
  lines.push(`- Kept (have email, not duplicate, not chain): **${summary.keptCount}**`)
  if (Object.keys(summary.skippedByReason).length > 0) {
    lines.push(`- Skipped:`)
    for (const [reason, count] of Object.entries(summary.skippedByReason)) {
      lines.push(`  - ${count} — ${reason}`)
    }
  }
  lines.push('')
  lines.push(`- Apify run id: \`${summary.apifyRunId}\``)
  if (summary.csvPath) {
    lines.push(`- CSV: \`${relativeToRepo(summary.csvPath)}\``)
  }
  lines.push('')
  lines.push(`Status flipped to \`fetched\`.`)
  lines.push('')
  appendFileSync(logPath, lines.join('\n'), 'utf8')
}

export interface SendBatchSummary {
  sent: number
  failed: number
  remainingQueued: number
  bouncesToDate: number
  dailyCountAfter: number
  dailyCap: number
}

export function appendSendBatch(logPath: string, summary: SendBatchSummary, at: Date): void {
  const lines: string[] = []
  lines.push('')
  lines.push(`## Send batch — ${formatTs(at)}`)
  lines.push('')
  lines.push(`- Sent: **${summary.sent}**${summary.failed ? ` (failed: ${summary.failed})` : ''}`)
  lines.push(`- Remaining queued: ${summary.remainingQueued}`)
  lines.push(`- Bounces so far: ${summary.bouncesToDate}`)
  lines.push(`- Resend daily count after batch: ${summary.dailyCountAfter} / ${summary.dailyCap}`)
  if (summary.remainingQueued === 0) {
    lines.push('')
    lines.push('Status flipped to `sent`.')
  }
  lines.push('')
  appendFileSync(logPath, lines.join('\n'), 'utf8')
}

// ---------- INDEX.md ----------

export interface IndexEntry {
  date: string                // YYYY-MM-DD
  city: string
  subCategory: string
  status: string              // in_progress | fetched | sent | failed
  kept: number | null
  logRelPath: string
}

/**
 * Replace any prior entry for the same campaign (matched by log path) with the
 * latest. The index is rewritten in full so the most recent run sits on top.
 */
export function upsertIndex(entry: IndexEntry): void {
  ensureDir(dirname(INDEX_PATH))
  const existing = parseIndex()
  const filtered = existing.filter((e) => e.logRelPath !== entry.logRelPath)
  const next = [entry, ...filtered].slice(0, 200)  // keep last 200
  writeFileSync(INDEX_PATH, renderIndex(next), 'utf8')
}

function parseIndex(): IndexEntry[] {
  if (!existsSync(INDEX_PATH)) return []
  const text = readFileSync(INDEX_PATH, 'utf8')
  const out: IndexEntry[] = []
  for (const line of text.split('\n')) {
    // Match table rows like:
    // | 2026-04-26 | sofia | cleaning-services | sent | 34 | [log](runs/2026-...md) |
    const m = line.match(
      /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([a-z_]+)\s*\|\s*([\d–-]+)\s*\|\s*\[[^\]]+\]\(([^)]+)\)\s*\|\s*$/,
    )
    if (!m) continue
    const kept = m[5] === '–' || m[5] === '-' ? null : Number(m[5])
    out.push({
      date: m[1],
      city: m[2].trim(),
      subCategory: m[3].trim(),
      status: m[4],
      kept,
      logRelPath: m[6].trim(),
    })
  }
  return out
}

function renderIndex(entries: IndexEntry[]): string {
  const header =
    `# Outreach runs — index\n` +
    `\n` +
    `Latest run on top. Each row links to the per-campaign markdown log under \`runs/\`.\n` +
    `\n` +
    `| Date | City | Sub-category | Status | Kept | Log |\n` +
    `|---|---|---|---|---|---|\n`
  const rows = entries
    .map((e) => {
      const kept = e.kept === null ? '–' : String(e.kept)
      const linkLabel = e.logRelPath.split('/').pop() ?? 'log'
      return `| ${e.date} | ${e.city} | ${e.subCategory} | ${e.status} | ${kept} | [${linkLabel}](${e.logRelPath}) |`
    })
    .join('\n')
  return header + rows + '\n'
}

// ---------- helpers ----------

function ensureDir(d: string): void {
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
}

function formatTs(d: Date): string {
  // 2026-04-26 14:23 UTC
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  )
}

export function relativeToRepo(absPath: string): string {
  return absPath.startsWith(REPO_ROOT) ? absPath.slice(REPO_ROOT.length + 1) : absPath
}

export { RUNS_DIR, INDEX_PATH, REPO_ROOT }
