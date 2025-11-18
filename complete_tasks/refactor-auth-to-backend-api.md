# Refactor Authentication to Use Backend API

## Task Description
Refactor authentication flow to use backend API routes instead of direct Supabase client calls from the frontend. This improves security, enables rate limiting control, allows business logic injection, and prevents exposing Supabase implementation details to the client.

## Current Problem

**Frontend directly calls Supabase:**
```typescript
// ❌ Current: Direct Supabase call from frontend
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } }
})
```

**Issues:**
- ❌ Exposes Supabase URL to client (`nyleceedixybtogrwilv.supabase.co`)
- ❌ Can't customize rate limiting (stuck with Supabase defaults)
- ❌ Can't add business logic (welcome emails, analytics, etc.)
- ❌ Error messages leak implementation details
- ❌ No centralized logging/monitoring
- ❌ Harder to switch auth providers in future

## Requirements

### 1. Create Backend Auth API Routes

**Location:** `/src/app/api/auth/`

#### A. Signup Endpoint
**Route:** `POST /api/auth/signup`

```typescript
// /src/app/api/auth/signup/route.ts
export async function POST(request: Request) {
  const { email, password, fullName } = await request.json()

  // Validation
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Custom rate limiting (Redis or database-based)
  // ... check rate limit per IP/email ...

  // Create user in Supabase
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    // Log error internally
    console.error('[Auth] Signup error:', error)

    // Return user-friendly error
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 400 }
    )
  }

  // Create profile in users table
  // Send analytics event
  // Log signup

  return NextResponse.json({
    success: true,
    message: 'Account created! Please check your email to verify.'
  })
}
```

#### B. Login Endpoint
**Route:** `POST /api/auth/login`

```typescript
// /src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}
```

#### C. Logout Endpoint
**Route:** `POST /api/auth/logout`

```typescript
// /src/app/api/auth/logout/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
```

#### D. Resend Verification Email
**Route:** `POST /api/auth/resend-verification`

```typescript
// /src/app/api/auth/resend-verification/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Custom rate limiting: 3 emails per hour
  // ... check rate limit ...

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email!
  })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Verification email sent!'
  })
}
```

### 2. Update Frontend to Use API Routes

**Update:** `/src/features/auth/hooks/use-auth.ts`

```typescript
// ✅ New: API call instead of direct Supabase
const signUp = async (
  email: string,
  password: string,
  fullName?: string
): Promise<{ error: string | null }> => {
  try {
    setError(null)

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error)
      return { error: data.error }
    }

    return { error: null }
  } catch (err) {
    const message = 'Failed to sign up. Please try again.'
    setError(message)
    return { error: message }
  }
}

const signIn = async (
  email: string,
  password: string
): Promise<{ error: string | null }> => {
  try {
    setError(null)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error)
      return { error: data.error }
    }

    return { error: null }
  } catch (err) {
    const message = 'Failed to sign in. Please try again.'
    setError(message)
    return { error: message }
  }
}
```

### 3. Add Custom Rate Limiting

**Option A: Simple In-Memory (Development)**
```typescript
// /src/lib/utils/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string, // IP or email
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    })
    return { allowed: true }
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    }
  }

  record.count++
  return { allowed: true }
}
```

**Option B: Redis (Production)**
```typescript
// Use Vercel KV or Upstash Redis
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `rate_limit:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }

  if (count > maxAttempts) {
    const ttl = await redis.ttl(key)
    return { allowed: false, retryAfter: ttl }
  }

  return { allowed: true }
}
```

### 4. Add Logging and Monitoring

```typescript
// /src/lib/utils/auth-logger.ts
export function logAuthEvent(event: {
  type: 'signup' | 'login' | 'logout' | 'resend_verification'
  email?: string
  ip?: string
  success: boolean
  error?: string
}) {
  // Log to console (or external service like LogTail, Sentry)
  console.log('[Auth]', {
    ...event,
    timestamp: new Date().toISOString()
  })

  // Could also send to analytics, monitoring services
}
```

## Acceptance Criteria

- [ ] Signup API route created (`POST /api/auth/signup`)
- [ ] Login API route created (`POST /api/auth/login`)
- [ ] Logout API route created (`POST /api/auth/logout`)
- [ ] Resend verification API route created (`POST /api/auth/resend-verification`)
- [ ] Frontend `useAuth` hook updated to use API routes
- [ ] Custom rate limiting implemented (in-memory or Redis)
- [ ] Auth events logged for monitoring
- [ ] Error messages are user-friendly (don't leak implementation)
- [ ] All direct Supabase calls removed from frontend
- [ ] Email redirect URL configured correctly
- [ ] Tests pass with new API routes
- [ ] No Supabase URLs exposed in browser network tab

## Technical Notes

### Benefits of This Approach

**Security:**
- ✅ Supabase details hidden from client
- ✅ Custom rate limiting per IP/email
- ✅ Centralized auth logic
- ✅ Can add CAPTCHA, fraud detection, etc.

**Business Logic:**
- ✅ Send welcome emails on signup
- ✅ Track analytics events
- ✅ Create user profiles automatically
- ✅ Send notifications to admins

**Flexibility:**
- ✅ Easy to switch auth providers later
- ✅ Can implement custom auth flows
- ✅ Better error handling and logging
- ✅ Easier to test and mock

### Rate Limit Recommendations

```
Signup: 5 attempts per hour per IP
Login: 10 attempts per 15 minutes per IP
Resend verification: 3 emails per hour per user
Password reset: 5 requests per hour per email
```

### Email Redirect URL

Set this in the signup API:

```typescript
options: {
  emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
}
```

This ensures emails redirect to `/auth/callback` instead of homepage.

## Priority
High - Important for security, scalability, and better error handling

## Notes
- This is a breaking change - update all auth-related frontend code
- Test thoroughly before deploying to production
- Consider adding CAPTCHA for additional bot protection
- Monitor rate limit effectiveness in production
- Keep Supabase service role key secret (server-only!)
