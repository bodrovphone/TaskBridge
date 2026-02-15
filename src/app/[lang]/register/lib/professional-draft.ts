/**
 * localStorage helpers for persisting professional registration data across OAuth redirects.
 * When a professional fills their info (title, categories, city) and authenticates via OAuth,
 * the page redirects away. We save the data here so it can be restored
 * and applied to the profile after the OAuth callback redirects back.
 */

const STORAGE_KEY = 'trudify_pending_professional'
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface PendingProfessionalData {
  professionalTitle: string
  serviceCategories: string[]
  city: string
}

interface PendingProfessionalDraft {
  data: PendingProfessionalData
  savedAt: number
}

export function savePendingProfessional(data: PendingProfessionalData): void {
  try {
    const draft: PendingProfessionalDraft = {
      data,
      savedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    console.error('[professional-draft] Failed to save pending professional to localStorage')
  }
}

export function loadPendingProfessional(): PendingProfessionalData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const draft: PendingProfessionalDraft = JSON.parse(raw)

    // Check expiry
    if (Date.now() - draft.savedAt > EXPIRY_MS) {
      clearPendingProfessional()
      return null
    }

    return draft.data
  } catch {
    console.error('[professional-draft] Failed to load pending professional from localStorage')
    return null
  }
}

export function clearPendingProfessional(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}
