# Task Creation - Implementation Plan

## Overview

Task creation is the **core functionality** of TaskBridge. This plan outlines a thorough approach to implementing the feature with a flexible, extensible database schema.

---

## 1. Current State Analysis

### ✅ What We Have

**UI Form Sections:**
- Category Selection (required)
- Task Details (title, description, requirements)
- Location (city, neighborhood, exact address)
- Budget (type: fixed/range, min/max amounts - optional)
- Timeline (urgency: same_day/within_week/flexible, deadline)
- Photos (up to 5 images)
- Review & Submit

**Form Validation:**
- Title: 10-200 characters (required)
- Description: 50-2000 characters (required)
- Category: required
- City: required
- Budget: completely optional
- Budget validation: if range provided, max > min

**Database Schema (tasks table):**
```sql
- id (UUID, PK)
- created_at, updated_at (timestamps)
- title (TEXT, required)
- description (TEXT, required)
- category (TEXT, required)
- subcategory (TEXT, nullable)
- city (TEXT, required)
- neighborhood (TEXT, nullable)
- address (TEXT, nullable)
- location_notes (TEXT, nullable)
- budget_min_bgn (DECIMAL, nullable)
- budget_max_bgn (DECIMAL, nullable)
- budget_type (fixed/hourly/negotiable, default: negotiable)
- deadline (TIMESTAMP, nullable)
- estimated_duration_hours (INTEGER, nullable)
- status (enum, default: open)
- customer_id (UUID, FK to users, required)
- images (TEXT[], array of URLs)
- documents (TEXT[], array of URLs)
- is_urgent (BOOLEAN, default: false)
- requires_license (BOOLEAN, default: false)
- requires_insurance (BOOLEAN, default: false)
- views_count (INTEGER, default: 0)
- applications_count (INTEGER, default: 0)
```

### ⚠️ Schema vs Form Gaps

**Missing in Form (but in DB):**
- `location_notes` - could be useful (text area for "How to find me")
- `estimated_duration_hours` - could derive from urgency or add as optional
- `is_urgent` - can derive from urgency field
- `requires_license` - could add as checkbox
- `requires_insurance` - could add as checkbox
- `documents` - not in UI (future: allow PDF attachments)

**Missing in DB (but in Form):**
- `requirements` field - currently mapped to description (OK)
- `urgency` enum (same_day/within_week/flexible) - need to map to DB fields

**Budget Type Mismatch:**
- Form: `fixed` | `range`
- DB: `fixed` | `hourly` | `negotiable`
- **Solution**: Map form `range` → DB `negotiable`, keep `fixed` as-is

---

## 2. Schema Adjustments Needed

### Option A: Minimal Changes (Recommended)

Keep current schema, add mapping logic:
- Form `urgency='same_day'` → DB `is_urgent=true`, `deadline=today+1day`
- Form `urgency='within_week'` → DB `deadline=today+7days`
- Form `urgency='flexible'` → DB `deadline=null`, `is_urgent=false`
- Form `budgetType='range'` → DB `budget_type='negotiable'`
- Form `budgetType='fixed'` → DB `budget_type='fixed'`

### Option B: Add Urgency Enum (Future Enhancement)

```sql
-- Add urgency field to tasks table (optional, for later)
ALTER TABLE public.tasks ADD COLUMN urgency TEXT
  CHECK (urgency IN ('same_day', 'within_week', 'flexible'))
  DEFAULT 'flexible';
```

**Recommendation**: Start with Option A (mapping logic). Add Option B later if needed for filtering/analytics.

---

## 3. Implementation Phases

### Phase 1: API Endpoint (Core)

**Endpoint**: `POST /api/tasks`

**Request Body:**
```typescript
{
  // Required
  category: string
  title: string
  description: string
  city: string

  // Optional
  subcategory?: string
  neighborhood?: string
  exactAddress?: string
  budgetType?: 'fixed' | 'range'
  budgetMin?: number
  budgetMax?: number
  urgency?: 'same_day' | 'within_week' | 'flexible'
  deadline?: string (ISO date)
  photoUrls?: string[] // Pre-uploaded to Supabase Storage
}
```

**Logic:**
1. Verify user is authenticated (`auth.uid()`)
2. Validate request body with Zod schema
3. Map form data to DB schema
4. Insert into `tasks` table
5. Return created task with ID

**Security (RLS):**
- Already configured: `customer_id` must match `auth.uid()`
- Policy: "Customers can create tasks" ✅

**Response:**
```typescript
{
  success: true,
  task: {
    id: string
    status: 'open'
    created_at: string
    ...all task fields
  }
}
```

---

### Phase 2: Image Upload

**Strategy: Two-Step Upload**

#### Step 1: Upload Images to Supabase Storage
- **Bucket**: `task-images` (public bucket)
- **Path structure**: `tasks/{userId}/{taskId}/{timestamp}-{filename}`
- **Allowed types**: JPEG, PNG, WebP
- **Max size**: 5MB per image
- **Max count**: 5 images

**Implementation:**
```typescript
// Frontend: PhotosSection component
const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  })

  const { url } = await response.json()
  return url // Supabase Storage URL
}
```

**API Route**: `POST /api/upload/image`
```typescript
// Server-side validation
- Check auth
- Validate file type
- Validate file size
- Generate unique filename
- Upload to Supabase Storage
- Return public URL
```

#### Step 2: Submit Task with Image URLs
```typescript
const photoUrls = await Promise.all(
  selectedFiles.map(uploadImage)
)

await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({
    ...formData,
    photoUrls
  })
})
```

**Cleanup**: If task creation fails after images uploaded, implement cleanup job (Phase 4).

---

### Phase 3: Form-to-DB Mapping

**Mapping Function:**
```typescript
function mapFormDataToTask(formData: CreateTaskFormData, userId: string) {
  return {
    // Direct mappings
    title: formData.title,
    description: formData.description,
    category: formData.category,
    subcategory: formData.subcategory || null,
    city: formData.city,
    neighborhood: formData.neighborhood || null,
    address: formData.exactAddress || null,

    // Budget mapping
    budget_min_bgn: formData.budgetMin || null,
    budget_max_bgn: formData.budgetMax || null,
    budget_type: formData.budgetType === 'fixed' ? 'fixed' : 'negotiable',

    // Urgency mapping
    is_urgent: formData.urgency === 'same_day',
    deadline: calculateDeadline(formData.urgency, formData.deadline),

    // Images
    images: formData.photoUrls || [],

    // Relationships
    customer_id: userId,

    // Defaults
    status: 'open',
    views_count: 0,
    applications_count: 0,
  }
}

function calculateDeadline(urgency: string, customDeadline?: Date) {
  if (customDeadline) return customDeadline

  const now = new Date()
  switch (urgency) {
    case 'same_day':
      return new Date(now.setHours(23, 59, 59, 999)) // End of today
    case 'within_week':
      return new Date(now.setDate(now.getDate() + 7))
    case 'flexible':
      return null
  }
}
```

---

### Phase 4: Error Handling & Validation

**Server-Side Validation:**
```typescript
import { createTaskSchema } from '@/app/[lang]/create-task/lib/validation'

// Validate with Zod
const result = createTaskSchema.safeParse(requestBody)
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 })
}
```

**Error Cases:**
- 401: User not authenticated
- 400: Validation failed (invalid data)
- 413: File too large
- 415: Unsupported file type
- 500: Database error

**Client-Side Error Display:**
- Use toast notifications for errors
- Show field-specific errors below inputs
- Disable submit during validation

---

### Phase 5: Success Flow

**After Successful Creation:**
1. Show success toast: "Task created successfully!"
2. Redirect to task detail page: `/{lang}/tasks/{taskId}`
3. Optional: Show onboarding tooltip on first task

**Task Detail Page:**
- Display all task information
- Show "Edit" button (owner only)
- Show "Apply" button for professionals
- Track page view (increment `views_count`)

---

## 4. Supabase Storage Setup

### Bucket Configuration

**Create bucket**: `task-images`
```sql
-- In Supabase Storage UI:
-- 1. Create bucket "task-images"
-- 2. Set as Public
-- 3. Set size limit: 5MB
-- 4. Allowed MIME types: image/jpeg, image/png, image/webp
```

**RLS Policy for Storage:**
```sql
-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload task images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view task images (public bucket)
CREATE POLICY "Task images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their task images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 5. Future Extensibility

### Features to Support Later

**1. Draft Tasks:**
- Add `status='draft'` on save
- Allow users to come back and finish later
- List drafts in "My Tasks" page

**2. Task Templates:**
- Save task as template (category + common fields)
- Quick-create from template

**3. Document Attachments:**
- Add PDF upload (separate from photos)
- Store in `documents` array
- Use case: floor plans, specifications, contracts

**4. Advanced Location:**
- Integrate Google Maps API
- Autocomplete addresses
- Show map pin on task detail

**5. Professional Requirements:**
- `requires_license` checkbox
- `requires_insurance` checkbox
- Filter professionals by requirements

**6. Duration Estimation:**
- Add "Estimated duration" field (hours)
- Map to `estimated_duration_hours`
- Help professionals plan scheduling

**7. Task Editing:**
- Allow editing before any applications
- After applications: only minor edits (description, photos)
- Lock title, category, budget after applications

---

## 6. Stats & Analytics Endpoints (Future)

**Separate Epic - Not Part of Phase 1**

### User Stats Endpoints

**Customer stats:**
```
GET /api/users/{userId}/stats/customer
Response: {
  tasks_posted: number
  tasks_completed: number
  total_spent_bgn: number
  average_rating: number
}
```

**Professional stats:**
```
GET /api/users/{userId}/stats/professional
Response: {
  applications_sent: number
  applications_accepted: number
  tasks_completed: number
  total_earned_bgn: number
  average_rating: number
  acceptance_rate: number
}
```

### Task Stats
```
GET /api/tasks/{taskId}/stats
Response: {
  views_count: number
  applications_count: number
  avg_proposed_price: number
  created_at: string
}
```

**Implementation Notes:**
- Use database triggers to update counters
- Cache stats in `users` table (already there)
- Refresh stats on relevant events (task completion, review)

---

## 7. Implementation Checklist

### Backend Tasks

- [ ] **API Route**: Create `POST /api/tasks` endpoint
- [ ] **Validation**: Implement Zod validation on server
- [ ] **Mapping**: Create form-to-DB mapping function
- [ ] **RLS**: Test Row Level Security policies
- [ ] **Error Handling**: Implement error responses
- [ ] **Image Upload**: Create `POST /api/upload/image` endpoint
- [ ] **Storage Setup**: Configure Supabase `task-images` bucket
- [ ] **Storage Policies**: Add RLS policies for storage

### Frontend Tasks

- [ ] **Form Submit**: Connect form to API endpoint
- [ ] **Image Upload**: Implement two-step upload flow
- [ ] **Loading States**: Add loading indicators
- [ ] **Error Display**: Show validation errors
- [ ] **Success Flow**: Redirect to task detail page
- [ ] **Toast Notifications**: Success/error messages

### Testing

- [ ] **Unit Tests**: Test mapping functions
- [ ] **API Tests**: Test endpoint with various inputs
- [ ] **E2E Tests**: Test full creation flow
- [ ] **Auth Tests**: Verify RLS policies work
- [ ] **Image Tests**: Test upload limits, file types
- [ ] **Error Tests**: Test validation failures

### Documentation

- [ ] **API Docs**: Document endpoint contract
- [ ] **Type Definitions**: Add TypeScript types
- [ ] **Code Comments**: Add JSDoc comments
- [ ] **User Guide**: "How to create a task" (optional)

---

## 8. Type Definitions

```typescript
// src/types/tasks.ts

export interface CreateTaskRequest {
  // Required
  category: string
  title: string
  description: string
  city: string

  // Optional
  subcategory?: string
  neighborhood?: string
  exactAddress?: string
  budgetType?: 'fixed' | 'range'
  budgetMin?: number
  budgetMax?: number
  urgency?: 'same_day' | 'within_week' | 'flexible'
  deadline?: string
  photoUrls?: string[]
}

export interface CreateTaskResponse {
  success: true
  task: Task
}

export interface Task {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string
  category: string
  subcategory: string | null
  city: string
  neighborhood: string | null
  address: string | null
  location_notes: string | null
  budget_min_bgn: number | null
  budget_max_bgn: number | null
  budget_type: 'fixed' | 'hourly' | 'negotiable'
  deadline: string | null
  estimated_duration_hours: number | null
  status: TaskStatus
  customer_id: string
  images: string[]
  is_urgent: boolean
  views_count: number
  applications_count: number
}

export type TaskStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'pending_customer_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'
```

---

## 9. Estimated Effort

**Phase 1 (Core API)**: 4-6 hours
- API endpoint: 2h
- Validation: 1h
- Mapping logic: 1h
- Testing: 1-2h

**Phase 2 (Image Upload)**: 3-4 hours
- Storage setup: 1h
- Upload endpoint: 1h
- Frontend integration: 1h
- Testing: 1h

**Phase 3 (Frontend Integration)**: 2-3 hours
- Connect form: 1h
- Error handling: 1h
- Success flow: 1h

**Phase 4 (Polish & Testing)**: 2-3 hours
- E2E tests: 1h
- Edge cases: 1h
- Documentation: 1h

**Total**: ~11-16 hours

---

## 10. Risk Mitigation

**Risk 1: Image upload fails but task created**
- **Mitigation**: Upload images first, then create task
- **Cleanup**: Periodic job to delete orphaned images

**Risk 2: Large images slow down upload**
- **Mitigation**: Client-side image compression before upload
- **Library**: `browser-image-compression` or `compressorjs`

**Risk 3: User closes tab during upload**
- **Mitigation**: Show "Don't close this window" warning
- **Save draft**: Auto-save form data to localStorage

**Risk 4: Database schema needs changes**
- **Mitigation**: Use migrations for schema updates
- **Flexibility**: Current schema supports extensibility

---

## 11. Success Metrics

**Technical Metrics:**
- Task creation success rate > 95%
- Image upload success rate > 90%
- API response time < 500ms (excluding image upload)

**User Metrics:**
- % of tasks with photos (target: 60%+)
- % of tasks with budget specified (track to inform UX)
- Time to create task (target: < 3 minutes)

**Business Metrics:**
- Tasks created per day
- Tasks receiving applications within 24h
- Completed task rate

---

## 12. Next Steps

1. **Review this plan** with team/stakeholders
2. **Set up Supabase Storage** bucket
3. **Create API endpoint** (Phase 1)
4. **Implement image upload** (Phase 2)
5. **Connect frontend** (Phase 3)
6. **Test thoroughly** (Phase 4)
7. **Deploy & monitor** metrics

---

## Notes

- Schema is **already flexible** - supports all current and planned features
- Use **database migrations** for any schema changes
- Keep **image upload separate** from task creation for cleaner error handling
- **RLS policies** are already configured - just test them
- **Stats endpoints** are a separate epic - don't block task creation on them
- Consider **image compression** to improve upload speed and storage costs
- Plan for **task editing** feature from the start (limit edits after applications)

---

**Ready to implement!** 🚀

Let's start with Phase 1 (Core API) when you're ready.
