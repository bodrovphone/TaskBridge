# Supabase Client Setup for Next.js App Router

## Overview

This guide shows how to configure Supabase client for Next.js 15 App Router with proper server/client separation and TypeScript support.

---

## Client Configuration

### 1. Create Supabase Utilities

Create `/src/lib/supabase/` directory with separate clients for different contexts:

```typescript
// /src/lib/supabase/client.ts (Client Components)
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// /src/lib/supabase/server.ts (Server Components & API Routes)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}
```

```typescript
// /src/lib/supabase/middleware.ts (Middleware)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}
```

### 2. Generate TypeScript Types

Generate TypeScript types from your Supabase schema:

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types
npx supabase gen types typescript --linked > src/types/supabase.ts
```

This creates `src/types/supabase.ts` with full type safety:
```typescript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          // ... all your table fields
        }
        Insert: {
          id?: string
          email?: string | null
          // ...
        }
        Update: {
          id?: string
          email?: string | null
          // ...
        }
      }
      // ... all your tables
    }
  }
}
```

### 3. Update Middleware

Update `/middleware.ts` to refresh Supabase session:

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { i18nMiddleware } from '@/lib/middleware/i18n'

export async function middleware(request: NextRequest) {
  // First, update Supabase session
  const supabaseResponse = await updateSession(request)

  // Then, apply i18n middleware
  return i18nMiddleware(supabaseResponse || request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Usage Examples

### Client Component Example

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return
      }

      setTasks(data || [])
    }

    fetchTasks()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          setTasks((current) => [payload.new, ...current])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

### Server Component Example

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      customer:users!customer_id(*),
      professional:users!selected_professional_id(*),
      applications(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !task) {
    return <div>Task not found</div>
  }

  return (
    <div>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <p>Posted by: {task.customer.full_name}</p>
    </div>
  )
}
```

### API Route Example

```typescript
// /app/api/tasks/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Create task
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...body,
      customer_id: user.id,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'open'

  const { data, error } = await supabase
    .from('tasks')
    .select('*, customer:users!customer_id(*)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### Authentication Example

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  async function handleSignUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Sign up error:', error)
      return
    }

    console.log('User created:', data.user)
  }

  async function handleSignIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      return
    }

    console.log('User signed in:', data.user)
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google sign in error:', error)
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

### OAuth Callback Handler

```typescript
// /app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home or dashboard
  return NextResponse.redirect(`${requestUrl.origin}/en`)
}
```

### File Upload Example

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function AvatarUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      console.log('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

---

## React Query Integration

For better data management, integrate with TanStack Query:

```typescript
// /src/lib/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useTasks(status: string = 'open') {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tasks', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, customer:users!customer_id(*)')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useCreateTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTask: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          customer_id: user.id,
          status: 'open',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

---

## Environment Variables Checklist

Make sure these are set in:
- `.env.local` (local development)
- Vercel project settings (production)

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Optional (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Keep secret!

# Optional (for direct database access)
DATABASE_URL=postgresql://postgres:...
```

---

## Next Steps

1. **Implement authentication flow** - Sign up, sign in, OAuth
2. **Create API routes** - For complex operations
3. **Add real-time features** - Live task updates, notifications
4. **Implement file uploads** - Task images, avatars
5. **Add server-side validation** - Protect against malicious data

---

**Document Version:** 1.0
**Last Updated:** October 24, 2024
