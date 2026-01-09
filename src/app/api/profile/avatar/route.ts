/**
 * Avatar Upload API Route
 * POST - Upload new avatar
 * DELETE - Remove custom avatar (falls back to OAuth avatar)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

/**
 * POST /api/profile/avatar
 * Upload user avatar to Supabase Storage
 *
 * Requires authentication
 * Accepts: multipart/form-data with 'avatar' file
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      console.log('[Avatar API] POST: No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[Avatar API] POST: User', authUser.id, 'uploading avatar')

    // 2. Parse form data
    const formData = await request.formData()
    const avatarFile = formData.get('avatar') as File

    if (!avatarFile) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      )
    }

    // 3. Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(avatarFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, or WEBP.' },
        { status: 400 }
      )
    }

    // File size already validated client-side, but double-check
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    if (avatarFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 2MB allowed.' },
        { status: 400 }
      )
    }

    // 4. Upload to Supabase Storage
    const supabase = await createClient()

    // Generate unique filename: avatars/userId/avatar-timestamp.ext
    const fileExt = avatarFile.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const fileName = `avatars/${authUser.id}/avatar-${timestamp}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('task-images') // Using existing task-images bucket
      .upload(fileName, buffer, {
        contentType: avatarFile.type,
        cacheControl: '31536000',
        upsert: false, // Don't overwrite - we use unique names
      })

    if (error) {
      console.error('[Avatar API] POST: Storage error:', error)
      return NextResponse.json(
        { error: 'Upload failed. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(data.path)

    const avatarUrl = urlData.publicUrl

    // 6. Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    if (updateError) {
      console.error('[Avatar API] POST: Database update error:', updateError)
      // Try to clean up uploaded file
      await supabase.storage.from('task-images').remove([data.path])

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('[Avatar API] POST: Success - avatar uploaded for user', authUser.id)

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully',
    })
  } catch (error) {
    console.error('[Avatar API] POST: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profile/avatar
 * Remove custom avatar (falls back to OAuth avatar if available)
 *
 * Requires authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      console.log('[Avatar API] DELETE: No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[Avatar API] DELETE: User', authUser.id, 'removing avatar')

    const supabase = await createClient()

    // 2. Get current avatar URL
    const { data: user } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', authUser.id)
      .single()

    const currentAvatarUrl = user?.avatar_url

    // 3. Delete avatar file from storage if exists
    if (currentAvatarUrl) {
      try {
        // Extract path from URL
        const url = new URL(currentAvatarUrl)
        const pathParts = url.pathname.split('/')
        // Path will be like: /storage/v1/object/public/task-images/avatars/userId/avatar-123.jpg
        const bucketIndex = pathParts.indexOf('task-images')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')

          await supabase.storage.from('task-images').remove([filePath])
          console.log('[Avatar API] DELETE: Removed file from storage:', filePath)
        }
      } catch (err) {
        console.warn('[Avatar API] DELETE: Failed to remove file from storage:', err)
        // Continue anyway - file might not exist
      }
    }

    // 4. Update user profile (set avatar_url to null)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    if (updateError) {
      console.error('[Avatar API] DELETE: Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('[Avatar API] DELETE: Success - avatar removed for user', authUser.id)

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    })
  } catch (error) {
    console.error('[Avatar API] DELETE: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
