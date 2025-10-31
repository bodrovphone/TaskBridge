'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'

interface TaskImageUploadProps {
  value: File | null // File object for preview
  onChange: (file: File | null) => void
  disabled?: boolean
}

export default function TaskImageUpload({
  value,
  onChange,
  disabled = false
}: TaskImageUploadProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert(t('createTask.imageUpload.invalidType'))
      return
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      alert(t('createTask.imageUpload.tooLarge'))
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Pass file to parent
    onChange(file)
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
            {t('createTask.imageUpload.formats')} (max 5MB)
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
