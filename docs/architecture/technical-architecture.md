# TaskBridge - Technical Architecture & Requirements
## Phase 1 MVP Implementation

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Next.js App    │    │   PostgreSQL    │
│  (Browser/PWA)  │◄──►│   App Router     │◄──►│   Database      │
│                 │    │   API Routes     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │    Vercel        │
                       │   Deployment     │
                       └──────────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- **Framework**: Next.js 15 with App Router
- **UI Library**: NextUI + Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Internationalization**: i18next
- **Type Safety**: TypeScript

**Backend:**
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod validation
- **Authentication**: NextAuth.js (prepared but currently disabled)

**Infrastructure:**
- **Hosting**: Vercel
- **Database Hosting**: Neon (PostgreSQL)
- **File Storage**: Vercel Blob Storage (for images)
- **CDN**: Vercel Edge Network

---

## 2. Database Architecture

### 2.1 Entity Relationship Diagram
```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│    Users    │    │    Tasks     │    │  Applications   │
│             │◄──►│              │◄──►│                 │
│ - id        │    │ - id         │    │ - id            │
│ - email     │    │ - title      │    │ - taskId        │
│ - userType  │    │ - customerId │    │ - professionalId│
│ - rating    │    │ - status     │    │ - status        │
└─────────────┘    └──────────────┘    └─────────────────┘
       │                   │
       │                   │
       └─────────┐    ┌────┘
                 ▼    ▼
            ┌──────────────┐
            │   Reviews    │
            │              │
            │ - id         │
            │ - taskId     │
            │ - reviewerId │
            │ - revieweeId │
            └──────────────┘
```

### 2.2 Database Schema Details

#### 2.2.1 Users Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  user_type VARCHAR DEFAULT 'customer', -- 'customer' | 'professional'
  phone_number VARCHAR,
  city VARCHAR,
  country VARCHAR,
  is_phone_verified BOOLEAN DEFAULT false,
  vat_number VARCHAR,
  is_vat_verified BOOLEAN DEFAULT false,
  service_categories TEXT[],
  bio TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.2 Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  customer_id VARCHAR NOT NULL REFERENCES users(id),
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  budget_type VARCHAR DEFAULT 'range', -- 'range' | 'fixed'
  city VARCHAR NOT NULL,
  neighborhood VARCHAR,
  exact_address TEXT,
  deadline TIMESTAMP,
  urgency VARCHAR DEFAULT 'flexible', -- 'same_day' | 'within_week' | 'flexible'
  requirements TEXT,
  photos TEXT[],
  status VARCHAR DEFAULT 'open', -- 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  selected_professional_id VARCHAR REFERENCES users(id),
  completed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.3 Bids Table (Enhanced from Applications)
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  professional_id VARCHAR NOT NULL REFERENCES users(id),
  bid_type VARCHAR DEFAULT 'fixed', -- 'fixed' | 'hourly'
  proposed_price DECIMAL(10,2) NOT NULL,
  hourly_rate DECIMAL(10,2), -- for hourly bids
  estimated_hours INTEGER, -- for hourly bids
  proposed_timeline VARCHAR NOT NULL,
  message TEXT NOT NULL,
  portfolio_images TEXT[],
  status VARCHAR DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at TIMESTAMP,
  is_invited BOOLEAN DEFAULT false, -- true if customer invited this professional
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.4 Transactions Table (New)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  customer_id VARCHAR NOT NULL REFERENCES users(id),
  professional_id VARCHAR NOT NULL REFERENCES users(id),
  bid_id UUID NOT NULL REFERENCES bids(id),
  amount DECIMAL(10,2) NOT NULL, -- total amount
  platform_fee DECIMAL(10,2) NOT NULL,
  professional_amount DECIMAL(10,2) NOT NULL, -- amount - platform_fee
  currency VARCHAR DEFAULT 'BGN',
  payment_method VARCHAR, -- 'card' | 'bank_transfer' | 'wallet'
  payment_processor_id VARCHAR, -- Stripe/PayPal transaction ID
  status VARCHAR DEFAULT 'pending', -- 'pending' | 'held_in_escrow' | 'released' | 'refunded' | 'disputed'
  escrow_release_date TIMESTAMP, -- automatic release date
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.5 Disputes Table (New)
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  task_id UUID NOT NULL REFERENCES tasks(id),
  initiator_id VARCHAR NOT NULL REFERENCES users(id),
  respondent_id VARCHAR NOT NULL REFERENCES users(id),
  category VARCHAR NOT NULL, -- 'quality' | 'timeline' | 'payment' | 'communication' | 'other'
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- URLs to uploaded evidence files
  status VARCHAR DEFAULT 'open', -- 'open' | 'in_review' | 'resolved' | 'appealed' | 'closed'
  mediator_id VARCHAR, -- internal staff member handling dispute
  resolution_type VARCHAR, -- 'full_refund' | 'partial_refund' | 'release_payment' | 'custom'
  resolution_amount DECIMAL(10,2), -- amount for partial refunds
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.4 Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  reviewer_id VARCHAR NOT NULL REFERENCES users(id),
  reviewee_id VARCHAR NOT NULL REFERENCES users(id),
  reviewer_type VARCHAR NOT NULL, -- 'customer' | 'professional'
  quality_rating INTEGER NOT NULL,
  timeliness_rating INTEGER NOT NULL,
  communication_rating INTEGER NOT NULL,
  overall_rating INTEGER NOT NULL,
  written_review TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Database Indexes & Optimization
```sql
-- Performance indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_city ON tasks(city);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_applications_task_id ON applications(task_id);
CREATE INDEX idx_applications_professional_id ON applications(professional_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_city ON users(city);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_status_category ON tasks(status, category);
CREATE INDEX idx_tasks_status_city ON tasks(status, city);
```

---

## 3. API Architecture

### 3.1 API Route Structure
```
/api/
├── auth/
│   ├── register/
│   ├── login/
│   └── logout/
├── users/
│   ├── [id]/
│   ├── profile/
│   └── verify/
├── tasks/
│   ├── [id]/
│   ├── create/
│   ├── search/
│   └── categories/
├── applications/
│   ├── [id]/
│   ├── create/
│   └── by-task/[taskId]/
├── reviews/
│   ├── [id]/
│   ├── create/
│   └── by-user/[userId]/
└── upload/
    ├── images/
    └── documents/
```

### 3.2 API Endpoints Specification

#### 3.2.1 Authentication Endpoints
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'professional';
  city: string;
  phoneNumber?: string;
}

// POST /api/auth/login  
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

#### 3.2.2 Task Management Endpoints
```typescript
// POST /api/tasks/create
interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType: 'range' | 'fixed';
  city: string;
  neighborhood?: string;
  deadline?: string;
  urgency: 'same_day' | 'within_week' | 'flexible';
  requirements?: string;
  photos?: string[];
}

// GET /api/tasks/search
interface TaskSearchQuery {
  category?: string;
  city?: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'budget' | 'deadline' | 'bids_count';
  sortOrder?: 'asc' | 'desc';
}

// POST /api/tasks/[id]/invite
interface InviteProfessionalRequest {
  professionalId: string;
  message?: string;
}
```

#### 3.2.3 Bidding System Endpoints
```typescript
// POST /api/bids/create
interface CreateBidRequest {
  taskId: string;
  bidType: 'fixed' | 'hourly';
  proposedPrice: number;
  hourlyRate?: number;
  estimatedHours?: number;
  proposedTimeline: string;
  message: string;
  portfolioImages?: string[];
}

// GET /api/bids/by-task/[taskId]
interface TaskBidsResponse {
  bids: Array<{
    id: string;
    professional: {
      id: string;
      firstName: string;
      lastName: string;
      averageRating: number;
      totalReviews: number;
      profileImageUrl?: string;
      isVerified: boolean;
    };
    bidType: 'fixed' | 'hourly';
    proposedPrice: number;
    hourlyRate?: number;
    estimatedHours?: number;
    proposedTimeline: string;
    message: string;
    portfolioImages: string[];
    isInvited: boolean;
    expiresAt: string;
    createdAt: string;
  }>;
  total: number;
  avgPrice?: number;
}

// POST /api/bids/[id]/accept
interface AcceptBidRequest {
  bidId: string;
}

// GET /api/bids/my-bids
interface MyBidsResponse {
  bids: Array<{
    id: string;
    task: {
      id: string;
      title: string;
      category: string;
      city: string;
    };
    proposedPrice: number;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
    expiresAt?: string;
  }>;
}
```

#### 3.2.4 Payment & Transaction Endpoints
```typescript
// POST /api/payments/setup-escrow
interface SetupEscrowRequest {
  bidId: string;
  paymentMethod: {
    type: 'card' | 'bank_transfer';
    token: string; // Stripe payment method token
  };
}

// POST /api/payments/release
interface ReleasePaymentRequest {
  transactionId: string;
  releaseType: 'full' | 'partial';
  amount?: number; // for partial releases
  tip?: number; // optional tip
}

// GET /api/transactions/history
interface TransactionHistoryResponse {
  transactions: Array<{
    id: string;
    task: {
      id: string;
      title: string;
    };
    amount: number;
    platformFee: number;
    netAmount: number;
    status: string;
    createdAt: string;
    receiptUrl?: string;
  }>;
  total: number;
}
```

#### 3.2.5 Dispute Resolution Endpoints
```typescript
// POST /api/disputes/create
interface CreateDisputeRequest {
  transactionId: string;
  category: 'quality' | 'timeline' | 'payment' | 'communication' | 'other';
  description: string;
  evidenceFiles?: File[];
}

// GET /api/disputes/[id]
interface DisputeDetailsResponse {
  id: string;
  task: {
    id: string;
    title: string;
  };
  category: string;
  description: string;
  status: string;
  evidenceUrls: string[];
  resolution?: {
    type: string;
    amount?: number;
    notes: string;
    resolvedAt: string;
  };
  timeline: Array<{
    action: string;
    timestamp: string;
    actor: string;
  }>;
}

// POST /api/disputes/[id]/respond
interface DisputeResponseRequest {
  response: string;
  additionalEvidence?: File[];
}
```

### 3.3 API Response Standards
```typescript
// Success Response
interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination Response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 4. Frontend Architecture

### 4.1 Component Structure
```
components/
├── ui/                    # Reusable UI components (NextUI/Radix)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── forms/                 # Form components
│   ├── task-creation-form.tsx
│   ├── application-form.tsx
│   ├── registration-form.tsx
│   └── ...
├── layout/               # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── ...
├── pages/                # Page-specific components
│   ├── landing/
│   ├── browse-tasks/
│   ├── task-detail/
│   └── ...
└── shared/               # Shared business components
    ├── task-card.tsx
    ├── user-avatar.tsx
    ├── rating-display.tsx
    └── ...
```

### 4.2 State Management Strategy

#### 4.2.1 TanStack Query Setup
```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  applications: {
    all: ['applications'] as const,
    byTask: (taskId: string) => [...queryKeys.applications.all, 'byTask', taskId] as const,
    byUser: (userId: string) => [...queryKeys.applications.all, 'byUser', userId] as const,
  },
};
```

#### 4.2.2 Custom Hooks
```typescript
// hooks/use-tasks.ts
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => fetchTasks(filters),
    enabled: !!filters,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

// hooks/use-applications.ts
export function useTaskApplications(taskId: string) {
  return useQuery({
    queryKey: queryKeys.applications.byTask(taskId),
    queryFn: () => fetchTaskApplications(taskId),
    enabled: !!taskId,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createApplication,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.applications.byTask(variables.taskId) 
      });
    },
  });
}
```

### 4.3 Form Management
```typescript
// Using React Hook Form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTaskSchema } from '@/shared/schema';

export function TaskCreationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      budgetType: 'range',
      urgency: 'flexible',
    },
  });

  const createTask = useCreateTask();

  const onSubmit = async (data: InsertTask) => {
    try {
      await createTask.mutateAsync(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 5. Security Architecture

### 5.1 Authentication & Authorization
```typescript
// middleware.ts - Route protection
export function middleware(request: NextRequest) {
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  const token = request.cookies.get('auth-token');

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// API route protection
export async function authenticateRequest(req: NextRequest) {
  const token = req.cookies.get('auth-token');
  if (!token) {
    throw new ApiError('Unauthorized', 401);
  }

  const user = await verifyToken(token.value);
  return user;
}
```

### 5.2 Data Validation
```typescript
// API route validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      throw new ApiError('Validation failed', 400, result.error.errors);
    }
    
    return result.data;
  };
}

// Usage in API routes
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const data = await validateRequest(insertTaskSchema)(req);
    
    // Process request
    const task = await createTask({ ...data, customerId: user.id });
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 5.3 File Upload Security
```typescript
// Image upload validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateImageUpload(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // Additional security checks
  await scanForMaliciousContent(file);
}
```

---

## 6. Performance Optimization

### 6.1 Database Query Optimization
```typescript
// Efficient queries with proper indexing
export async function searchTasks(filters: TaskSearchFilters) {
  const query = db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      category: tasks.category,
      budgetMin: tasks.budgetMin,
      budgetMax: tasks.budgetMax,
      city: tasks.city,
      createdAt: tasks.createdAt,
      customerName: users.firstName,
      customerRating: users.averageRating,
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.customerId, users.id))
    .where(
      and(
        eq(tasks.status, 'open'),
        eq(tasks.isActive, true),
        filters.category ? eq(tasks.category, filters.category) : undefined,
        filters.city ? eq(tasks.city, filters.city) : undefined,
        filters.budgetMin ? gte(tasks.budgetMax, filters.budgetMin) : undefined,
        filters.budgetMax ? lte(tasks.budgetMin, filters.budgetMax) : undefined,
      ),
    )
    .orderBy(desc(tasks.createdAt))
    .limit(filters.limit || 20)
    .offset((filters.page - 1) * (filters.limit || 20));

  return await query;
}
```

### 6.2 Image Optimization
```typescript
// Next.js Image component configuration
import Image from 'next/image';

export function TaskImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      priority={false}
    />
  );
}
```

### 6.3 Caching Strategy
```typescript
// API route caching
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cacheKey = `tasks:${searchParams.toString()}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'Cache-Control': 's-maxage=300' }
    });
  }
  
  const tasks = await searchTasks(Object.fromEntries(searchParams));
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(tasks));
  
  return NextResponse.json({ success: true, data: tasks });
}
```

---

## 7. Testing Strategy

### 7.1 Unit Testing
```typescript
// components/__tests__/task-card.test.tsx
import { render, screen } from '@testing-library/react';
import TaskCard from '../task-card';
import { mockTask } from '../../../test/mocks';

describe('TaskCard', () => {
  it('displays task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockTask.budgetMin}-${mockTask.budgetMax} лв`)).toBeInTheDocument();
  });
  
  it('calls onApply when apply button is clicked', () => {
    const onApply = jest.fn();
    render(<TaskCard task={mockTask} onApply={onApply} />);
    
    screen.getByRole('button', { name: /apply/i }).click();
    expect(onApply).toHaveBeenCalledWith(mockTask.id);
  });
});
```

### 7.2 Integration Testing
```typescript
// __tests__/api/tasks.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/tasks/create';

describe('/api/tasks/create', () => {
  it('creates a task with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Task',
        description: 'Test description',
        category: 'home_repair',
        city: 'Sofia',
        budgetMin: 50,
        budgetMax: 100,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Task');
  });
});
```

### 7.3 End-to-End Testing
```typescript
// e2e/task-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a task', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');

  await page.goto('/create-task');
  await page.fill('[data-testid=task-title]', 'Fix my bathroom');
  await page.fill('[data-testid=task-description]', 'Need to fix a leaky faucet');
  await page.selectOption('[data-testid=category]', 'home_repair');
  await page.fill('[data-testid=city]', 'Sofia');
  await page.fill('[data-testid=budget-min]', '50');
  await page.fill('[data-testid=budget-max]', '100');
  
  await page.click('[data-testid=submit-task]');
  
  await expect(page).toHaveURL('/tasks/*');
  await expect(page.locator('[data-testid=task-title]')).toContainText('Fix my bathroom');
});
```

---

## 8. Deployment & DevOps

### 8.1 Vercel Deployment Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev", 
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 8.2 Environment Variables
```bash
# .env.local
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=vercel-blob-token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 8.3 CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. Monitoring & Analytics

### 9.1 Application Monitoring
```typescript
// lib/monitoring.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Client-side analytics
    gtag('event', eventName, properties);
  }
  
  // Server-side logging
  console.log(`Event: ${eventName}`, properties);
}

// Usage in components
export function TaskCard({ task, onApply }: TaskCardProps) {
  const handleApply = () => {
    trackEvent('task_application_started', {
      taskId: task.id,
      category: task.category,
      budget: `${task.budgetMin}-${task.budgetMax}`,
    });
    onApply?.(task.id);
  };
  
  return (
    // Component JSX
  );
}
```

### 9.2 Performance Monitoring
```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async () => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      trackEvent('performance_metric', {
        name,
        duration: Math.round(duration),
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      trackEvent('performance_metric', {
        name,
        duration: Math.round(duration),
        success: false,
        error: error.message,
      });
      
      throw error;
    }
  };
}
```

---

## 10. Scalability Considerations

### 10.1 Database Scaling
- **Read Replicas**: For heavy read operations
- **Connection Pooling**: PgBouncer for connection management  
- **Query Optimization**: Regular query performance analysis
- **Partitioning**: Task table partitioning by date/region

### 10.2 Application Scaling
- **Edge Functions**: Move API routes to edge for better performance
- **CDN**: Static asset optimization through Vercel's CDN
- **Image Optimization**: Automatic image resizing and format optimization
- **Code Splitting**: Route-based code splitting for faster loading

### 10.3 Caching Strategy
- **Browser Caching**: Long cache times for static assets
- **API Response Caching**: Cache frequently accessed data
- **Database Query Caching**: Redis for expensive queries
- **CDN Caching**: Vercel Edge Network for global distribution

---

*Document Version: 1.0*  
*Last Updated: August 18, 2025*  
*Cross-references: PRD-TaskBridge-MVP.md, user-stories-detailed.md*