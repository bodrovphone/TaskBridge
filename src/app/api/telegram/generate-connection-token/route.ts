/**
 * Generate Telegram Connection Token API
 *
 * Creates a secure temporary token for connecting Telegram account to user profile.
 * Token expires in 15 minutes and can only be used once.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    console.log('[Telegram Token] Request for userId:', userId);

    if (!userId) {
      console.error('[Telegram Token] No userId provided');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[Telegram Token] User not found:', userId, userError);
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      );
    }

    console.log('[Telegram Token] User verified:', user.id);

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Store token in database
    const { error: insertError } = await supabase
      .from('telegram_connection_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('[Telegram Token] Error storing token:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate token', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('[Telegram Token] Token generated successfully');
    return NextResponse.json({ token });

  } catch (error) {
    console.error('Error generating connection token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
