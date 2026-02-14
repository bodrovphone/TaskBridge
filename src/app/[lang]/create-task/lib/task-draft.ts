/**
 * localStorage helpers for persisting task form data across OAuth redirects.
 * When a guest user fills the create-task form and authenticates via OAuth,
 * the page redirects away. We save form data here so it can be restored
 * and auto-submitted after the OAuth callback redirects back.
 */

const STORAGE_KEY = 'trudify_pending_task'
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

interface PendingTaskDraft {
  data: Record<string, unknown>
  savedAt: number
}

export function savePendingTask(formData: Record<string, unknown>): void {
  try {
    // Strip non-serializable fields (File objects, etc.)
    const serializable = { ...formData }
    delete serializable.photoFiles
    delete serializable.photoFile
    delete serializable.imageOversized

    const draft: PendingTaskDraft = {
      data: serializable,
      savedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    console.error('[task-draft] Failed to save pending task to localStorage')
  }
}

export function loadPendingTask(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const draft: PendingTaskDraft = JSON.parse(raw)

    // Check expiry
    if (Date.now() - draft.savedAt > EXPIRY_MS) {
      clearPendingTask()
      return null
    }

    return draft.data
  } catch {
    console.error('[task-draft] Failed to load pending task from localStorage')
    return null
  }
}

export function clearPendingTask(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}
