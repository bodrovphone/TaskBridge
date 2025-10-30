# Task 16: Task Photo Upload (Single Image for MVP)

## Task Description
Add ability for customers to upload a single photo when creating a task. This helps professionals better understand the work needed.

## Requirements (MVP - Free Tier Optimized)
- **Single image only** (not multiple) to stay within free tier
- Upload during task creation flow
- Preview before submission
- Optional - users can create task without photo (default gradient will show)
- Image compression/resize to save storage
- File validation (type, size)

## Acceptance Criteria
- [ ] Image upload component in create task form
- [ ] File picker with drag & drop support
- [ ] Image preview with option to remove/replace
- [ ] Client-side validation (JPG/PNG/WEBP only, max 1MB)
- [ ] Client-side image resize (max 1200px width) before upload
- [ ] Upload to Supabase Storage `task-images` bucket
- [ ] Store public URL in tasks.images[0]
- [ ] Show uploaded image on task detail page
- [ ] Show default gradient if no photo (Task 15 already done)
- [ ] Proper error handling with user-friendly messages
- [ ] Loading states during upload
- [ ] Translation support (EN/BG/RU)

## Technical Implementation

### 1. Supabase Storage Setup (Already Done ✅)
Your storage bucket `task-images` is already configured with policies!

### 2. File Upload Utility
Create `/src/lib/utils/image-upload.ts`:

```typescript
import { createClient } from '@/lib/supabase/client'

/**
 * Compress and resize image before upload
 * Max width: 1200px, quality: 0.8
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      // Calculate dimensions (max 1200px width)
      const maxWidth = 1200
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        0.8 // 80% quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload task image to Supabase Storage
 * Returns public URL or null if failed
 */
export async function uploadTaskImage(
  taskId: string,
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Use JPG, PNG, or WEBP.' }
    }

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      return { url: null, error: 'File too large. Maximum 1MB allowed.' }
    }

    // Compress image
    const compressedBlob = await compressImage(file)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${taskId}.${fileExt}`
    const filePath = `task-images/${fileName}`

    // Upload to Supabase
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('task-images')
      .upload(filePath, compressedBlob, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: 'Upload failed. Please try again.' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Upload error:', err)
    return { url: null, error: 'An unexpected error occurred.' }
  }
}

/**
 * Delete task image from Supabase Storage
 */
export async function deleteTaskImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('task-images')).join('/')

    const { error } = await supabase.storage
      .from('task-images')
      .remove([filePath])

    return !error
  } catch (err) {
    console.error('Delete error:', err)
    return false
  }
}
```

### 3. Image Upload Component
Create `/src/components/tasks/task-image-upload.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'

interface TaskImageUploadProps {
  value: string | null // Image URL
  onChange: (url: string | null) => void
  disabled?: boolean
}

export default function TaskImageUpload({
  value,
  onChange,
  disabled = false
}: TaskImageUploadProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(value)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert(t('createTask.imageUpload.invalidType'))
      return
    }

    if (file.size > 1024 * 1024) {
      alert(t('createTask.imageUpload.tooLarge'))
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      onChange(e.target?.result as string) // Pass to parent for upload
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('createTask.imageUpload.label')}
        <span className="text-gray-500 ml-1">({t('createTask.imageUpload.optional')})</span>
      </label>

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) document.getElementById('file-input')?.click()
          }}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {t('createTask.imageUpload.dragDrop')}
          </p>
          <p className="text-xs text-gray-500">
            {t('createTask.imageUpload.formats')} (max 1MB)
          </p>

          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="relative">
          <Image
            src={preview}
            alt="Task preview"
            width={400}
            height={300}
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            isIconOnly
            size="sm"
            color="danger"
            className="absolute top-2 right-2"
            onPress={handleRemove}
            disabled={disabled}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {t('createTask.imageUpload.helpText')}
      </p>
    </div>
  )
}
```

### 4. Integrate into Create Task Form
Update `/src/app/[lang]/create-task/page.tsx`:

```typescript
import TaskImageUpload from '@/components/tasks/task-image-upload'
import { uploadTaskImage } from '@/lib/utils/image-upload'

// In form state
const [imageFile, setImageFile] = useState<string | null>(null)
const [isUploadingImage, setIsUploadingImage] = useState(false)

// In submit handler (before creating task)
const handleSubmit = async (formData) => {
  let imageUrl = null

  // Upload image if provided
  if (imageFile) {
    setIsUploadingImage(true)
    const { url, error } = await uploadTaskImage(
      tempTaskId, // Generate temp ID or use actual after creation
      userId,
      imageFile
    )
    setIsUploadingImage(false)

    if (error) {
      toast.error(error)
      return // Stop submission
    }

    imageUrl = url
  }

  // Create task with image URL
  const taskData = {
    ...formData,
    images: imageUrl ? [imageUrl] : [], // Store in array for future multi-image
  }

  // Submit to API...
}

// In JSX
<TaskImageUpload
  value={imageFile}
  onChange={setImageFile}
  disabled={isUploadingImage}
/>
```

### 5. Add Translations
Add to `/src/lib/intl/[lang]/tasks.ts`:

```typescript
createTask: {
  imageUpload: {
    label: 'Task Photo',
    optional: 'Optional',
    dragDrop: 'Drag & drop or click to upload',
    formats: 'JPG, PNG, WEBP',
    invalidType: 'Please upload a JPG, PNG, or WEBP image',
    tooLarge: 'Image must be less than 1MB',
    helpText: 'Adding a photo helps professionals understand your task better',
  }
}
```

## Storage Optimization Tips

### Client-side Optimization (Free!)
- ✅ Resize to 1200px max width before upload
- ✅ Compress to 80% JPEG quality
- ✅ Convert PNG to JPEG (smaller size)

### Expected Savings
- Original photo: ~3-5MB
- After optimization: ~200-500KB
- **Storage saved: 80-90%!**

### Monitor Usage
Check storage in Supabase Dashboard → Storage → task-images bucket

## Priority
**High** - Core feature for task quality

## Notes
- This is MVP version (single image only)
- Future: Multiple images (Task 17) after user validation
- Consider image moderation API if spam becomes issue
- Supabase free tier is 1GB = ~5,000 optimized photos

## Next Steps After MVP
If users love it and you hit storage limits:
1. Upgrade to Supabase Pro ($25/month = 100GB)
2. Or switch to Cloudinary free tier (25GB)
3. Or implement "premium" users can upload photos
