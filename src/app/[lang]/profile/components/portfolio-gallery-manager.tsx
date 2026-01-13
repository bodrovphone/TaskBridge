'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Progress, Card, CardBody, Spinner } from '@heroui/react'
import { Plus, Trash2, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { GalleryItem } from '@/server/domain/user/user.types'
import { useAuth } from '@/features/auth'
import { toast } from '@/hooks/use-toast'
import { compressImageAdvanced, formatBytes } from '@/lib/utils/advanced-image-compression'

// Debounce hook for caption saving
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface GalleryManagerProps {
  items: GalleryItem[]
  onChange: (items: GalleryItem[]) => Promise<void>
  maxItems?: number
}

interface SlotState {
  isCompressing: boolean
  isUploading: boolean
  compressionProgress: number
  previewUrl: string | null
  compressionStats: {
    originalSize: number
    compressedSize: number
    savingsPercent: number
  } | null
  error: string | null
}

export function PortfolioGalleryManager({
  items,
  onChange,
  maxItems = 5
}: GalleryManagerProps) {
  const t = useTranslations()
  const { authenticatedFetch } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>({})

  // Local caption state for immediate UI updates
  const [localCaptions, setLocalCaptions] = useState<Record<string, string>>({})

  // Sort by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  // Initialize local captions from items - only for NEW items, don't overwrite existing local state
  const initializedIdsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    setLocalCaptions(prev => {
      const updated = { ...prev }
      let hasChanges = false

      items.forEach(item => {
        // Only initialize if we haven't seen this item before
        if (!initializedIdsRef.current.has(item.id)) {
          updated[item.id] = item.caption
          initializedIdsRef.current.add(item.id)
          hasChanges = true
        }
      })

      // Clean up deleted items from the ref
      const currentIds = new Set(items.map(i => i.id))
      initializedIdsRef.current.forEach(id => {
        if (!currentIds.has(id)) {
          initializedIdsRef.current.delete(id)
          delete updated[id]
          hasChanges = true
        }
      })

      return hasChanges ? updated : prev
    })
  }, [items])

  // Debounced captions for saving
  const debouncedCaptions = useDebounce(localCaptions, 800)

  // Save captions when debounced value changes
  const lastSavedCaptionsRef = useRef<string>('')
  useEffect(() => {
    const captionsJson = JSON.stringify(debouncedCaptions)
    // Only save if captions actually changed and we have items
    if (captionsJson !== lastSavedCaptionsRef.current && items.length > 0) {
      lastSavedCaptionsRef.current = captionsJson

      // Check if any caption actually differs from the server state
      const hasChanges = items.some(item =>
        debouncedCaptions[item.id] !== undefined &&
        debouncedCaptions[item.id] !== item.caption
      )

      if (hasChanges) {
        const updated = items.map(item => ({
          ...item,
          caption: debouncedCaptions[item.id] ?? item.caption
        }))
        onChange(updated).catch(error => {
          console.error('Failed to save captions:', error)
        })
      }
    }
  }, [debouncedCaptions, items, onChange])

  const updateSlotState = (slotIndex: number, updates: Partial<SlotState>) => {
    setSlotStates(prev => ({
      ...prev,
      [slotIndex]: { ...prev[slotIndex], ...updates }
    }))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const slotIndex = activeSlot
    if (!file || slotIndex === null) return

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      updateSlotState(slotIndex, {
        error: t('profile.gallery.useJpgPngWebp')
      })
      return
    }

    // Initialize slot state
    updateSlotState(slotIndex, {
      isCompressing: true,
      isUploading: false,
      compressionProgress: 0,
      previewUrl: null,
      compressionStats: null,
      error: null
    })

    try {
      // Step 1: Compress image client-side (light compression - preserve quality)
      const result = await compressImageAdvanced(
        file,
        { maxSizeMB: 4, maxWidthOrHeight: 2560, initialQuality: 0.95 },
        (progress) => {
          updateSlotState(slotIndex, { compressionProgress: progress })
        }
      )

      // Validate compressed size
      const MAX_SIZE = 5 * 1024 * 1024
      if (result.compressedSize > MAX_SIZE) {
        updateSlotState(slotIndex, {
          isCompressing: false,
          error: t('profile.gallery.maxSize')
        })
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(result.blob)

      updateSlotState(slotIndex, {
        isCompressing: false,
        isUploading: true,
        previewUrl,
        compressionStats: {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savingsPercent: result.savingsPercent
        }
      })

      // Step 2: Upload to server
      const formData = new FormData()
      formData.append('image', result.blob, file.name)
      formData.append('index', slotIndex.toString())

      const response = await authenticatedFetch('/api/profile/gallery', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()

      // Step 3: Update gallery items
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        caption: '',
        order: slotIndex,
        createdAt: new Date().toISOString()
      }

      // Replace if exists at this slot, otherwise add
      const existingIndex = sortedItems.findIndex(item => item.order === slotIndex)
      if (existingIndex >= 0) {
        const updated = [...sortedItems]
        updated[existingIndex] = { ...updated[existingIndex], imageUrl: data.imageUrl }
        await onChange(updated)
      } else {
        await onChange([...sortedItems, newItem])
      }

      // Only clear preview after the save completes successfully
      updateSlotState(slotIndex, {
        isUploading: false,
        previewUrl: null, // Clear preview, actual image will show from items prop
        compressionStats: null // Clear stats after successful save
      })

      toast({
        title: t('profile.gallery.uploadSuccess'),
      })
    } catch (error: any) {
      console.error('Gallery upload error:', error)
      updateSlotState(slotIndex, {
        isCompressing: false,
        isUploading: false,
        previewUrl: null,
        error: error.message
      })
      toast({
        title: t('profile.gallery.uploadError'),
        description: error.message,
        variant: 'destructive'
      })
    }

    setActiveSlot(null)
  }

  const handleDelete = async (item: GalleryItem) => {
    try {
      const response = await authenticatedFetch('/api/profile/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: item.imageUrl })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      // Remove from local state and reorder
      const updated = sortedItems
        .filter(i => i.id !== item.id)
        .map((i, idx) => ({ ...i, order: idx }))

      await onChange(updated)

      // Clear slot state
      setSlotStates(prev => {
        const newState = { ...prev }
        delete newState[item.order]
        return newState
      })

      toast({
        title: t('profile.gallery.deleteSuccess'),
      })
    } catch (error: any) {
      console.error('Gallery delete error:', error)
      toast({
        title: t('profile.gallery.deleteError'),
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  // Update local caption state (debounced save happens automatically)
  const handleCaptionChange = (itemId: string, caption: string) => {
    setLocalCaptions(prev => ({
      ...prev,
      [itemId]: caption
    }))
  }

  const openFilePicker = (slotIndex: number) => {
    setActiveSlot(slotIndex)
    fileInputRef.current?.click()
  }

  // Create array of slots (filled + empty)
  const slots: (GalleryItem | null)[] = []
  for (let i = 0; i < maxItems; i++) {
    const item = sortedItems.find(item => item.order === i)
    slots.push(item || null)
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {slots.map((item, index) => {
          const slotState = slotStates[index] || {}
          const isProcessing = slotState.isCompressing || slotState.isUploading

          return (
            <div key={item?.id || `slot-${index}`} className="space-y-2">
              {/* Image Slot */}
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/50 transition-all group">
                {/* Show preview during upload or actual image */}
                {(slotState.previewUrl || item?.imageUrl) ? (
                  <>
                    <Image
                      src={slotState.previewUrl || item?.imageUrl || ''}
                      alt={item?.caption || `Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {/* Processing overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-2">
                        <Spinner size="sm" color="white" />
                        <p className="text-xs text-white text-center">
                          {slotState.isCompressing
                            ? t('profile.gallery.compressing')
                            : t('profile.gallery.uploading')}
                        </p>
                        {slotState.isCompressing && (
                          <Progress
                            value={slotState.compressionProgress}
                            size="sm"
                            color="primary"
                            className="max-w-[80%]"
                          />
                        )}
                      </div>
                    )}
                    {/* Hover overlay with actions */}
                    {!isProcessing && item && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          color="danger"
                          variant="solid"
                          isIconOnly
                          onPress={() => handleDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          variant="solid"
                          isIconOnly
                          onPress={() => openFilePicker(index)}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  // Empty slot - upload button
                  <button
                    onClick={() => openFilePicker(index)}
                    disabled={isProcessing}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Spinner size="sm" />
                        <span className="text-xs mt-2">
                          {slotState.isCompressing ? `${slotState.compressionProgress}%` : '...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">
                          {t('profile.gallery.addImage')}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Error indicator */}
                {slotState.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-danger-500 text-white text-xs p-1 text-center">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    {slotState.error}
                  </div>
                )}
              </div>

              {/* Compression Stats (shown during/after compression) */}
              {slotState.compressionStats && !item && (
                <Card className="border border-success-200 bg-success-50">
                  <CardBody className="p-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="text-success-700 font-medium">
                          {slotState.compressionStats.savingsPercent}%
                        </span>
                        <span className="text-success-600 ml-1">
                          {t('profile.gallery.smaller')}
                        </span>
                        <p className="text-success-500">
                          {formatBytes(slotState.compressionStats.originalSize)} → {formatBytes(slotState.compressionStats.compressedSize)}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Caption Input (only for filled slots with actual images) */}
              {item && !isProcessing && (
                <div className="rounded-lg border-2 border-purple-200 bg-purple-50/50 p-1.5 shadow-sm">
                  <Input
                    size="sm"
                    placeholder={t('profile.gallery.captionPlaceholder')}
                    value={localCaptions[item.id] ?? item.caption}
                    onValueChange={(value) => handleCaptionChange(item.id, value)}
                    maxLength={30}
                    classNames={{
                      input: 'text-xs',
                      inputWrapper: 'h-auto min-h-8 bg-white border-purple-100'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 text-center">
        {t('profile.gallery.helperText')}
      </p>
    </div>
  )
}
