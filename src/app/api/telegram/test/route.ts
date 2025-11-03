/**
 * Telegram Test Endpoint
 * GET /api/telegram/test
 *
 * Tests:
 * 1. Environment variables
 * 2. Database connection
 * 3. Bot API access
 * 4. Webhook status
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  // 1. Check environment variables
  results.checks.envVars = {
    TG_BOT_TOKEN: !!process.env.TG_BOT_TOKEN,
    TG_BOT_USERNAME: !!process.env.TG_BOT_USERNAME,
    TG_WEBHOOK_SECRET: !!process.env.TG_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // 2. Check database connection
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('telegram_connection_tokens')
      .select('count')
      .limit(1)

    results.checks.database = {
      connected: !error,
      error: error?.message || null
    }
  } catch (err: any) {
    results.checks.database = {
      connected: false,
      error: err.message
    }
  }

  // 3. Check Bot API access
  if (process.env.TG_BOT_TOKEN) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/getMe`
      )
      const data = await response.json()

      results.checks.botApi = {
        accessible: data.ok,
        botUsername: data.result?.username || null,
        error: data.ok ? null : data.description
      }
    } catch (err: any) {
      results.checks.botApi = {
        accessible: false,
        error: err.message
      }
    }

    // 4. Check webhook status
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/getWebhookInfo`
      )
      const data = await response.json()

      results.checks.webhook = {
        configured: !!data.result?.url,
        url: data.result?.url || null,
        pendingUpdates: data.result?.pending_update_count || 0,
        lastError: data.result?.last_error_message || null,
        lastErrorDate: data.result?.last_error_date || null
      }
    } catch (err: any) {
      results.checks.webhook = {
        configured: false,
        error: err.message
      }
    }
  }

  // 5. Check recent tokens
  try {
    const supabase = await createClient()
    const { data: tokens } = await supabase
      .from('telegram_connection_tokens')
      .select('created_at, used, expires_at')
      .order('created_at', { ascending: false })
      .limit(5)

    results.checks.recentTokens = {
      count: tokens?.length || 0,
      tokens: tokens?.map(t => ({
        created: t.created_at,
        used: t.used,
        expired: new Date(t.expires_at) < new Date()
      }))
    }
  } catch (err: any) {
    results.checks.recentTokens = {
      error: err.message
    }
  }

  return NextResponse.json(results, { status: 200 })
}
