# Image Upload Limits Configuration Guide

## Overview
This guide explains how to adjust image upload limits in TaskBridge and what additional configurations may be required in different parts of the system.

## Current Configuration (Updated: 5MB)

The image upload limit has been increased from **1MB to 5MB** throughout the application.

## Files Changed

### 1. Frontend Validation (Client-Side)
These files validate image size before allowing upload:

#### `/src/app/[lang]/create-task/components/photos-section.tsx`
```typescript
// Check file size (5MB max)
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const isOversized = file.size > MAX_SIZE
```
**Lines**: 45-47

#### `/src/lib/utils/image-upload.ts`
```typescript
// Validate file size (5MB max)
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
if (file.size > MAX_SIZE) {
  return { url: null, error: 'File too large. Maximum 5MB allowed.' }
}
```
**Lines**: 60-64

#### `/src/components/tasks/task-image-upload.tsx`
```typescript
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
if (file.size > MAX_SIZE) {
  alert(t('createTask.imageUpload.tooLarge'))
  return
}
```
**Lines**: 32-36

### 2. Translation Files (i18n)
Update user-facing messages in all supported languages:

- `/src/lib/intl/en/tasks.ts` (Lines 174, 177)
- `/src/lib/intl/bg/tasks.ts` (Lines 175, 178)
- `/src/lib/intl/ru/tasks.ts` (Lines 175, 178)

Translation keys updated:
- `createTask.photos.maxSize`: "1MB maximum" → "5MB maximum"
- `createTask.photos.fileTooLarge`: Updated to reflect 5MB limit

## Infrastructure Configuration

### Supabase Storage Bucket Limits

**IMPORTANT**: Verify your Supabase storage bucket configuration allows files up to 5MB:

#### Check Current Bucket Settings:
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Storage** → `task-images` bucket
3. Click **Edit bucket**
4. Verify **File size limit** setting

#### Update Bucket Limit (if needed):
```sql
-- Run in Supabase SQL Editor if file size limit needs updating
UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5MB in bytes (5 * 1024 * 1024)
WHERE name = 'task-images';
```

Alternatively, use the Supabase Dashboard:
- **Storage** → `task-images` → **Settings**
- Set **File size limit**: `5` MB

### Vercel Configuration (if applicable)

Vercel has a default body size limit of **4.5MB** for API routes. If you're uploading files through API routes:

#### `vercel.json`
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "bodyParser": {
    "sizeLimit": "6mb"
  }
}
```

### Next.js Configuration

#### `next.config.js`
Ensure API routes can handle 5MB+ requests:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '6mb', // Allow slightly more than max file size
    },
  },
  // For App Router (Next.js 13+)
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
}

module.exports = nextConfig
```

## How to Increase Limits Further

If you need to increase the limit beyond 5MB in the future:

### Step 1: Update Frontend Validation
Change `MAX_SIZE` constant in these files:
1. `/src/app/[lang]/create-task/components/photos-section.tsx`
2. `/src/lib/utils/image-upload.ts`
3. `/src/components/tasks/task-image-upload.tsx`

Example for 10MB:
```typescript
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
```

### Step 2: Update Translation Keys
Update the following keys in **all language files** (EN, BG, RU):
- `createTask.photos.maxSize`
- `createTask.photos.fileTooLarge`

### Step 3: Update Infrastructure
- **Supabase**: Update storage bucket file size limit
- **Vercel**: Update `bodyParser.sizeLimit` in `vercel.json`
- **Next.js**: Update `api.bodyParser.sizeLimit` in `next.config.js`

### Step 4: Test Upload Flow
1. Test with a file slightly under the new limit
2. Test with a file at exactly the limit
3. Test with a file over the limit (should show error)
4. Test upload to Supabase Storage succeeds

## Cost Considerations

### Storage Costs (Supabase)
- **Free Plan**: 1GB storage included
- **Pro Plan**: 100GB storage included
- **Additional**: $0.021 per GB/month

**Estimate**: If each task has one 5MB image:
- 1,000 tasks = ~5GB storage = $0.10/month (over free tier)
- 10,000 tasks = ~50GB storage = $1.05/month (over free tier)

### Bandwidth Costs
- **Free Plan**: 2GB egress/month
- **Pro Plan**: 200GB egress/month
- **Additional**: $0.09 per GB

## Best Practices

1. **Always validate on both client and server**: Client validation for UX, server validation for security
2. **Use compression**: The existing `compressImage()` function in `image-upload.ts` reduces file size by 80-90%
3. **Set reasonable limits**: 5MB is sufficient for high-quality photos from modern devices
4. **Monitor storage usage**: Check Supabase dashboard regularly
5. **Consider lazy loading**: For pages with many images, implement progressive image loading
6. **Optimize existing images**: Run batch compression on old images if storage becomes an issue

## Troubleshooting

### Upload fails with "File too large" despite being under 5MB
- **Check**: Supabase bucket file size limit
- **Check**: Vercel/Next.js body size limits
- **Check**: Browser console for client-side validation errors

### Upload succeeds but image is rejected by server
- **Check**: Server-side validation in API routes
- **Check**: Supabase RLS policies for storage bucket
- **Check**: File type validation (only JPG, PNG, WebP allowed)

### Images display incorrectly after upload
- **Check**: Image compression settings in `image-upload.ts`
- **Check**: Image orientation (EXIF metadata)
- **Check**: Browser compatibility with image format

## Related Files

- **Image Upload Logic**: `/src/lib/utils/image-upload.ts`
- **Photo Section Component**: `/src/app/[lang]/create-task/components/photos-section.tsx`
- **Supabase Setup Guide**: `/docs/infrastructure/supabase-vercel-setup.md`
- **Storage Bucket Setup**: `/docs/guides/supabase-task-images-setup.md`

## Summary of Changes Made

### Code Changes (5MB Limit)
✅ Frontend validation updated in 3 components
✅ Translation keys updated for EN, BG, RU
✅ Error messages updated to reflect 5MB limit
✅ UI help text updated to show "5MB maximum"

### Infrastructure Requirements
⚠️ **TODO**: Verify Supabase bucket allows 5MB files
⚠️ **TODO**: Update Vercel config if using API routes for upload
⚠️ **TODO**: Test upload flow end-to-end with 4-5MB file

---

**Last Updated**: 2025-10-31
**Current Limit**: 5MB
**File Types**: JPG, PNG, WebP
**Compression**: Automatic (max width 1200px, 80% JPEG quality)
