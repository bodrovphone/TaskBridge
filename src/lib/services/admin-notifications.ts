/**
 * Admin Notification Service
 *
 * Sends Telegram notifications to admin for key events:
 * - New user registration
 * - New task creation
 *
 * Uses the same Telegram Bot API as user notifications,
 * but sends directly to admin's Telegram ID.
 */

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID
const BOT_TOKEN = process.env.TG_BOT_TOKEN

interface NewUserData {
  fullName?: string
  provider?: string // 'email' | 'google' | 'facebook' | 'telegram'
  intent?: 'professional' | 'customer' // registration intent
}

interface NewTaskData {
  title: string
  category: string
  city: string
  customerName?: string
}

/**
 * Send a Telegram message to admin
 * Non-blocking, logs errors but doesn't throw
 */
async function sendToAdmin(message: string): Promise<void> {
  if (!ADMIN_TELEGRAM_ID || !BOT_TOKEN) {
    console.log('[Admin] Telegram admin notifications not configured')
    return
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Admin] Failed to send Telegram notification:', error)
    }
  } catch (error) {
    console.error('[Admin] Error sending Telegram notification:', error)
  }
}

/**
 * Notify admin when a new user registers
 * Fully wrapped in try/catch - never throws
 */
export async function notifyAdminNewUser(user: NewUserData): Promise<void> {
  try {
    const providerLabel = {
      email: 'Email/Password',
      google: 'Google',
      facebook: 'Facebook',
      telegram: 'Telegram',
    }[user.provider || 'email'] || user.provider || 'Unknown'

    const time = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Sofia',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const intentLabel = user.intent === 'professional' ? 'Professional' : user.intent === 'customer' ? 'Customer' : 'Unknown'

    const message = `<b>New User Registered</b>

<b>Name:</b> ${user.fullName || 'Not provided'}
<b>Intent:</b> ${intentLabel}
<b>Method:</b> ${providerLabel}
<b>Time:</b> ${time}`

    await sendToAdmin(message)
  } catch (error) {
    console.error('[Admin] Error in notifyAdminNewUser:', error)
  }
}

/**
 * Notify admin when a new task is created
 * Fully wrapped in try/catch - never throws
 */
export async function notifyAdminNewTask(task: NewTaskData): Promise<void> {
  try {
    const time = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Sofia',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const message = `<b>New Task Created</b>

<b>Title:</b> ${task.title}
<b>Category:</b> ${task.category}
<b>City:</b> ${task.city}
<b>Posted by:</b> ${task.customerName || 'Unknown'}
<b>Time:</b> ${time}`

    await sendToAdmin(message)
  } catch (error) {
    console.error('[Admin] Error in notifyAdminNewTask:', error)
  }
}
