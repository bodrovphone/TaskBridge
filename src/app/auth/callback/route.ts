import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { createNotification } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Check if this is a new user (account just created)
    if (data?.user && !error) {
      // Check if user has notifications (if not, it's a new user)
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user.id)

      // Send welcome notification for new users
      if (count === 0) {
        await createNotification({
          userId: data.user.id,
          type: 'welcome_message',
          templateData: {
            userName: data.user.user_metadata?.full_name || 'there',
          },
          actionUrl: '/browse-tasks', // Link to quick guide (can be changed later)
          deliveryChannel: 'both', // Welcome via Telegram + in-app
        })
      }
    }
  }

  // Redirect to home page
  // @todo FUTURE: Add OAuth redirect support when implementing Google/Facebook login
  return NextResponse.redirect(`${origin}/en`)
}
