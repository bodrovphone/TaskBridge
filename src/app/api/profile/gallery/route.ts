/**
 * Gallery Upload API Route
 * POST - Upload gallery image
 * DELETE - Remove gallery image
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

/**
 * POST /api/profile/gallery
 * Upload gallery image to Supabase Storage
 *
 * Requires authentication
 * Accepts: multipart/form-data with 'image' file and 'index' number
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      console.log('[Gallery API] POST: No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[Gallery API] POST: User', authUser.id, 'uploading gallery image')

    // 2. Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const index = formData.get('index') as string

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // 3. Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, or WEBP.' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // 4. Upload to Supabase Storage
    const supabase = await createClient()

    // Generate unique filename: gallery/userId/gallery-index-timestamp.ext
    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const fileName = `gallery/${authUser.id}/gallery-${index || '0'}-${timestamp}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('task-images') // Using existing task-images bucket
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      console.error('[Gallery API] POST: Storage error:', error)
      return NextResponse.json(
        { error: 'Upload failed. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(data.path)

    const imageUrl = urlData.publicUrl

    console.log('[Gallery API] POST: Success - image uploaded for user', authUser.id)

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('[Gallery API] POST: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profile/gallery
 * Remove gallery image from Supabase Storage
 *
 * Requires authentication
 * Body: { imageUrl: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      console.log('[Gallery API] DELETE: No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('[Gallery API] DELETE: User', authUser.id, 'deleting gallery image')

    const supabase = await createClient()

    // 2. Verify the image belongs to this user (URL should contain their user ID)
    if (!imageUrl.includes(`gallery/${authUser.id}/`)) {
      console.warn('[Gallery API] DELETE: User tried to delete image they do not own')
      return NextResponse.json(
        { error: 'You can only delete your own images' },
        { status: 403 }
      )
    }

    // 3. Delete from storage
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf('task-images')
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/')

        const { error } = await supabase.storage.from('task-images').remove([filePath])

        if (error) {
          console.warn('[Gallery API] DELETE: Storage error:', error)
          // Continue anyway - file might already be deleted
        } else {
          console.log('[Gallery API] DELETE: Removed file from storage:', filePath)
        }
      }
    } catch (err) {
      console.warn('[Gallery API] DELETE: Failed to parse URL or remove file:', err)
      // Continue anyway
    }

    console.log('[Gallery API] DELETE: Success - image deleted for user', authUser.id)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('[Gallery API] DELETE: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
