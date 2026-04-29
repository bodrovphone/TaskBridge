/**
 * Apify actor wrapper for outreach lead fetching.
 *
 * Calls the configured actor (default: compass/google-maps-extractor) with a
 * search query and returns the dataset items. Polls the run until it finishes.
 *
 * Docs: https://docs.apify.com/api/v2#tag/Actor-runs/operation/act_run_post
 */

const APIFY_BASE = 'https://api.apify.com/v2'

export interface ApifyRawLead {
  title?: string                 // business name
  url?: string                   // gmaps URL
  website?: string
  phone?: string
  emails?: string[]
  email?: string
  totalScore?: number            // rating
  reviewsCount?: number
  categoryName?: string
  city?: string
  street?: string
  [key: string]: unknown
}

export interface ApifyRunResult {
  runId: string
  datasetId: string
  items: ApifyRawLead[]
}

interface RunCreateResponse {
  data: { id: string; defaultDatasetId: string; status: string }
}

interface RunStatusResponse {
  data: { id: string; status: string; defaultDatasetId: string }
}

/**
 * Run an Apify actor and wait until it finishes, then fetch the dataset items.
 *
 * @param query    Google Maps search string (e.g., "почистване София")
 * @param language Apify language code ("bg", "ru", "uk", "en")
 * @param maxItems Cap on items the actor returns (cost control)
 */
export async function runGmapsActor(
  query: string,
  language: string,
  maxItems: number,
): Promise<ApifyRunResult> {
  const token = process.env.APIFY_TOKEN
  // lukaskrivka/crawler-google-places actively crawls each business's website
  // for contact emails — compass/google-maps-extractor only reads what's
  // already in the Gmaps profile, which BG SMBs don't fill in. We learned this
  // after 5 zero-email runs across locksmith/renovation/plastering/cleaning.
  const actor = process.env.APIFY_ACTOR_ID || 'lukaskrivka~crawler-google-places'
  if (!token) throw new Error('APIFY_TOKEN missing in environment')

  // Apify identifies actors as "user~actor"; URL-safe form uses "/" → "~"
  const actorPath = actor.replace(/\//g, '~')

  // Input shape varies by actor. compass/google-maps-extractor accepts:
  //   { searchStringsArray, language, maxCrawledPlacesPerSearch, ... }
  // The city is already in the query (e.g. "ключар Варна"), so we deliberately
  // do NOT set `locationQuery: 'Bulgaria'` — country-wide scoping previously
  // caused a 15+ min run with zero results before we aborted at $0.59.
  const input = {
    searchStringsArray: [query],
    language,
    maxCrawledPlacesPerSearch: maxItems,
    skipClosedPlaces: true,
    scrapeContacts: true,        // compass actor: extracts website + email
  }

  const startRes = await fetch(
    `${APIFY_BASE}/acts/${actorPath}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  )
  if (!startRes.ok) {
    const text = await startRes.text()
    throw new Error(`Apify start failed: ${startRes.status} ${text}`)
  }
  const startJson = (await startRes.json()) as RunCreateResponse
  const runId = startJson.data.id
  const datasetId = startJson.data.defaultDatasetId

  // Poll until terminal status. Cap at 15 minutes.
  const deadline = Date.now() + 15 * 60 * 1000
  let status = startJson.data.status
  while (status === 'READY' || status === 'RUNNING') {
    if (Date.now() > deadline) {
      throw new Error(`Apify run ${runId} did not finish within 15 minutes`)
    }
    await sleep(5_000)
    const statusRes = await fetch(
      `${APIFY_BASE}/actor-runs/${runId}?token=${token}`,
    )
    if (!statusRes.ok) {
      throw new Error(`Apify status check failed: ${statusRes.status}`)
    }
    const j = (await statusRes.json()) as RunStatusResponse
    status = j.data.status
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run ${runId} ended with status ${status}`)
  }

  const itemsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&clean=1`,
  )
  if (!itemsRes.ok) {
    throw new Error(`Apify dataset fetch failed: ${itemsRes.status}`)
  }
  const items = (await itemsRes.json()) as ApifyRawLead[]
  return { runId, datasetId, items }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
