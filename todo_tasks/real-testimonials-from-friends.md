# Real Testimonials from Friends

## Task Description
Replace the mocked testimonials on the landing page and `/testimonials` page with real reviews from actual people (friends of the founder). These will be real people with real photos and genuine feedback about Trudify.

## Current State

### 1. Landing Page Testimonials (`/src/features/home/components/landing-page.tsx`)
- 3 customer testimonials with stock Unsplash photos
- 3 professional testimonials with stock Unsplash photos
- Uses translation keys: `landing.testimonials.customers.customer1-3.*`, `landing.testimonials.professionals.pro1-3.*`
- Photo URLs are hardcoded in the component (Unsplash)

### 2. Testimonials Page (`/src/app/[lang]/testimonials/testimonials-content.tsx`)
- 3 customer testimonials (hardcoded with lang-based text)
- 3 professional testimonials (hardcoded with lang-based text)
- Uses `TestimonialCard` component from `/src/components/content/testimonial-card.tsx`
- No photos currently - just name initials

## Requirements

### Data to Collect from Friends
For each testimonial, collect:
- [ ] **Full name** (or preferred display name)
- [ ] **Photo** (real photo, will be uploaded to Supabase Storage)
- [ ] **Location** (city in Bulgaria)
- [ ] **Role** - Customer or Professional (and profession if professional)
- [ ] **Quote** (in Russian, Bulgarian, and English if possible)
- [ ] **Rating** (1-5 stars)
- [ ] **Permission** to use their name/photo publicly

### Photo Requirements
- Square crop recommended (will display as circle)
- Minimum 200x200px for quality
- Face clearly visible
- Professional but friendly appearance

## Implementation Plan

### Phase 1: Collect Real Data
1. Get testimonials from 3-6 friends (mix of customers and professionals)
2. Upload photos to Supabase Storage bucket
3. Get public URLs for photos

### Phase 2: Update Landing Page
Files to update:
- `/src/features/home/components/landing-page.tsx` - Replace Unsplash URLs with real photo URLs
- `/src/lib/intl/en/landing.ts` - Update `landing.testimonials.*` keys
- `/src/lib/intl/bg/landing.ts` - Update `landing.testimonials.*` keys
- `/src/lib/intl/ru/landing.ts` - Update `landing.testimonials.*` keys

### Phase 3: Update Testimonials Page
Files to update:
- `/src/app/[lang]/testimonials/testimonials-content.tsx` - Replace hardcoded testimonials

### Phase 4: Add Photo Support to TestimonialCard
Currently `TestimonialCard` doesn't show photos. Options:
- Add `imageUrl` prop to `TestimonialCard` component
- Or keep showing initials (simpler)

## Acceptance Criteria
- [ ] Landing page shows real testimonials with real photos
- [ ] Testimonials page shows real testimonials
- [ ] All 3 languages (EN/BG/RU) have translated quotes
- [ ] Photos are hosted on Supabase Storage (not external URLs)
- [ ] Names and quotes reflect actual feedback

## Technical Notes

### Translation Key Structure (Landing Page)
```typescript
// Customer testimonials
'landing.testimonials.customers.customer1.name': 'Real Name',
'landing.testimonials.customers.customer1.location': 'Sofia, Bulgaria',
'landing.testimonials.customers.customer1.quote': 'Actual quote here...',

// Professional testimonials
'landing.testimonials.professionals.pro1.name': 'Real Name',
'landing.testimonials.professionals.pro1.profession': 'Electrician',
'landing.testimonials.professionals.pro1.quote': 'Actual quote here...',
```

### Photo Storage
- Bucket: `avatars` or create new `testimonials` bucket
- Path: `testimonials/{name-slug}.jpg`
- Make bucket public for direct URL access

## Data Template (Fill in for each friend)

### Friend 1
- **Name**:
- **Type**: Customer / Professional
- **Profession** (if pro):
- **Location**:
- **Photo URL**:
- **Rating**: /5
- **Quote (RU)**:
- **Quote (BG)**:
- **Quote (EN)**:

### Friend 2
- **Name**:
- **Type**: Customer / Professional
- **Profession** (if pro):
- **Location**:
- **Photo URL**:
- **Rating**: /5
- **Quote (RU)**:
- **Quote (BG)**:
- **Quote (EN)**:

### Friend 3
- **Name**:
- **Type**: Customer / Professional
- **Profession** (if pro):
- **Location**:
- **Photo URL**:
- **Rating**: /5
- **Quote (RU)**:
- **Quote (BG)**:
- **Quote (EN)**:

(Add more as needed)

## Priority
Medium - Social proof is important for conversion but platform works without it

## Dependencies
- Photos from friends
- Quotes in multiple languages
- Supabase Storage bucket for photos
