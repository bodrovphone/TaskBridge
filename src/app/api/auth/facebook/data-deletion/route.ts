/**
 * Facebook Data Deletion Callback
 * Called by Facebook when a user removes the app from their Facebook settings
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface FacebookSignedRequest {
  user_id: string
  algorithm: string
  issued_at: number
}

/**
 * Parse and verify Facebook signed_request
 * @see https://developers.facebook.com/docs/games/gamesonfacebook/login#parsing-signed-request
 */
function parseSignedRequest(signedRequest: string, appSecret: string): FacebookSignedRequest | null {
  try {
    const [encodedSig, payload] = signedRequest.split('.')

    if (!encodedSig || !payload) {
      console.error('Invalid signed_request format')
      return null
    }

    // Decode signature (base64url to buffer)
    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

    // Decode payload (base64url to JSON)
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    ) as FacebookSignedRequest

    // Verify algorithm
    if (data.algorithm?.toUpperCase() !== 'HMAC-SHA256') {
      console.error('Unknown algorithm:', data.algorithm)
      return null
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest()

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      console.error('Signature verification failed')
      return null
    }

    return data
  } catch (error) {
    console.error('Error parsing signed_request:', error)
    return null
  }
}

/**
 * Generate a unique confirmation code for tracking
 */
function generateConfirmationCode(): string {
  return `DEL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get Facebook App Secret
    const appSecret = process.env.FACEBOOK_APP_SECRET

    if (!appSecret) {
      console.error('FACEBOOK_APP_SECRET not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // 2. Parse form data (Facebook sends as application/x-www-form-urlencoded)
    const formData = await request.formData()
    const signedRequest = formData.get('signed_request') as string

    if (!signedRequest) {
      return NextResponse.json(
        { error: 'Missing signed_request' },
        { status: 400 }
      )
    }

    // 3. Parse and verify the signed request
    const fbData = parseSignedRequest(signedRequest, appSecret)

    if (!fbData) {
      return NextResponse.json(
        { error: 'Invalid signed_request' },
        { status: 400 }
      )
    }

    const facebookUserId = fbData.user_id

    // 4. Find user by Facebook identity
    const supabaseAdmin = createAdminClient()

    // Look up user in auth.identities by provider_id
    const { data: identities, error: identityError } = await supabaseAdmin
      .from('auth.identities')
      .select('user_id')
      .eq('provider', 'facebook')
      .eq('provider_id', facebookUserId)

    // If no direct access to auth.identities, try through auth admin API
    let userId: string | null = null

    if (identityError || !identities?.length) {
      // Alternative: List users and find by identity
      // This is less efficient but works if we can't query auth.identities directly
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      if (!listError && users) {
        for (const authUser of users) {
          const fbIdentity = authUser.identities?.find(
            (i) => i.provider === 'facebook' && i.id === facebookUserId
          )
          if (fbIdentity) {
            userId = authUser.id
            break
          }
        }
      }
    } else {
      userId = identities[0].user_id
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode()

    // If user found, perform deletion
    if (userId) {
      // Check for blockers first
      const { data: blockersResult } = await supabaseAdmin
        .rpc('check_account_deletion_blockers', { p_user_id: userId })

      // If user has active tasks, we still need to comply with Facebook's request
      // Log this situation and proceed with deletion (Facebook requires it)
      if (blockersResult && !blockersResult.can_delete) {
        console.warn(`Facebook deletion request for user with active tasks: ${userId}`, blockersResult.blockers)
        // In production, you might want to notify the user via email
      }

      // Get user info for audit
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single()

      // Execute deletion
      const { error: deletionError } = await supabaseAdmin
        .rpc('delete_user_account', {
          p_user_id: userId,
          p_deletion_method: 'facebook_callback'
        })

      if (deletionError) {
        console.error('Facebook deletion - database error:', deletionError)
      }

      // Delete avatar from storage
      if (userData?.avatar_url) {
        try {
          const avatarUrl = userData.avatar_url
          const pathMatch = avatarUrl.match(/\/avatars\/(.+)$/)
          if (pathMatch) {
            await supabaseAdmin.storage.from('avatars').remove([pathMatch[1]])
          }
        } catch (e) {
          console.error('Facebook deletion - avatar cleanup error:', e)
        }
      }

      // Delete from Supabase Auth
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authDeleteError) {
        console.error('Facebook deletion - auth delete error:', authDeleteError)
      }

      console.log(`Facebook data deletion completed for user ${userId}, code: ${confirmationCode}`)
    } else {
      // User not found - still return success per Facebook requirements
      // The user may have already been deleted or never existed
      console.log(`Facebook data deletion request for unknown user ${facebookUserId}, code: ${confirmationCode}`)
    }

    // 5. Return response per Facebook's specification
    // URL should point to a page where user can check deletion status
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trudify.bg'
    const statusUrl = `${baseUrl}/account/deletion-status?code=${confirmationCode}`

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    })
  } catch (error) {
    console.error('POST /api/auth/facebook/data-deletion error:', error)

    // Even on error, try to return a valid response for Facebook
    const confirmationCode = generateConfirmationCode()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trudify.bg'

    return NextResponse.json({
      url: `${baseUrl}/account/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    })
  }
}
