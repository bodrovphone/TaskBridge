# Professional Portfolio Gallery - Implementation Plan

## 📋 Executive Summary

Enable professionals to showcase their work with before/after image galleries on their public profile pages. This feature increases trust, demonstrates quality, and improves conversion rates for professional applications.

**Current Status:**
- ✅ UI components fully designed and implemented
- ✅ Portfolio display component exists (with synchronized before/after galleries)
- ✅ Portfolio manager component exists (CRUD operations UI)
- ❌ Database schema not configured
- ❌ Image upload to Supabase Storage not implemented
- ❌ API endpoints missing

## 🎯 Goals

1. **Enable portfolio creation** - Professionals can add before/after showcases
2. **Increase trust** - Visual proof of work quality
3. **Improve conversions** - Better application acceptance rates
4. **SEO benefits** - Rich media content improves profile discoverability

---

## 🏗️ Architecture Decision: JSONB vs Separate Table

### Option A: JSONB Field in `users` Table (RECOMMENDED for MVP)

**Structure:**
```sql
ALTER TABLE public.users
  ADD COLUMN portfolio JSONB DEFAULT '[]'::jsonb;
```

**Portfolio Item Schema:**
```typescript
interface PortfolioItem {
  id: string              // UUID or timestamp-based
  title: string           // "Kitchen deep clean transformation"
  beforeImage: string     // Supabase Storage URL
  afterImage: string      // Supabase Storage URL
  description?: string    // Optional detailed description
  duration?: string       // "4 hours" | "2 days"
  tags?: string[]         // Category slugs: ['house-cleaning', 'deep-cleaning']
  createdAt: string       // ISO timestamp
}
```

**Pros:**
- ✅ Simple to implement (no new table, no joins)
- ✅ Atomic updates (portfolio lives with user)
- ✅ Fast reads (no extra queries)
- ✅ Perfect for MVP (6 items max per professional)
- ✅ Easy to query user with portfolio: `SELECT * FROM users WHERE id = ?`

**Cons:**
- ⚠️ Cannot query "all portfolios with tag X" easily
- ⚠️ Limited to ~6 items per user (reasonable for MVP)
- ⚠️ No separate permissions per portfolio item

**Use Cases:**
- ✅ Display portfolio on professional profile page
- ✅ Professionals manage their own portfolio
- ✅ Simple CRUD operations
- ✅ Filter professionals by service categories (already indexed)

### Option B: Separate `professional_portfolio` Table

**Structure:**
```sql
CREATE TABLE professional_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_user_id ON professional_portfolio(user_id);
CREATE INDEX idx_portfolio_tags ON professional_portfolio USING GIN(tags);
```

**Pros:**
- ✅ Unlimited portfolio items per professional
- ✅ Can query across all portfolios (search, analytics)
- ✅ Individual permissions per item
- ✅ Can add features like views, likes, comments
- ✅ Better for future features (portfolio marketplace, featured work)

**Cons:**
- ❌ More complex (extra table, joins required)
- ❌ Slower reads (need JOIN or separate query)
- ❌ Over-engineered for MVP
- ❌ More code to maintain

**Use Cases:**
- ✅ Portfolio browsing page (all featured work across professionals)
- ✅ Analytics (most viewed portfolios)
- ✅ Social features (likes, comments, shares)
- ✅ Professionals with 20+ portfolio items

---

## 🎖️ Recommendation: Start with JSONB (Option A)

**Rationale:**
- MVP needs speed to market
- 6 items per professional is sufficient
- Can migrate to separate table later if needed
- 80% of professionals will have 2-4 portfolio items
- Simpler codebase, fewer moving parts
- Easy migration path: JSONB → Table if scaling issues arise

**Migration Strategy (Future):**
If we need to scale to Option B:
```sql
-- Extract portfolio items from JSONB to new table
INSERT INTO professional_portfolio (user_id, title, before_image_url, after_image_url, ...)
SELECT
  id as user_id,
  item->>'title',
  item->>'beforeImage',
  item->>'afterImage',
  ...
FROM users,
LATERAL jsonb_array_elements(portfolio) AS item
WHERE portfolio IS NOT NULL;
```

---

## 📐 Database Schema (JSONB Approach)

### Migration SQL

```sql
-- =====================================================
-- Portfolio Feature Migration
-- Adds portfolio JSONB field to users table
-- =====================================================

BEGIN;

-- Add portfolio column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;

-- Add GIN index for portfolio queries (optional, for future searching)
CREATE INDEX IF NOT EXISTS idx_users_portfolio
  ON public.users USING GIN(portfolio);

-- Add check constraint to limit portfolio size (max 10 items)
ALTER TABLE public.users
  ADD CONSTRAINT portfolio_max_items
  CHECK (jsonb_array_length(portfolio) <= 10);

-- Add comment for documentation
COMMENT ON COLUMN public.users.portfolio IS
  'Array of portfolio items with before/after images. Max 10 items.
   Structure: [{id, title, beforeImage, afterImage, description, duration, tags, createdAt}]';

COMMIT;
```

**Rollback:**
```sql
BEGIN;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS portfolio_max_items,
  DROP COLUMN IF EXISTS portfolio;

DROP INDEX IF EXISTS idx_users_portfolio;

COMMIT;
```

---

## 🗂️ Supabase Storage Setup

### Storage Bucket Configuration

**Bucket Name:** `portfolio-images`

**Settings:**
- Public: ✅ Yes (images need to be publicly accessible)
- File size limit: 5 MB per image
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Path structure: `{user_id}/{timestamp}-{filename}`

**RLS Policies:**

```sql
-- Anyone can view portfolio images (public bucket)
CREATE POLICY "Public portfolio images are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Users can only upload to their own folder
CREATE POLICY "Users can upload portfolio images to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own portfolio images
CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Create Bucket (Supabase Dashboard or SQL):**
```sql
-- Via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);
```

---

## 💾 TypeScript Types

### Update `user.types.ts`

```typescript
export interface PortfolioItem {
  id: string              // UUID or timestamp
  title: string
  beforeImage: string     // Supabase Storage public URL
  afterImage: string      // Supabase Storage public URL
  description?: string
  duration?: string       // Free text: "4 hours", "2 days"
  tags?: string[]         // Category slugs
  createdAt: string       // ISO timestamp
}

export interface UserProfile {
  // ... existing fields ...

  // Portfolio
  portfolio: PortfolioItem[]  // Add this field
}

export interface UpdateUserProfileDto {
  // ... existing fields ...

  // Portfolio (entire array replaced on update)
  portfolio?: PortfolioItem[]
}
```

---

## 🔌 API Endpoints

### 1. Upload Portfolio Image

**Endpoint:** `POST /api/portfolio/upload`

**Purpose:** Upload before/after images to Supabase Storage

**Request Body:**
```typescript
{
  imageType: 'before' | 'after',
  file: File  // multipart/form-data
}
```

**Response:**
```typescript
{
  url: string  // Public Supabase Storage URL
  path: string // Storage path
}
```

**Implementation:**
```typescript
// /src/app/api/portfolio/upload/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse multipart form data
  const formData = await request.formData()
  const file = formData.get('file') as File
  const imageType = formData.get('imageType') as 'before' | 'after'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${imageType}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('[Portfolio Upload] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(filePath)

  return NextResponse.json({
    url: publicUrl,
    path: filePath
  })
}
```

### 2. Update Portfolio (Part of Profile Update)

**Endpoint:** `PUT /api/profile`

**Request Body:**
```typescript
{
  portfolio: PortfolioItem[]  // Complete portfolio array
}
```

**Implementation:**
```typescript
// /src/app/api/profile/route.ts (existing, add portfolio handling)

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  // Validate portfolio structure
  if (updates.portfolio) {
    if (!Array.isArray(updates.portfolio)) {
      return NextResponse.json({ error: 'Portfolio must be an array' }, { status: 400 })
    }

    if (updates.portfolio.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 portfolio items allowed' }, { status: 400 })
    }

    // Validate each portfolio item
    for (const item of updates.portfolio) {
      if (!item.id || !item.title || !item.beforeImage || !item.afterImage) {
        return NextResponse.json({
          error: 'Each portfolio item must have id, title, beforeImage, and afterImage'
        }, { status: 400 })
      }
    }
  }

  // Update user profile
  const { data, error } = await supabase
    .from('users')
    .update({
      portfolio: updates.portfolio,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[Profile Update] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}
```

---

## 🎨 UI Components (Already Implemented!)

### 1. Portfolio Gallery Manager (Edit Mode)

**Location:** `/src/app/[lang]/profile/components/portfolio-gallery-manager.tsx`

**Status:** ✅ Fully implemented

**Features:**
- Grid view of portfolio items with before/after thumbnails
- Add/Edit/Delete operations
- Modal form for portfolio item details
- Image URL inputs (needs to be replaced with file upload)
- Tag management
- Empty state with CTA

**TODO:** Replace URL inputs with file upload component

### 2. Portfolio Gallery (Public View)

**Location:** `/src/features/professionals/components/sections/portfolio-gallery.tsx`

**Status:** ✅ Fully implemented

**Features:**
- Synchronized before/after galleries
- Auto-slide carousel (4 seconds)
- Mobile-responsive (stacked on mobile, side-by-side on desktop)
- Slide indicators
- Project title and description
- Empty state

**No changes needed** - works perfectly with JSONB data structure

---

## 🔧 Implementation Steps

### Phase 1: Database & Storage Setup (1-2 hours)

**Tasks:**
- [ ] Run migration to add `portfolio` JSONB column
- [ ] Create `portfolio-images` storage bucket in Supabase
- [ ] Configure RLS policies for storage bucket
- [ ] Test image upload manually via Supabase Dashboard
- [ ] Verify public URL access to uploaded images

**Verification:**
```sql
-- Check portfolio column exists
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'portfolio';

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'portfolio-images';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Phase 2: TypeScript Types (30 minutes)

**Tasks:**
- [ ] Add `PortfolioItem` interface to `user.types.ts`
- [ ] Add `portfolio` field to `UserProfile` interface
- [ ] Add `portfolio` field to `UpdateUserProfileDto` interface
- [ ] Run type check: `npm run type-check`

**Verification:**
```bash
npm run type-check
# Should pass with no errors
```

### Phase 3: API Endpoints (2-3 hours)

**Tasks:**
- [ ] Create `/api/portfolio/upload/route.ts` for image uploads
- [ ] Add portfolio handling to existing `/api/profile/route.ts` (PUT method)
- [ ] Test image upload via Postman or curl
- [ ] Test portfolio update via API
- [ ] Add error handling and validation

**Testing:**
```bash
# Test image upload
curl -X POST http://localhost:3000/api/portfolio/upload \
  -H "Cookie: your-auth-cookie" \
  -F "file=@before.jpg" \
  -F "imageType=before"

# Test portfolio update
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"portfolio": [{"id": "1", "title": "Test", "beforeImage": "url1", "afterImage": "url2"}]}'
```

### Phase 4: UI Integration - File Upload Component (2-3 hours)

**Create:** `/src/components/ui/image-uploader.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button, Progress } from '@nextui-org/react'
import { Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  label: string
  value?: string  // Current image URL
  onChange: (url: string) => void
  imageType: 'before' | 'after'
}

export function ImageUploader({ label, value, onChange, imageType }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)')
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageType', imageType)

      const response = await fetch('/api/portfolio/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {/* Preview */}
      {value && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {!value && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${imageType}`}
          />
          <label htmlFor={`upload-${imageType}`}>
            <Button
              as="span"
              variant="bordered"
              startContent={<Upload className="w-4 h-4" />}
              isDisabled={uploading}
              className="cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Choose Image'}
            </Button>
          </label>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <Progress value={progress} color="primary" size="sm" />
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
```

**Tasks:**
- [ ] Create `image-uploader.tsx` component
- [ ] Replace URL inputs in `portfolio-gallery-manager.tsx` with `<ImageUploader />`
- [ ] Test file upload flow
- [ ] Add loading states and error handling

### Phase 5: Wire Up Portfolio Manager (1-2 hours)

**Update:** `/src/app/[lang]/profile/components/professional-profile.tsx`

**Tasks:**
- [ ] Fetch portfolio from `profile.portfolio` (via useAuth hook)
- [ ] Pass portfolio to `<PortfolioGalleryManager />` component
- [ ] Handle portfolio updates via API
- [ ] Show success/error toast notifications
- [ ] Add loading state while saving

**Example Integration:**
```typescript
const { profile, refreshProfile } = useAuth()
const [isSaving, setIsSaving] = useState(false)

const handlePortfolioChange = async (newPortfolio: PortfolioItem[]) => {
  setIsSaving(true)

  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio: newPortfolio })
    })

    if (!response.ok) throw new Error('Failed to update portfolio')

    await refreshProfile()
    toast.success('Portfolio updated successfully!')
  } catch (err) {
    toast.error('Failed to update portfolio')
  } finally {
    setIsSaving(false)
  }
}

return (
  <PortfolioGalleryManager
    items={profile?.portfolio || []}
    onChange={handlePortfolioChange}
    maxItems={6}
  />
)
```

### Phase 6: Professional Detail Page (30 minutes)

**Update:** `/src/app/[lang]/professionals/[id]/components/professional-detail-page-content.tsx`

**Tasks:**
- [ ] Fetch professional data including portfolio
- [ ] Pass portfolio to `<PortfolioGallery />` component
- [ ] Test portfolio display on public profile

**No code changes needed** - component already accepts portfolio prop!

### Phase 7: Testing & Polish (1-2 hours)

**Test Scenarios:**
- [ ] Professional adds first portfolio item
- [ ] Professional uploads before/after images
- [ ] Professional edits existing portfolio item
- [ ] Professional deletes portfolio item
- [ ] Professional reaches max items limit (6)
- [ ] Customer views professional profile with portfolio
- [ ] Portfolio displays correctly on mobile
- [ ] Portfolio carousel auto-slides
- [ ] Empty state shows when no portfolio items

**Edge Cases:**
- [ ] Upload fails (show error message)
- [ ] Image too large (validate before upload)
- [ ] Invalid file type (validate before upload)
- [ ] Network error during save
- [ ] Portfolio item missing required fields

---

## 📊 Success Metrics

### Implementation Success
- [ ] Professional can upload before/after images
- [ ] Portfolio displays on professional profile page
- [ ] CRUD operations work without errors
- [ ] Images load quickly (<2 seconds)
- [ ] Mobile UX is smooth

### Business Success (Track after launch)
- **Target:** 40% of professionals add at least 1 portfolio item within 30 days
- **Target:** Professionals with portfolios get 25% more applications
- **Target:** Application acceptance rate increases by 15%
- **Target:** Average time to first application decreases by 20%

---

## 🚀 Deployment Checklist

### Before Production
- [ ] Run database migration on production Supabase
- [ ] Create portfolio-images storage bucket on production
- [ ] Configure RLS policies on production
- [ ] Test image upload on production
- [ ] Verify public URLs work
- [ ] Add portfolio feature to release notes

### After Production
- [ ] Monitor error logs for upload failures
- [ ] Track storage usage (images)
- [ ] Get user feedback on feature
- [ ] Iterate based on feedback

---

## 💡 Future Enhancements (Post-MVP)

### Phase 2 Features (After Launch Feedback)
- [ ] Drag-and-drop reordering of portfolio items
- [ ] Bulk image upload
- [ ] Image editing (crop, rotate, filters)
- [ ] Video support (before/after videos)
- [ ] Client testimonials per portfolio item
- [ ] Portfolio item analytics (views, clicks)
- [ ] Featured portfolio items
- [ ] Portfolio item sharing (social media)

### Phase 3 Features (If Scaling Issues Arise)
- [ ] Migrate to separate `professional_portfolio` table
- [ ] Portfolio browsing page (all professionals' work)
- [ ] Portfolio search and filtering
- [ ] Portfolio likes and comments
- [ ] Portfolio marketplace (paid showcase)

---

## 📝 Notes

### Image Optimization
- Consider adding image optimization (resize, compress) on upload
- Use Next.js `<Image>` component for automatic optimization
- Lazy load images on portfolio gallery

### Storage Costs
- Supabase Storage: Free tier includes 1GB
- Estimate: 2 images × 500KB × 1000 professionals = 1GB
- Monitor storage usage and upgrade if needed

### Performance
- Portfolio fetched with user profile (single query)
- No N+1 queries
- Images cached by CDN (Supabase Edge Network)

---

## ⏱️ Time Estimate

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1: Database & Storage | 1-2 hours | Setup and configuration |
| Phase 2: TypeScript Types | 30 minutes | Type definitions |
| Phase 3: API Endpoints | 2-3 hours | Upload and update logic |
| Phase 4: File Upload Component | 2-3 hours | UI component development |
| Phase 5: Portfolio Manager Integration | 1-2 hours | Wire up existing UI |
| Phase 6: Professional Detail Page | 30 minutes | Already mostly done |
| Phase 7: Testing & Polish | 1-2 hours | QA and edge cases |
| **Total** | **8-13 hours** | **~2 days of work** |

---

## 🎯 Priority

**Medium-High** - Important for building trust and showcasing quality, but not blocking MVP launch. Can be added post-launch to differentiate professional profiles.

## 🔗 Dependencies

- ✅ Supabase authentication (already working)
- ✅ User profiles system (already working)
- ✅ Professional profile page (already exists)
- ⚠️ Profile UPDATE API endpoint (needs to be created - see `/docs/profile-crud-audit-and-plan.md`)

---

## ✅ Approval Checklist

Before proceeding, please confirm:
- [ ] Architecture decision approved (JSONB vs separate table)
- [ ] Storage bucket configuration acceptable
- [ ] Max 6-10 portfolio items per professional sufficient
- [ ] File size limit (5MB) acceptable
- [ ] Public image storage acceptable (no privacy concerns)
- [ ] Timeline and effort estimate reasonable
