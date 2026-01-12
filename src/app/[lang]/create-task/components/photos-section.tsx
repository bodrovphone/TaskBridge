'use client'

import { useTranslations } from 'next-intl'
import { Button, Card, CardBody, Progress } from '@heroui/react'
import { Upload, X, Image as ImageIcon, Camera, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { compressImageAdvanced, formatBytes } from '@/lib/utils/advanced-image-compression'

interface PhotosSectionProps {
  form: any
  initialImages?: string[]
}

const MAX_IMAGES = 3

export function PhotosSection({ form, initialImages }: PhotosSectionProps) {
  const t = useTranslations()
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const [imageErrors, setImageErrors] = useState<string[]>([])

  const [compressionStats, setCompressionStats] = useState<{ originalSize: number, compressedSize: number, savingsPercent: number }[]>([]);

  useEffect(() => {
    if (initialImages && initialImages.length > 0 && !hasInitialized) {
      setPhotoPreviews(initialImages)
      setHasInitialized(true)
    }
  }, [initialImages, hasInitialized])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    if (photos.length + files.length > MAX_IMAGES) {
      setImageErrors([t('createTask.photos.maxImagesError', { count: MAX_IMAGES })])
      return
    }

    setImageErrors([])
    setIsCompressing(true)

    const newPhotos: File[] = []
    const newPreviews: string[] = []
    const newStats: { originalSize: number, compressedSize: number, savingsPercent: number }[] = [];

    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setImageErrors(prev => [...prev, t('createTask.photos.invalidType')])
        continue
      }

      try {
        const result = await compressImageAdvanced(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, initialQuality: 0.85 }, (progress) => {
          setCompressionProgress(progress)
        });

        const MAX_SIZE = 5 * 1024 * 1024;
        if (result.compressedSize > MAX_SIZE) {
          setImageErrors(prev => [...prev, t('createTask.photos.fileTooLarge')]);
          continue;
        }

        newPhotos.push(result.blob as File);
        newPreviews.push(URL.createObjectURL(result.blob));
        newStats.push({
          originalSize: file.size,
          compressedSize: result.compressedSize,
          savingsPercent: result.savingsPercent,
        });

      } catch (error) {
        console.error('Compression error:', error)
        setImageErrors(prev => [...prev, 'Failed to optimize image. Please try another image.'])
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    setCompressionStats(prev => [...prev, ...newStats]);

    form.setFieldValue('photoFiles', [...photos, ...newPhotos]);

    setIsCompressing(false)
    setCompressionProgress(0)

    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    const newPreviews = [...photoPreviews]
    const newStats = [...compressionStats]
    const newErrors = [...imageErrors];

    newPhotos.splice(index, 1)
    newPreviews.splice(index, 1)
    newStats.splice(index, 1)
    if (imageErrors.length > index) newErrors.splice(index, 1);
    

    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
    setCompressionStats(newStats)
    setImageErrors(newErrors);

    form.setFieldValue('photoFiles', newPhotos)
    
    const remainingUrls = newPreviews.filter(p => !p.startsWith('blob:'));
    form.setFieldValue('photos', remainingUrls);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
        <div className="p-2 bg-pink-100 rounded-lg">
          <ImageIcon className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {t('createTask.photos.title')}
          </h2>
          <p className="text-gray-600">
            {t('createTask.photos.help', { count: MAX_IMAGES })}
          </p>
        </div>
      </div>

      {photoPreviews.length < MAX_IMAGES && (
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
                  {/* Desktop: show drag & drop text */}
                  <p className="hidden sm:block font-semibold text-gray-900">
                    {t('createTask.photos.dragDrop')}
                  </p>
                  <p className="hidden sm:block text-sm text-gray-500">
                    {t('createTask.photos.orBrowse')}
                  </p>
                  {/* Mobile: show tap to select text */}
                  <p className="block sm:hidden font-semibold text-gray-900">
                    {t('createTask.photos.tapToSelect')}
                  </p>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>{t('createTask.photos.maxSize')}</p>
                  <p>{t('createTask.photos.formats')}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="text-center">
            <Button
              color="secondary"
              variant="bordered"
              size="lg"
              startContent={<Camera className="w-5 h-5" />}
              onPress={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              {t('createTask.photos.takePhoto')}
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isCompressing && (
        <div className="space-y-3">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardBody className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-800">
                  {t('createTask.photos.optimizing')}
                </p>
              </div>
              <Progress value={compressionProgress} color="primary" size="sm" className="max-w-full" />
            </CardBody>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoPreviews.map((preview, index) => (
          <div key={index} className="space-y-3">
            <div className="relative group">
              <Card>
                <CardBody className="p-0">
                  <Image
                    src={preview}
                    alt={`Task photo ${index + 1}`}
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
                onPress={() => removePhoto(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {compressionStats[index] && !imageErrors.some(e => e.includes('large')) && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{t('createTask.photos.optimized')}</p>
                        <p className="text-xs text-green-600">
                          {formatBytes(compressionStats[index].originalSize)} → {formatBytes(compressionStats[index].compressedSize)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">{compressionStats[index].savingsPercent}%</p>
                      <p className="text-xs text-green-600">{t('createTask.photos.smaller')}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        ))}
      </div>
      {imageErrors.length > 0 && (
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg space-y-1">
          {imageErrors.map((error, index) => (
            <p key={index} className="text-sm text-warning-800">⚠️ {error}</p>
          ))}
        </div>
      )}
    </div>
  )
}
