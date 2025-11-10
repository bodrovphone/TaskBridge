'use client'

import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, Progress } from '@nextui-org/react'
import { Upload, X, Image as ImageIcon, Camera, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { compressImageAdvanced, formatBytes } from '@/lib/utils/advanced-image-compression'

interface PhotosSectionProps {
 form: any
 initialImages?: string[] // Support existing images in edit mode
}

export function PhotosSection({ form, initialImages }: PhotosSectionProps) {
 const { t } = useTranslation()
 const [isCompressing, setIsCompressing] = useState(false)
 const [compressionProgress, setCompressionProgress] = useState(0)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const cameraInputRef = useRef<HTMLInputElement>(null)
 const [photo, setPhoto] = useState<File | null>(null) // MVP: Single image only
 const [photoPreview, setPhotoPreview] = useState<string | null>(null)
 const [hasInitialized, setHasInitialized] = useState(false)
 const [imageError, setImageError] = useState<string | null>(null)

 // Compression statistics
 const [originalSize, setOriginalSize] = useState<number>(0)
 const [compressedSize, setCompressedSize] = useState<number>(0)
 const [savingsPercent, setSavingsPercent] = useState<number>(0)

 // Initialize with existing image if in edit mode (only once)
 useEffect(() => {
   if (initialImages && initialImages.length > 0 && !hasInitialized) {
     setPhotoPreview(initialImages[0])
     setHasInitialized(true)
   }
 }, [initialImages, hasInitialized])

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Clear previous state
  setImageError(null)
  setOriginalSize(0)
  setCompressedSize(0)
  setSavingsPercent(0)

  // Validate file type first
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
   setImageError(t('createTask.photos.invalidType', `File is not a supported image format (JPG, PNG, WebP)`))
   return
  }

  // Store original file
  setPhoto(file)
  setOriginalSize(file.size)

  // Start compression - optimize BEFORE validation
  setIsCompressing(true)
  setCompressionProgress(0)

  try {
    // Compress image with progress callback
    const result = await compressImageAdvanced(
      file,
      {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.85,
      },
      (progress) => {
        setCompressionProgress(progress)
      }
    )

    // Store compression results
    setCompressedSize(result.compressedSize)
    setSavingsPercent(result.savingsPercent)

    // NOW validate the compressed file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const isOversized = result.compressedSize > MAX_SIZE

    if (isOversized) {
      // Even after compression, file is still too large
      setImageError(t('createTask.photos.fileTooLarge', `Image is still too large after optimization (max 5MB). This image will not be uploaded. You can change it now or edit the task later.`))

      // Show preview but don't store for upload
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(result.blob)

      form.setFieldValue('photoFile', null)
      form.setFieldValue('imageOversized', true)
      return
    }

    // File is valid after compression - create preview and store
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(result.blob)

    // Store compressed blob in form for submission
    form.setFieldValue('photoFile', result.blob)
    form.setFieldValue('imageOversized', false)
  } catch (error) {
    console.error('Compression error:', error)
    setImageError('Failed to optimize image. Please try another image.')
    form.setFieldValue('photoFile', null)
  } finally {
    setIsCompressing(false)
    setCompressionProgress(0)
  }

  // Reset file input
  if (fileInputRef.current) {
   fileInputRef.current.value = ''
  }
  if (cameraInputRef.current) {
   cameraInputRef.current.value = ''
  }
 }

 const removePhoto = () => {
  setPhoto(null)
  setPhotoPreview(null)
  setImageError(null)
  setOriginalSize(0)
  setCompressedSize(0)
  setSavingsPercent(0)
  form.setFieldValue('photoFile', null)
  form.setFieldValue('photos', [])
  form.setFieldValue('imageOversized', false)
 }

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
    <div className="p-2 bg-pink-100 rounded-lg">
     <ImageIcon className="w-6 h-6 text-pink-600" />
    </div>
    <div>
     <h2 className="text-2xl font-bold text-gray-900 mb-1">
      {t('createTask.photos.title', 'Add photos (optional)')}
     </h2>
     <p className="text-gray-600">
      {t('createTask.photos.help', 'Photos help professionals understand your task better')}
     </p>
    </div>
   </div>

   {/* Upload Zone */}
   {!photoPreview && (
    <div className="space-y-4">
     <Card
      isPressable
      onPress={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
     >
      <CardBody className="p-8 text-center">
       <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-primary-50 rounded-full">
         <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
         <p className="font-semibold text-gray-900">
          {t('createTask.photos.dragDrop', 'Drag and drop an image here')}
         </p>
         <p className="text-sm text-gray-500">
          {t('createTask.photos.orBrowse', 'or click to browse')}
         </p>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
         <p>{t('createTask.photos.maxSize', '5MB maximum')}</p>
         <p>{t('createTask.photos.formats', 'JPG, PNG, WebP')}</p>
        </div>
       </div>
      </CardBody>
     </Card>

     {/* Camera Button (Mobile) */}
     <div className="text-center">
      <Button
       color="secondary"
       variant="bordered"
       size="lg"
       startContent={<Camera className="w-5 h-5" />}
       onPress={() => cameraInputRef.current?.click()}
       className="w-full sm:w-auto"
      >
       {t('createTask.photos.takePhoto', 'Take a Photo')}
      </Button>
     </div>
    </div>
   )}

   {/* Hidden File Input - Gallery */}
   <input
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleFileSelect}
    className="hidden"
   />

   {/* Hidden File Input - Camera (Mobile) */}
   <input
    ref={cameraInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    capture="environment"
    onChange={handleFileSelect}
    className="hidden"
   />

   {/* Compression Progress */}
   {isCompressing && (
    <div className="space-y-3">
     <Card className="border-2 border-blue-200 bg-blue-50">
      <CardBody className="p-4">
       <div className="flex items-center gap-3 mb-2">
        <div className="animate-spin">
         <ImageIcon className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-blue-800">
         {t('createTask.photos.optimizing', 'Optimizing image for faster upload...')}
        </p>
       </div>
       <Progress
        value={compressionProgress}
        color="primary"
        size="sm"
        className="max-w-full"
       />
      </CardBody>
     </Card>
    </div>
   )}

   {/* Photo Preview */}
   {photoPreview && !isCompressing && (
    <div className="space-y-3">
     <div className="relative group">
      <Card>
       <CardBody className="p-0">
        <Image
         src={photoPreview}
         alt="Task photo"
         width={600}
         height={400}
         className="w-full h-64 object-cover rounded-lg"
        />
       </CardBody>
      </Card>
      <Button
       isIconOnly
       size="sm"
       color="danger"
       variant="solid"
       className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
       onPress={removePhoto}
      >
       <X className="w-4 h-4" />
      </Button>
     </div>

     {/* Compression Success Message */}
     {compressedSize > 0 && savingsPercent > 0 && !imageError && (
      <Card className="border-2 border-green-200 bg-green-50">
       <CardBody className="p-4">
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
           <p className="text-sm font-medium text-green-800">
            {t('createTask.photos.optimized', 'Image optimized successfully')}
           </p>
           <p className="text-xs text-green-600">
            {formatBytes(originalSize)} → {formatBytes(compressedSize)}
           </p>
          </div>
         </div>
         <div className="text-right">
          <p className="text-xl font-bold text-green-700">
           {savingsPercent}%
          </p>
          <p className="text-xs text-green-600">
           {t('createTask.photos.smaller', 'smaller')}
          </p>
         </div>
        </div>
       </CardBody>
      </Card>
     )}

     {/* Error Message */}
     {imageError && (
      <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
       <p className="text-sm text-warning-800">
        ⚠️ {imageError}
       </p>
      </div>
     )}
    </div>
   )}
  </div>
 )
}
