# Supabase Authentication Implementation Plan

## Overview

This plan implements Supabase authentication following the **Universal Backend Architecture** principles from `/docs/architecture/universal-backend-architecture.md`.

---

## 🎯 Key Principle: Separation of Concerns

### Supabase Handles:
- ✅ Authentication (login, signup, OAuth)
- ✅ Session management (cookies, JWT tokens)
- ✅ Password resets, email verification
- ✅ Social logins (Google, Facebook)

### We Handle (Business Logic):
- ✅ User profile creation in our `users` table
- ✅ User role management (customer, professional, both)
- ✅ Business rules (verification requirements, etc.)
- ✅ User onboarding flow

---

## 📋 Authentication Flow

### 1. **Sign Up Flow** (Client → Supabase → Our API)

```
User fills form (client)
    ↓
Supabase Auth: Create auth user (client-side via Supabase client)
    ↓
Supabase triggers: Database trigger creates profile (OR)
    ↓
Our API endpoint: Create user profile with business logic
    ↓
User redirected to dashboard
```

### 2. **Sign In Flow** (Client → Supabase → Middleware)

```
User enters credentials (client)
    ↓
Supabase Auth: Verify credentials (client-side)
    ↓
Session cookie set
    ↓
Middleware: Refresh session on each request
    ↓
User authenticated ✅
```

### 3. **OAuth Flow** (Google/Facebook)

```
User clicks "Sign in with Google" (client)
    ↓
Supabase Auth: OAuth redirect
    ↓
User authorizes on Google
    ↓
Redirect to /auth/callback
    ↓
Exchange code for session
    ↓
Create user profile if first login
    ↓
Redirect to dashboard
```

---

## 🏗️ Architecture Following Universal Backend Pattern

### Directory Structure

```
/src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── profile/route.ts          # Create/sync user profile
│   │       └── session/route.ts          # Get current user session
│   └── auth/
│       └── callback/route.ts             # OAuth callback (already exists)
│
├── server/                               # ⭐ Universal Backend
│   ├── domain/
│   │   └── user/
│   │       ├── user.entity.ts            # User domain entity
│   │       ├── user.types.ts             # Domain types
│   │       └── user.rules.ts             # Business rules
│   │
│   ├── application/
│   │   └── auth/
│   │       ├── auth.service.ts           # Authentication use cases
│   │       ├── create-user-profile.usecase.ts
│   │       └── sync-auth-user.usecase.ts
│   │
│   └── infrastructure/
│       └── supabase/
│           ├── supabase-auth.adapter.ts  # Supabase auth wrapper
│           └── user.repository.ts        # User data access
│
└── features/
    └── auth/
        ├── components/
        │   ├── sign-in-form.tsx          # Sign in UI
        │   ├── sign-up-form.tsx          # Sign up UI
        │   └── auth-provider.tsx         # Auth context provider
        └── hooks/
            └── use-auth.ts               # Auth hooks for components
```

---

## 🔧 API Endpoints Needed

### **Option A: Minimal (Recommended for MVP)**

**ONE API endpoint** that handles profile sync:

```
POST /api/auth/profile
```

**Purpose**: Create or update user profile after Supabase auth

**When called**:
- After successful signup
- After OAuth login (first time)
- Manual profile sync if needed

**Why one endpoint?**
- Login/logout handled by Supabase client (no API needed)
- Signup handled by Supabase client (no API needed)
- Only need API for syncing our business data

### **Option B: Comprehensive (For Future)**

Three separate endpoints:

```
POST /api/auth/signup       # Business logic after signup
POST /api/auth/signin       # Business logic after signin (e.g., logging)
POST /api/auth/signout      # Business logic before signout (e.g., cleanup)
```

**When to use**: If you need custom business logic for each auth operation

---

## 🎯 Recommendation: Start with Option A (One Endpoint)

### Why?

1. **Supabase handles auth** - No need to duplicate functionality
2. **Simpler** - Less code to maintain
3. **Follows DRY** - Don't repeat what Supabase already does
4. **Scalable** - Can add more endpoints later if needed

---

## 📝 Implementation Steps

### Phase 1: Domain Layer (Business Logic)

#### 1. User Entity (`/server/domain/user/user.entity.ts`)

```typescript
// Pure business logic, no framework dependencies

export class User {
  constructor(
    public id: string,
    public email: string,
    public fullName: string | null,
    public userType: UserType,
    public isPhoneVerified: boolean,
    public isEmailVerified: boolean,
    public createdAt: Date
  ) {}

  // Business rules
  canCreateTask(): boolean {
    // Must be verified customer
    return this.userType === 'customer' && this.isEmailVerified
  }

  canApplyToTask(): boolean {
    // Must be verified professional
    return (
      (this.userType === 'professional' || this.userType === 'both') &&
      this.isEmailVerified &&
      this.isPhoneVerified
    )
  }

  upgradeToProf professional(): void {
    if (this.userType === 'customer') {
      this.userType = 'both'
    } else if (this.userType === 'professional') {
      // Already professional
      return
    }
  }
}

export type UserType = 'customer' | 'professional' | 'both'
```

#### 2. User Types (`/server/domain/user/user.types.ts`)

```typescript
export interface CreateUserProfileDto {
  authUserId: string  // From Supabase auth.users.id
  email: string
  fullName?: string
  userType?: 'customer' | 'professional'
  phoneNumber?: string
}

export interface UpdateUserProfileDto {
  fullName?: string
  city?: string
  bio?: string
  // ... other profile fields
}
```

#### 3. User Rules (`/server/domain/user/user.rules.ts`)

```typescript
export class UserBusinessRules {
  static validateProfileCreation(dto: CreateUserProfileDto): Result<void, Error> {
    // Validate email format
    if (!this.isValidEmail(dto.email)) {
      return Result.error(new ValidationError('Invalid email format'))
    }

    // Validate full name (if provided)
    if (dto.fullName && dto.fullName.length < 2) {
      return Result.error(new ValidationError('Full name too short'))
    }

    return Result.ok()
  }

  static canUpgradeToProfessional(user: User): Result<void, Error> {
    if (!user.isEmailVerified) {
      return Result.error(new BusinessError('Email must be verified first'))
    }

    if (!user.isPhoneVerified) {
      return Result.error(new BusinessError('Phone must be verified first'))
    }

    return Result.ok()
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

---

### Phase 2: Application Layer (Use Cases)

#### 1. Auth Service (`/server/application/auth/auth.service.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import { User } from '@/server/domain/user/user.entity'
import { UserBusinessRules } from '@/server/domain/user/user.rules'

export class AuthService {
  constructor(
    private userRepository: UserRepository
  ) {}

  async createOrSyncUserProfile(authUserId: string): Promise<Result<User, Error>> {
    try {
      // 1. Get auth user from Supabase
      const supabase = await createClient()
      const { data: authUser, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser.user) {
        return Result.error(new Error('User not authenticated'))
      }

      // 2. Check if profile already exists
      const existingUser = await this.userRepository.findByAuthId(authUserId)
      if (existingUser) {
        return Result.ok(existingUser)
      }

      // 3. Validate profile creation
      const dto: CreateUserProfileDto = {
        authUserId: authUser.user.id,
        email: authUser.user.email!,
        fullName: authUser.user.user_metadata?.full_name,
        userType: 'customer', // Default
      }

      const validation = UserBusinessRules.validateProfileCreation(dto)
      if (validation.isError()) {
        return validation
      }

      // 4. Create user entity
      const user = User.fromDto(dto)

      // 5. Save to database
      const savedUser = await this.userRepository.create(user)

      return Result.ok(savedUser)

    } catch (error) {
      return Result.error(error as Error)
    }
  }

  async getCurrentUser(): Promise<Result<User | null, Error>> {
    try {
      const supabase = await createClient()
      const { data: authUser, error } = await supabase.auth.getUser()

      if (error || !authUser.user) {
        return Result.ok(null)
      }

      const user = await this.userRepository.findByAuthId(authUser.user.id)
      return Result.ok(user)

    } catch (error) {
      return Result.error(error as Error)
    }
  }
}
```

#### 2. Create User Profile Use Case (`/server/application/auth/create-user-profile.usecase.ts`)

```typescript
export class CreateUserProfileUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(dto: CreateUserProfileDto): Promise<Result<User, Error>> {
    // 1. Validate business rules
    const validation = UserBusinessRules.validateProfileCreation(dto)
    if (validation.isError()) {
      return validation
    }

    // 2. Check for duplicates
    const existing = await this.userRepository.findByEmail(dto.email)
    if (existing) {
      return Result.error(new Error('User already exists'))
    }

    // 3. Create user entity
    const user = User.create(dto)

    // 4. Save to database
    const savedUser = await this.userRepository.create(user)

    return Result.ok(savedUser)
  }
}
```

---

### Phase 3: Infrastructure Layer (Supabase Integration)

#### User Repository (`/server/infrastructure/supabase/user.repository.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { User } from '@/server/domain/user/user.entity'

export class UserRepository {
  async findByAuthId(authId: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authId)
      .single()

    if (error || !data) return null

    return this.toDomain(data)
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) return null

    return this.toDomain(data)
  }

  async create(user: User): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .insert(this.toPersistence(user))
      .select()
      .single()

    if (error) throw error

    return this.toDomain(data)
  }

  async update(user: User): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .update(this.toPersistence(user))
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return this.toDomain(data)
  }

  // Mappers
  private toDomain(raw: any): User {
    return new User(
      raw.id,
      raw.email,
      raw.full_name,
      raw.user_type,
      raw.is_phone_verified,
      raw.is_email_verified,
      new Date(raw.created_at)
    )
  }

  private toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      user_type: user.userType,
      is_phone_verified: user.isPhoneVerified,
      is_email_verified: user.isEmailVerified,
      created_at: user.createdAt.toISOString(),
    }
  }
}
```

---

### Phase 4: API Layer (Thin Wrapper)

#### API Route: Profile Sync (`/app/api/auth/profile/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Create service instance
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    // 3. Execute use case
    const result = await authService.createOrSyncUserProfile(authUser.id)

    if (result.isError()) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    // 4. Return user profile
    return NextResponse.json(result.value, { status: 200 })

  } catch (error) {
    console.error('Profile sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user profile
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    const result = await authService.getCurrentUser()

    if (result.isError()) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    if (!result.value) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.value, { status: 200 })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### Phase 5: Client Components

#### Auth Hook (`/features/auth/hooks/use-auth.ts`)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!error && data.user) {
      // Sync profile with our database
      await fetch('/api/auth/profile', { method: 'POST' })
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }
}
```

---

## 📊 Summary: API Endpoints

### **Recommended (MVP):**

```
POST /api/auth/profile    # Create/sync user profile after auth
GET  /api/auth/profile    # Get current user profile
```

### **Already Exists:**

```
GET /auth/callback        # OAuth callback handler
```

### **Authentication Operations (No API needed):**

```
✅ Sign Up       → Client-side via Supabase client
✅ Sign In       → Client-side via Supabase client
✅ Sign Out      → Client-side via Supabase client
✅ OAuth         → Client-side via Supabase client
✅ Password Reset → Client-side via Supabase client
```

---

## ✅ Benefits of This Architecture

1. **Framework Agnostic** - Business logic in `/server` works anywhere
2. **Testable** - Domain layer tests without Supabase/Next.js
3. **Scalable** - Can migrate to NestJS without rewriting logic
4. **Clean** - Clear separation of concerns
5. **Simple** - One API endpoint for profile sync

---

## 🎯 Next Steps

1. **Implement domain layer** - User entity, types, rules
2. **Implement application layer** - Auth service, use cases
3. **Implement infrastructure** - User repository
4. **Create API route** - `/api/auth/profile`
5. **Create auth hook** - `useAuth()` for components
6. **Build UI components** - Sign in/up forms
7. **Test flow** - Sign up → profile sync → dashboard

---

**Document Version:** 1.0
**Last Updated:** October 24, 2024
**Follows:** `/docs/architecture/universal-backend-architecture.md`
