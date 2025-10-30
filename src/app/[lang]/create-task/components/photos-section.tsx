'use client'

import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody } from '@nextui-org/react'
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface PhotosSectionProps {
 form: any
 initialImages?: string[] // Support existing images in edit mode
}

export function PhotosSection({ form, initialImages }: PhotosSectionProps) {
 const { t } = useTranslation()
 const [isUploading, setIsUploading] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const cameraInputRef = useRef<HTMLInputElement>(null)
 const [photo, setPhoto] = useState<File | null>(null) // MVP: Single image only
 const [photoPreview, setPhotoPreview] = useState<string | null>(null)
 const [hasInitialized, setHasInitialized] = useState(false)
 const [imageError, setImageError] = useState<string | null>(null)

 // Initialize with existing image if in edit mode (only once)
 useEffect(() => {
   if (initialImages && initialImages.length > 0 && !hasInitialized) {
     setPhotoPreview(initialImages[0])
     setHasInitialized(true)
   }
 }, [initialImages, hasInitialized])

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Clear previous errors
  setImageError(null)

  // Validate file type first
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
   setImageError(t('createTask.photos.invalidType', `File is not a supported image format (JPG, PNG, WebP)`))
   return
  }

  // Check file size (1MB max for MVP)
  const isOversized = file.size > 1024 * 1024
  if (isOversized) {
   setImageError(t('createTask.photos.fileTooLarge', `Image is too large (max 1MB). This image will not be uploaded. You can change it now or edit the task later.`))
  }

  // Store file for later upload (will be uploaded when form is submitted)
  setPhoto(file)

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    setPhotoPreview(e.target?.result as string)
  }
  reader.readAsDataURL(file)

  // Store file in form for submission (or null if oversized)
  form.setFieldValue('photoFile', isOversized ? null : file)
  form.setFieldValue('imageOversized', isOversized)

  // Reset file input
  if (fileInputRef.current) {
   fileInputRef.current.value = ''
  }
 }

 const removePhoto = () => {
  setPhoto(null)
  setPhotoPreview(null)
  setImageError(null)
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
         <p>{t('createTask.photos.maxSize', '1MB maximum')}</p>
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

   {/* Photo Preview */}
   {photoPreview && (
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

   {/* Upload Progress */}
   {isUploading && (
    <div className="text-center text-sm text-gray-500">
     {t('createTask.photos.uploading', 'Uploading photos...')}
    </div>
   )}
  </div>
 )
}
