'use client'

import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody } from '@nextui-org/react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface PhotosSectionProps {
 form: any
}

export function PhotosSection({ form }: PhotosSectionProps) {
 const { t } = useTranslation()
 const [isUploading, setIsUploading] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [photos, setPhotos] = useState<string[]>([])
 const [errors, setErrors] = useState<string[]>([])

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  // Validate file count
  if (photos.length + files.length > 5) {
   alert(t('createTask.errors.tooManyPhotos', 'Maximum 5 photos allowed'))
   return
  }

  setIsUploading(true)

  try {
   const newPhotoUrls: string[] = []

   for (const file of Array.from(files)) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
     alert(t('createTask.photos.fileTooLarge', `File ${file.name} is too large. Maximum size is 5MB`))
     continue
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
     alert(t('createTask.photos.invalidType', `File ${file.name} is not a supported image format`))
     continue
    }

    // TODO: Upload to cloud storage (Cloudinary/AWS S3)
    // For now, create a local object URL as placeholder
    const objectUrl = URL.createObjectURL(file)
    newPhotoUrls.push(objectUrl)
   }

   // Update form with new photo URLs
   const updatedPhotos = [...photos, ...newPhotoUrls]
   form.setFieldValue('photos', updatedPhotos)
   setPhotos(updatedPhotos)
  } catch (error) {
   console.error('Error uploading photos:', error)
   alert(t('createTask.photos.uploadError', 'Failed to upload photos. Please try again.'))
  } finally {
   setIsUploading(false)
   // Reset file input
   if (fileInputRef.current) {
    fileInputRef.current.value = ''
   }
  }
 }

 const removePhoto = (index: number) => {
  const newPhotos = photos.filter((_: any, i: number) => i !== index)
  form.setFieldValue('photos', newPhotos)
  setPhotos(newPhotos)
 }

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
     {t('createTask.photos.title', 'Add photos (optional)')}
    </h2>
    <p className="text-gray-600">
     {t('createTask.photos.help', 'Photos help professionals understand your task better')}
    </p>
   </div>

   {/* Upload Zone */}
   {photos.length < 5 && (
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
         {t('createTask.photos.dragDrop', 'Drag and drop images here')}
        </p>
        <p className="text-sm text-gray-500">
         {t('createTask.photos.orBrowse', 'or click to browse')}
        </p>
       </div>
       <div className="text-xs text-gray-400 space-y-1">
        <p>{t('createTask.photos.maxFiles', 'Maximum 5 images')}</p>
        <p>{t('createTask.photos.maxSize', '5MB per image')}</p>
        <p>{t('createTask.photos.formats', 'JPG, PNG, WebP')}</p>
       </div>
      </div>
     </CardBody>
    </Card>
   )}

   {/* Hidden File Input */}
   <input
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={handleFileSelect}
    className="hidden"
   />

   {/* Photo Previews */}
   {photos.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
     {photos.map((photoUrl: string, index: number) => (
      <div key={index} className="relative group">
       <Card>
        <CardBody className="p-0 aspect-square">
         <Image
          src={photoUrl}
          alt={`Photo ${index + 1}`}
          fill
          className="object-cover rounded-lg"
         />
        </CardBody>
       </Card>
       <Button
        isIconOnly
        size="sm"
        color="danger"
        variant="solid"
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onPress={() => removePhoto(index)}
       >
        <X className="w-4 h-4" />
       </Button>
      </div>
     ))}

     {/* Add More Button */}
     {photos.length < 5 && (
      <button
       type="button"
       onClick={() => fileInputRef.current?.click()}
       className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary"
      >
       <ImageIcon className="w-8 h-8" />
       <span className="text-sm font-medium">
        {t('createTask.photos.addMore', 'Add more')}
       </span>
      </button>
     )}
    </div>
   )}

   {/* Error Message */}
   {errors && errors.length > 0 && (
    <p className="text-danger text-sm">
     {t(errors[0] as string)}
    </p>
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
