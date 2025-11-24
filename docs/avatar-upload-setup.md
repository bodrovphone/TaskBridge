# Avatar Upload System Setup Guide

## Overview

The avatar upload system allows users to upload custom profile pictures with a priority fallback system:

1. **Custom Avatar** (`avatar_url`) - Highest priority
2. **OAuth Avatar** (`oauth_avatar_url`) - Fallback from Google/Facebook
3. **Default/Initials** - Final fallback

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration
npx supabase db push
```

Or manually run the SQL from: `/supabase/migrations/20251124_add_avatar_upload_support.sql`

### 2. Create Supabase Storage Bucket

Go to Supabase Dashboard → Storage → Create Bucket:

- **Bucket Name**: `avatars`
- **Public**: ✅ Yes (so avatars are publicly accessible)
- **File Size Limit**: 2MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 3. Configure Storage Policies

In Supabase Dashboard → Storage → `avatars` bucket → Policies:

#### Policy 1: Upload Own Avatar
- **Name**: Users can upload their own avatars
- **Operation**: INSERT
- **Policy Definition**:
  ```sql
  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

#### Policy 2: Update Own Avatar
- **Name**: Users can update their own avatars
- **Operation**: UPDATE
- **Policy Definition**:
  ```sql
  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

#### Policy 3: Delete Own Avatar
- **Name**: Users can delete their own avatars
- **Operation**: DELETE
- **Policy Definition**:
  ```sql
  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

#### Policy 4: Public Read
- **Name**: Anyone can view avatars
- **Operation**: SELECT
- **Policy Definition**:
  ```sql
  bucket_id = 'avatars'
  ```

## How It Works

### Upload Flow

1. User clicks avatar in profile page
2. Modal opens with current avatar
3. User selects image (validated: JPG/PNG/WEBP, max 2MB)
4. Image is compressed to 400x400px at 90% quality
5. Uploaded to `/api/profile/avatar` endpoint
6. Stored in Supabase Storage at `avatars/{userId}/avatar-{timestamp}.{ext}`
7. `users.avatar_url` updated with public URL
8. Old avatar file cleaned up (if exists)

### Delete Flow

1. User clicks "Remove" button in modal
2. API deletes file from storage
3. `users.avatar_url` set to `null`
4. Falls back to `oauth_avatar_url` (if exists) or initials

### Priority Logic

```typescript
function getDisplayAvatar(user) {
  if (user.avatar_url) return user.avatar_url      // Custom (priority 1)
  if (user.oauth_avatar_url) return user.oauth_avatar_url  // OAuth (priority 2)
  return null  // Show initials (priority 3)
}
```

## File Structure

```
src/
├── lib/utils/
│   └── avatar-upload.ts          # Upload/delete utilities
├── app/api/profile/avatar/
│   └── route.ts                  # API endpoint (POST/DELETE)
└── app/[lang]/profile/components/
    └── avatar-upload.tsx         # UI component

supabase/
└── migrations/
    └── 20251124_add_avatar_upload_support.sql
```

## API Endpoints

### POST /api/profile/avatar
Upload new avatar

**Request**: `multipart/form-data`
```typescript
{
  avatar: File  // JPG/PNG/WEBP, max 2MB
}
```

**Response**:
```json
{
  "success": true,
  "avatarUrl": "https://...supabase.co/storage/v1/object/public/avatars/...",
  "message": "Avatar uploaded successfully"
}
```

### DELETE /api/profile/avatar
Remove custom avatar

**Response**:
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

## Image Optimization

Avatars are automatically optimized:
- **Cropped**: Square (center crop)
- **Resized**: 400x400px (perfect for UI)
- **Compressed**: 90% JPEG quality
- **Result**: ~50-200KB (vs 2MB original)

## Security

- ✅ Authentication required (via `authenticateRequest`)
- ✅ File type validation (JPG/PNG/WEBP only)
- ✅ File size limit (2MB)
- ✅ Users can only access their own avatars (folder = userId)
- ✅ Public read access (avatars are meant to be visible)
- ✅ Old avatars auto-deleted on new upload

## Future Enhancements

- [ ] Implement OAuth API routes to populate `oauth_avatar_url`
- [ ] Add image cropping UI before upload
- [ ] Support animated GIF avatars
- [ ] Add image filters/effects
- [ ] Compress to WebP format (better than JPEG)
- [ ] Add avatar history/gallery
