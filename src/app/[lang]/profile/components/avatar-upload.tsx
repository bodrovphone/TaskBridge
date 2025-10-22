'use client'

import { useState, useRef } from 'react'
import { Avatar, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Camera, Upload, X, Check } from 'lucide-react'

interface AvatarUploadProps {
 currentAvatar?: string | null
 userName: string
 onAvatarChange: (newAvatar: string) => void
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
 const { t } = useTranslation()
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [previewImage, setPreviewImage] = useState<string | null>(null)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const handleAvatarClick = () => {
  setIsModalOpen(true)
  setPreviewImage(null)
  setError(null)
 }

 const handleFileSelect = () => {
  fileInputRef.current?.click()
 }

 const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
   setError(t('profile.avatar.invalidFileType'))
   return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
   setError(t('profile.avatar.fileTooLarge'))
   return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
   const result = e.target?.result as string
   setPreviewImage(result)
   setError(null)
  }
  reader.readAsDataURL(file)
 }

 const handleSave = async () => {
  if (!previewImage) return

  setIsLoading(true)

  try {
   // Mock upload process - simulate API call
   await new Promise(resolve => setTimeout(resolve, 1500))

   // In real implementation, this would upload to server and return URL
   // For now, we'll use the preview image (base64) as the new avatar
   onAvatarChange(previewImage)

   setIsModalOpen(false)
   setPreviewImage(null)
  } catch (error) {
   setError(t('profile.avatar.uploadError'))
  } finally {
   setIsLoading(false)
  }
 }

 const handleCancel = () => {
  setIsModalOpen(false)
  setPreviewImage(null)
  setError(null)
 }

 const handleRemoveAvatar = () => {
  setPreviewImage('')
  setError(null)
 }

 const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
 }

 return (
  <>
   {/* Avatar with upload indicator */}
   <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
    <Avatar
     src={currentAvatar || undefined}
     name={userName}
     size={size}
     className={`${sizeClasses[size]} ${className} transition-all duration-200 group-hover:opacity-80`}
    />

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
        <Avatar
         src={previewImage || currentAvatar || undefined}
         name={userName}
         size="lg"
         className="w-24 h-24 mb-3"
        />

        {previewImage && (
         <div className="flex gap-2">
          <Button
           size="sm"
           variant="flat"
           color="danger"
           startContent={<X className="w-4 h-4" />}
           onPress={handleRemoveAvatar}
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
         startContent={<Upload className="w-4 h-4" />}
         onPress={handleFileSelect}
         className="mb-2"
        >
         {t('profile.avatar.selectImage')}
        </Button>

        <p className="text-sm text-gray-500 text-center">
         {t('profile.avatar.supportedFormats')}
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