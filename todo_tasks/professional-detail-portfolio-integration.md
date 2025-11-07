# Professional Detail Page - Portfolio Gallery Integration

## Task Description
Wire up the Portfolio Gallery ("My Demos") section on the professional detail page to fetch and display real portfolio items. The UI components already exist with before/after image comparisons, tags, and lightbox functionality - we just need to integrate with the database or decide on the data structure.

## Current State
- ✅ UI components exist: `<PortfolioGallery />` with lightbox, before/after slider, tags
- ✅ Conditional rendering: Only shows when `portfolio.length > 0`
- ❌ API returns empty array: `portfolio: []`
- ⚠️ Database table unknown: Need to check if `portfolio` table exists or design schema

## Target State
- Portfolio items fetched from database for each professional
- Display before/after photos, project descriptions, tags, difficulty
- All existing UI features work with real data (lightbox, tags filtering, etc.)

## Requirements

### 1. Database Schema Decision

**Option A: Dedicated Portfolio Table** (Recommended)
Create a new `portfolio` table:
```sql
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  duration TEXT, -- e.g., "4 часа", "2 дни"
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[], -- Array of tags like ["Дълбоко почистване", "Кухня", "Баня"]
  display_order INTEGER DEFAULT 0, -- For custom ordering
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast professional lookup
CREATE INDEX idx_portfolio_professional_id ON portfolio(professional_id, display_order);
```

**Option B: Use Supabase Storage with JSON Metadata**
Store images in Supabase Storage and metadata in JSONB column on `users` table:
- Pros: Simpler, no new table
- Cons: Less flexible, harder to query, no relational benefits

**Decision**: Go with Option A (dedicated table) for better structure and scalability

- [ ] Create portfolio table schema
- [ ] Add RLS policies (public read, professional can only edit own)
- [ ] Create indexes for performance

### 2. Supabase Storage Setup
Portfolio images need storage:

- [ ] Create storage bucket: `portfolio-images`
- [ ] Set bucket to public (portfolio items are publicly viewable)
- [ ] Organize images by professional: `{professional_id}/before-{portfolio_id}.jpg`
- [ ] Set up image optimization/resizing (optional, using Supabase transforms)

```typescript
// Storage bucket policies
// Public read access
CREATE POLICY "Portfolio images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

// Professionals can upload their own
CREATE POLICY "Professionals can upload their portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. API Implementation
Update `/src/app/api/professionals/[id]/route.ts`:

- [ ] Fetch portfolio items where `professional_id = id`
- [ ] Use service role to bypass RLS (public portfolio should be visible)
- [ ] Fetch in parallel with main professional query for performance
- [ ] Order by `display_order ASC` or `created_at DESC`
- [ ] Limit to 20 most recent items (or configurable)

```typescript
// Parallel fetch example
const [professionalResult, portfolioResult] = await Promise.all([
  supabaseAdmin.from('users').select('*').eq('id', id).single(),
  supabaseAdmin
    .from('portfolio')
    .select('*')
    .eq('professional_id', id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(20)
]);
```

### 4. Data Transformation
Transform database portfolio items to match UI component expectations:

```typescript
interface PortfolioItemForUI {
  id: string;
  title: string;
  beforeImage: string; // Full URL to Supabase Storage
  afterImage: string; // Full URL to Supabase Storage
  description: string;
  duration: string; // "4 часа"
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[]; // ["Дълбоко почистване", "Кухня"]
}

// Transformation
const portfolioItems = portfolioResult.data?.map(item => ({
  id: item.id,
  title: item.title,
  beforeImage: `${supabaseUrl}/storage/v1/object/public/portfolio-images/${item.before_image_url}`,
  afterImage: `${supabaseUrl}/storage/v1/object/public/portfolio-images/${item.after_image_url}`,
  description: item.description || '',
  duration: item.duration || '',
  difficulty: item.difficulty as 'Easy' | 'Medium' | 'Hard',
  tags: item.tags || [],
})) || [];
```

### 5. Image Upload Flow (Future Feature)
For professionals to add portfolio items:
- [ ] Add "Add Portfolio Item" button on professional profile edit page
- [ ] Create upload form with before/after image pickers
- [ ] Upload to Supabase Storage
- [ ] Create portfolio table record with image URLs
- [ ] Add drag-and-drop reordering for `display_order`

### 6. Empty State Handling
- [ ] When `portfolio.length === 0`, section should not render (existing behavior)
- [ ] Consider showing "No portfolio items yet" on professional's own profile (edit mode)

### 7. Image Optimization
- [ ] Use Supabase image transformations for thumbnails
  - Example: `?width=400&height=300&resize=cover`
- [ ] Lazy load images for performance
- [ ] Use Next.js `<Image>` component for automatic optimization
- [ ] Consider WebP format for better compression

### 8. Testing Checklist
- [ ] Professional with 0 portfolio items - section doesn't render
- [ ] Professional with 1-3 items - displays in grid correctly
- [ ] Professional with 10+ items - grid layout works, no overflow
- [ ] Before/after slider works smoothly
- [ ] Lightbox opens and closes correctly
- [ ] Tags display and are clickable (if filtering implemented)
- [ ] Images load with proper aspect ratios
- [ ] Mobile responsive layout works
- [ ] Image placeholders show while loading

## Technical Notes

### Database Query Performance
- Index on `(professional_id, display_order)` for fast sorted queries
- Limit to 20 items to avoid large payloads
- Consider pagination for professionals with 50+ items

### Image Storage Best Practices
- Bucket organization: `portfolio-images/{professional_id}/{timestamp}-{type}.jpg`
  - Example: `portfolio-images/123abc/1699876543-before.jpg`
- Max file size: 5MB per image (enforced client-side)
- Allowed formats: JPG, PNG, WebP
- Auto-generate thumbnails using Supabase transforms

### Alternative: No Database Table (MVP Approach)
If we want to ship faster without a new table:
- [ ] Store portfolio items as JSONB array in `users.portfolio_items` column
- [ ] Still use Supabase Storage for images
- [ ] Pros: Simpler, no migration
- [ ] Cons: Less flexible, harder to manage

```sql
ALTER TABLE users ADD COLUMN portfolio_items JSONB DEFAULT '[]'::jsonb;
```

### Fallback Behavior
If API fetch fails:
- Log error but don't break page
- Return empty portfolio array
- Section simply won't render (graceful degradation)

## Dependencies
- Existing `<PortfolioGallery />` component in `/src/features/professionals/components/sections/portfolio-gallery.tsx`
- Supabase Storage for images
- Portfolio table (to be created) OR JSONB column
- Image optimization library (Next.js Image or Supabase transforms)

## Priority
**Low-Medium** - Nice to have for professional credibility, but not critical for MVP

## Estimated Effort
**With New Table:**
- Database schema + RLS: 1 hour
- Storage bucket setup: 30 min
- API implementation: 1.5 hours
- Data transformation: 1 hour
- Testing: 1 hour
- **Total**: ~5 hours

**With JSONB Column (MVP):**
- Schema update: 15 min
- Storage bucket setup: 30 min
- API implementation: 1 hour
- Data transformation: 30 min
- Testing: 45 min
- **Total**: ~3 hours

## Follow-up Tasks
- [ ] Add portfolio item upload UI for professionals
- [ ] Add image editing (crop, rotate, filters)
- [ ] Add portfolio item reordering (drag and drop)
- [ ] Add "Featured" toggle for highlighting best work
- [ ] Add portfolio item analytics (views, clicks)
- [ ] Add video support for portfolio items
- [ ] Add client testimonials linked to portfolio items
