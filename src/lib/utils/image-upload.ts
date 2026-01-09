import { createClient } from '@/lib/supabase/client'

/**
 * Compress and resize image before upload
 * Max width: 1200px, quality: 0.8 (80% JPEG quality)
 * This saves 80-90% storage space!
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      // Calculate dimensions (max 1200px width)
      const maxWidth = 1200
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        0.8 // 80% quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload task image to Supabase Storage
 * Returns public URL or null if failed
 */
export async function uploadTaskImage(
  taskId: string,
  userId: string,
  file: File,
  index?: number
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Use JPG, PNG, or WEBP.' }
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      return { url: null, error: 'File too large. Maximum 5MB allowed.' }
    }

    // Compress image
    const compressedBlob = await compressImage(file)

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/${taskId}${index !== undefined ? `-${index}` : ''}.${fileExt}`

    // Upload to Supabase
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('task-images')
      .upload(fileName, compressedBlob, {
        cacheControl: '31536000',
        upsert: true, // Replace if exists
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: 'Upload failed. Please try again.' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Upload error:', err)
    return { url: null, error: 'An unexpected error occurred.' }
  }
}

/**
 * Delete task image from Supabase Storage
 */
export async function deleteTaskImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('task-images') + 1).join('/')

    const { error } = await supabase.storage
      .from('task-images')
      .remove([filePath])

    return !error
  } catch (err) {
    console.error('Delete error:', err)
    return false
  }
}
