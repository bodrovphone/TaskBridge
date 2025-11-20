/**
 * Test Script for Telegram Notifications
 *
 * Usage: npx tsx scripts/test-telegram-notification.ts <user_id>
 *
 * This script sends a test notification to a user who has authenticated with Telegram
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const USER_ID = process.argv[2];

if (!USER_ID) {
  console.error('❌ Please provide a user ID as an argument');
  console.error('Usage: npx tsx scripts/test-telegram-notification.ts <user_id>');
  process.exit(1);
}

async function testNotification() {
  console.log('🚀 Testing Telegram Notification...\n');
  console.log(`📋 User ID: ${USER_ID}`);
  console.log(`🤖 Bot Token: ${process.env.TG_BOT_TOKEN?.substring(0, 20) || 'undefined'}...`);

  if (!process.env.TG_BOT_TOKEN) {
    console.error('❌ TG_BOT_TOKEN not found in .env.local');
    console.error('💡 Make sure .env.local exists and contains TG_BOT_TOKEN');
    process.exit(1);
  }

  console.log('');

  try {
    // Send test notification using the API
    const response = await fetch('http://localhost:3000/api/notifications/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: USER_ID,
        message: '🎉 <b>Test Notification</b>\n\nThis is a test message from Trudify!\n\nIf you received this, your Telegram notifications are working perfectly! ✅',
        notificationType: 'test',
        parseMode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send notification:', data.error);
      process.exit(1);
    }

    console.log('✅ Notification sent successfully!');
    console.log(`📨 Telegram Message ID: ${data.messageId}`);
    console.log('');
    console.log('💡 Check your Telegram app for the notification!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('💡 Connection refused - Make sure your dev server is running:');
      console.error('   npm run dev');
      console.error('');
      console.error('   Then run this script again in another terminal.');
    }

    process.exit(1);
  }
}

testNotification();
