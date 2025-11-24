import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[Auth] Login error:', error)

      // User-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to sign in. Please try again.' },
        { status: 401 }
      )
    }

    console.log('[Auth] User logged in successfully:', {
      userId: data.user.id,
      email: data.user.email,
    })

    // Fetch user profile to return complete data
    let userProfile = null
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      userProfile = profile
    } catch (err) {
      console.error('[Auth] Failed to fetch user profile:', err)
    }

    return NextResponse.json({
      success: true,
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('[Auth] Login exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
