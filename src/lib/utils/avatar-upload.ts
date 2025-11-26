/**
 * Avatar Upload Utility
 * Handles user avatar uploads with compression and optimization
 */

/**
 * Compress and resize avatar image
 * Max size: 400x400px (avatars don't need to be large)
 * Quality: 0.9 (90% for profile photos)
 */
async function compressAvatar(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      // Square crop (center)
      const size = Math.min(img.width, img.height)
      const x = (img.width - size) / 2
      const y = (img.height - size) / 2

      // Target size: 400x400px
      const targetSize = 400
      canvas.width = targetSize
      canvas.height = targetSize

      // Draw cropped and resized image
      ctx.drawImage(img, x, y, size, size, 0, 0, targetSize, targetSize)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        0.9 // 90% quality for profile photos
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Authenticated fetch type for API calls
 */
type AuthenticatedFetch = (url: string, options?: RequestInit) => Promise<Response>

/**
 * Upload user avatar via API
 * Returns avatar URL or null if failed
 *
 * Note: This calls our API route which handles authentication and upload
 */
export async function uploadAvatar(
  file: File,
  authenticatedFetch: AuthenticatedFetch
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Use JPG, PNG, or WEBP.' }
    }

    // Validate file size (2MB max for avatars)
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    if (file.size > MAX_SIZE) {
      return { url: null, error: 'File too large. Maximum 2MB allowed.' }
    }

    // Compress avatar
    const compressedBlob = await compressAvatar(file)

    // Create form data
    const formData = new FormData()
    formData.append('avatar', compressedBlob, file.name)

    // Upload via API route
    const response = await authenticatedFetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      return { url: null, error: error.message || 'Upload failed' }
    }

    const data = await response.json()
    return { url: data.avatarUrl, error: null }
  } catch (err) {
    console.error('[Avatar Upload] Error:', err)
    return { url: null, error: 'An unexpected error occurred.' }
  }
}

/**
 * Delete user avatar via API
 */
export async function deleteAvatar(
  authenticatedFetch: AuthenticatedFetch
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await authenticatedFetch('/api/profile/avatar', {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message || 'Delete failed' }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Avatar Delete] Error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Get user's display avatar URL with priority logic
 * 1. Custom avatar (avatarUrl) - highest priority
 * 2. OAuth avatar (oauthAvatarUrl) - fallback
 * 3. null - will show default/initials
 */
export function getDisplayAvatarUrl(
  avatarUrl: string | null,
  oauthAvatarUrl?: string | null
): string | null {
  // Custom avatar takes priority
  if (avatarUrl) return avatarUrl

  // Fallback to OAuth avatar
  if (oauthAvatarUrl) return oauthAvatarUrl

  // No avatar available
  return null
}
