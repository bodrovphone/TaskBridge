import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Auth] Logout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Auth] User logged out successfully')

    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    })
  } catch (error) {
    console.error('[Auth] Logout exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
