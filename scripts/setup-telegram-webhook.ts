/**
 * Setup Telegram Webhook
 *
 * Configures the Telegram Bot API webhook to receive updates
 * Run: npx tsx scripts/setup-telegram-webhook.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const botToken = process.env.TG_BOT_TOKEN;
const webhookSecret = process.env.TG_WEBHOOK_SECRET;
const webhookUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/telegram/webhook`
  : 'https://trudify.com/api/telegram/webhook';

if (!botToken) {
  console.error('❌ TG_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

async function setupWebhook() {
  if (!botToken) {
    console.error('❌ Bot token is not available');
    return;
  }

  console.log('🔧 Setting up Telegram webhook...\n');
  console.log(`Bot Token: ${botToken.substring(0, 10)}...`);
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log(`Secret Token: ${webhookSecret.substring(0, 5)}...\n`);

  try {
    // Set webhook
    const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: webhookSecret,
        allowed_updates: ['message'],
        drop_pending_updates: true
      })
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('📝 Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to set webhook');
      console.error('📝 Error:', JSON.stringify(result, null, 2));
      process.exit(1);
    }

    // Get webhook info to verify
    console.log('\n🔍 Verifying webhook info...\n');
    const getInfoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    const infoResponse = await fetch(getInfoUrl);
    const info = await infoResponse.json();

    if (info.ok) {
      console.log('✅ Webhook info:');
      console.log(JSON.stringify(info.result, null, 2));

      if (info.result.url === webhookUrl) {
        console.log('\n✅ Webhook is correctly configured!');
        console.log('\n📋 Next steps:');
        console.log('1. Add TG_WEBHOOK_SECRET to your .env.local file');
        console.log('2. Deploy to Vercel with the environment variables');
        console.log('3. Test the connection by sending /start to @Trudify_bot\n');
      }
    }

  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
