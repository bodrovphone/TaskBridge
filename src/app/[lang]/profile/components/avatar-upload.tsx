'use client'

import { useState, useRef } from 'react'
import { Avatar, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Progress } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { Camera, Upload, X, Check, CircleUser } from 'lucide-react'
import { uploadAvatar, deleteAvatar } from '@/lib/utils/avatar-upload'
import { useAuth } from '@/features/auth'
import { compressImageAdvanced, formatBytes } from '@/lib/utils/advanced-image-compression'

interface AvatarUploadProps {
 currentAvatar?: string | null
 userName: string
 onAvatarChange: (value: string) => void
 size?: 'sm' | 'md' | 'lg'
 className?: string
}

export function AvatarUpload({
 currentAvatar,
 userName,
 onAvatarChange,
 size = 'lg',
 className = ''
}: AvatarUploadProps) {
 const t = useTranslations()
 const { authenticatedFetch } = useAuth()
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [previewImage, setPreviewImage] = useState<string | null>(null)
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [isLoading, setIsLoading] = useState(false)
 const [isCompressing, setIsCompressing] = useState(false)
 const [compressionProgress, setCompressionProgress] = useState(0)
 const [compressionInfo, setCompressionInfo] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const handleAvatarClick = () => {
  console.log('[AvatarUpload] Avatar clicked, opening modal')
  setIsModalOpen(true)
  setPreviewImage(null)
  setSelectedFile(null)
  setError(null)
 }

 const handleFileSelect = () => {
  console.log('[AvatarUpload] Select image button clicked')
  fileInputRef.current?.click()
 }

 const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  console.log('[AvatarUpload] File selected:', file?.name, file?.type, file?.size)

  if (!file) {
   console.log('[AvatarUpload] No file selected')
   return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
   console.error('[AvatarUpload] Invalid file type:', file.type)
   setError(t('profile.avatar.invalidFileType'))
   return
  }

  // Max original file size: 20MB (we'll compress it)
  const maxOriginalSize = 20 * 1024 * 1024
  if (file.size > maxOriginalSize) {
   console.error('[AvatarUpload] File too large even for compression:', file.size, 'bytes')
   setError(t('profile.avatar.fileTooLargeForCompression'))
   return
  }

  console.log('[AvatarUpload] File validation passed, starting compression')

  // Compress large images automatically
  setIsCompressing(true)
  setCompressionProgress(0)
  setCompressionInfo(null)
  setError(null)

  try {
   // Compress image using advanced compression
   // Avatar preset: 400x400px max, 0.5MB target, high quality
   const result = await compressImageAdvanced(
    file,
    {
     maxSizeMB: 0.5, // 500KB max for avatars
     maxWidthOrHeight: 800, // Larger than 400px to allow cropping
     initialQuality: 0.9,
    },
    (progress) => setCompressionProgress(progress)
   )

   console.log('[AvatarUpload] Compression complete:', {
    original: formatBytes(result.originalSize),
    compressed: formatBytes(result.compressedSize),
    savings: result.savingsPercent + '%'
   })

   // Show compression info if significant savings
   if (result.savingsPercent > 10) {
    setCompressionInfo(
     `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${result.savingsPercent}% ${t('profile.avatar.saved')})`
    )
   }

   // Create a File object from the compressed blob
   const compressedFile = new File([result.blob], file.name, {
    type: result.format,
   })

   // Store the compressed file for upload
   setSelectedFile(compressedFile)

   // Create preview from compressed image
   const reader = new FileReader()
   reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    console.log('[AvatarUpload] Preview created, length:', dataUrl?.length)
    setPreviewImage(dataUrl)
   }
   reader.onerror = (e) => {
    console.error('[AvatarUpload] FileReader error:', e)
    setError('Failed to read file')
   }
   reader.readAsDataURL(result.blob)

  } catch (err) {
   console.error('[AvatarUpload] Compression error:', err)
   setError(t('profile.avatar.compressionError'))
  } finally {
   setIsCompressing(false)
   setCompressionProgress(0)
  }
 }

 const handleSave = async () => {
  if (!selectedFile) return

  setIsLoading(true)
  setError(null)

  try {
   // Upload avatar via API
   const { url, error: uploadError } = await uploadAvatar(selectedFile, authenticatedFetch)

   if (uploadError) {
    setError(uploadError)
    return
   }

   if (url) {
    // Update parent component with new avatar URL
    onAvatarChange(url)
    setIsModalOpen(false)
    setPreviewImage(null)
    setSelectedFile(null)
   }
  } catch (err) {
   console.error('[AvatarUpload] Save error:', err)
   setError(t('profile.avatar.uploadError'))
  } finally {
   setIsLoading(false)
  }
 }

 const handleCancel = () => {
  setIsModalOpen(false)
  setPreviewImage(null)
  setSelectedFile(null)
  setError(null)
  setCompressionInfo(null)
 }

 const handleRemoveAvatar = async () => {
  setIsLoading(true)
  setError(null)

  try {
   // Delete avatar via API
   const { success, error: deleteError } = await deleteAvatar(authenticatedFetch)

   if (deleteError) {
    setError(deleteError)
    return
   }

   if (success) {
    // Update parent component (sets avatar to null, falls back to OAuth)
    onAvatarChange('')
    setIsModalOpen(false)
    setPreviewImage(null)
    setSelectedFile(null)
   }
  } catch (err) {
   console.error('[AvatarUpload] Delete error:', err)
   setError(t('profile.avatar.deleteError'))
  } finally {
   setIsLoading(false)
  }
 }

 const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
 }

 const iconSizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
 }

 return (
  <>
   {/* Avatar with upload indicator */}
   <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
    {currentAvatar ? (
     <Avatar
      src={currentAvatar}
      name={userName}
      size={size}
      className={`${sizeClasses[size]} ${className} transition-all duration-200 group-hover:opacity-80`}
     />
    ) : (
     /* Default avatar with icon - matches navbar style */
     <div className={`${iconSizeClasses[size]} rounded-full bg-primary-500 flex items-center justify-center transition-all duration-200 group-hover:opacity-80 border-2 border-white shadow-sm ${className}`}>
      <CircleUser className="text-white w-full h-full p-1" />
     </div>
    )}

    {/* Upload overlay on hover */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
     <Camera className="w-5 h-5 text-white" />
    </div>
   </div>

   {/* Upload Modal */}
   <Modal
    isOpen={isModalOpen}
    onClose={handleCancel}
    size="md"
    placement="center"
   >
    <ModalContent>
     <ModalHeader>
      <h3 className="text-lg font-semibold">{t('profile.avatar.changeAvatar')}</h3>
     </ModalHeader>

     <ModalBody>
      <div className="space-y-4">
       {/* Current/Preview Avatar */}
       <div className="flex flex-col items-center">
        {(previewImage || currentAvatar) ? (
         <Avatar
          src={previewImage || currentAvatar || undefined}
          name={userName}
          size="lg"
          className="w-24 h-24 mb-3"
         />
        ) : (
         <div className="w-24 h-24 mb-3 rounded-full bg-primary-500 flex items-center justify-center border-2 border-white shadow-sm">
          <CircleUser className="text-white w-full h-full p-2" />
         </div>
        )}

        {/* Show delete button only if user has a custom avatar and no preview is selected */}
        {currentAvatar && !previewImage && (
         <div className="flex gap-2">
          <Button
           size="sm"
           variant="flat"
           color="danger"
           startContent={<X className="w-4 h-4" />}
           onPress={handleRemoveAvatar}
           isLoading={isLoading}
          >
           {t('profile.avatar.remove')}
          </Button>
         </div>
        )}
       </div>

       {/* Upload Button */}
       <div className="flex flex-col items-center">
        <Button
         variant="bordered"
         startContent={!isCompressing && <Upload className="w-4 h-4" />}
         onPress={handleFileSelect}
         className="mb-2"
         isLoading={isCompressing}
         isDisabled={isCompressing}
        >
         {isCompressing ? t('profile.avatar.compressing') : t('profile.avatar.selectImage')}
        </Button>

        {/* Compression Progress */}
        {isCompressing && (
         <div className="w-full max-w-xs mb-2">
          <Progress
           size="sm"
           value={compressionProgress}
           color="primary"
           className="mb-1"
          />
          <p className="text-xs text-gray-500 text-center">
           {t('profile.avatar.optimizing')} {compressionProgress}%
          </p>
         </div>
        )}

        {/* Compression Info */}
        {compressionInfo && !isCompressing && (
         <p className="text-xs text-success-600 text-center mb-2">
          ✓ {compressionInfo}
         </p>
        )}

        <p className="text-sm text-gray-500 text-center">
         {t('profile.avatar.supportedFormatsExtended')}
        </p>
       </div>

       {/* Error Message */}
       {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
         <p className="text-sm text-danger-600">{error}</p>
        </div>
       )}

       {/* Hidden File Input */}
       <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
       />
      </div>
     </ModalBody>

     <ModalFooter>
      <Button
       variant="bordered"
       onPress={handleCancel}
       isDisabled={isLoading}
      >
       {t('cancel')}
      </Button>

      <Button
       color="primary"
       onPress={handleSave}
       isLoading={isLoading}
       isDisabled={!previewImage}
       startContent={!isLoading ? <Check className="w-4 h-4" /> : null}
      >
       {t('save')}
      </Button>
     </ModalFooter>
    </ModalContent>
   </Modal>
  </>
 )
}