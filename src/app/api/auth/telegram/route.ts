/**
 * Telegram Authentication API Route
 *
 * Handles user authentication via Telegram Login Widget
 * Creates new user profile if first-time login, or signs in existing user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTelegramAuth, formatTelegramUser } from '@/lib/auth/telegram';
import { sendTemplatedNotification } from '@/lib/services/telegram-notification';
import type { TelegramUserData } from '@telegram-auth/server';

export async function POST(request: NextRequest) {
  try {
    const authData: TelegramUserData = await request.json();

    // Verify Telegram authentication data
    const botToken = process.env.TG_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: 'Telegram bot token not configured' },
        { status: 500 }
      );
    }

    const isValid = await verifyTelegramAuth(authData, botToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Telegram authentication data' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists with this telegram_id
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', authData.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingUser) {
      // User exists - update last login and return user data
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          ...formatTelegramUser(authData),
          preferred_notification_channel: existingUser.preferred_notification_channel || 'telegram',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        isNewUser: false,
      });
    }

    // User doesn't exist - create new user profile
    const fullName = [authData.first_name, authData.last_name]
      .filter(Boolean)
      .join(' ');

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        ...formatTelegramUser(authData),
        preferred_notification_channel: 'telegram',
        role: 'customer', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Send welcome notification to new user
    try {
      await sendTemplatedNotification(
        newUser.id,
        'welcome',
        authData.first_name // Use their first name for personalization
      );
      console.log('Welcome notification sent to new user:', newUser.id);
    } catch (notifError) {
      // Don't fail the registration if notification fails
      console.error('Failed to send welcome notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      isNewUser: true,
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
