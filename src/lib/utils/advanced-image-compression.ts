import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB: number        // Max file size (e.g., 5MB → 1MB)
  maxWidthOrHeight: number // Max dimension in pixels
  useWebWorker: boolean    // Use Web Worker for better performance
  fileType?: string        // Output format: 'image/jpeg' | 'image/png' | 'image/webp'
  initialQuality: number   // Initial compression quality (0-1)
}

export interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  savingsPercent: number
  format: string
}

/**
 * Check if browser supports WebP format
 */
async function checkWebPSupport(): Promise<boolean> {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    if (canvas.getContext && canvas.getContext('2d')) {
      // Check if WebP is supported by trying to create a WebP data URL
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
  } catch (error) {
    console.warn('WebP support check failed:', error)
  }

  return false
}

/**
 * Compress image with advanced features (EXIF correction, WebP support, progress)
 * Returns compressed blob and compression statistics
 */
export async function compressImageAdvanced(
  file: File,
  options?: Partial<CompressionOptions>,
  onProgress?: (percent: number) => void
): Promise<CompressionResult> {
  const originalSize = file.size

  // Check WebP support
  const supportsWebP = await checkWebPSupport()

  // Default options optimized for web upload
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,              // Target 1MB after compression
    maxWidthOrHeight: 1920,    // 1080p resolution
    useWebWorker: true,        // Better performance, non-blocking
    fileType: supportsWebP ? 'image/webp' : 'image/jpeg',
    initialQuality: 0.85,      // 85% quality (good balance)
  }

  const finalOptions = { ...defaultOptions, ...options }

  try {
    // Compress with progress callback
    const compressedFile = await imageCompression(file, {
      maxSizeMB: finalOptions.maxSizeMB,
      maxWidthOrHeight: finalOptions.maxWidthOrHeight,
      useWebWorker: finalOptions.useWebWorker,
      fileType: finalOptions.fileType,
      initialQuality: finalOptions.initialQuality,
      onProgress: onProgress,
    })

    const compressedSize = compressedFile.size
    const savingsPercent = originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0

    return {
      blob: compressedFile,
      originalSize,
      compressedSize,
      savingsPercent,
      format: finalOptions.fileType || 'image/jpeg',
    }
  } catch (error) {
    console.error('Compression failed:', error)

    // Fallback: return original file as blob
    return {
      blob: file,
      originalSize,
      compressedSize: file.size,
      savingsPercent: 0,
      format: file.type,
    }
  }
}

/**
 * Compression presets for different use cases
 */
export const COMPRESSION_PRESETS = {
  high: {
    name: 'high',
    label: 'High Quality',
    description: 'Best quality, larger file size',
    maxSizeMB: 2,
    maxWidthOrHeight: 2560, // 1440p
    quality: 0.95,
    estimatedSize: '1-2 MB',
  },
  medium: {
    name: 'medium',
    label: 'Balanced',
    description: 'Good quality, reasonable file size (recommended)',
    maxSizeMB: 1,
    maxWidthOrHeight: 1920, // 1080p
    quality: 0.85,
    estimatedSize: '0.5-1 MB',
  },
  low: {
    name: 'low',
    label: 'Fast Upload',
    description: 'Smaller file, faster upload',
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280, // 720p
    quality: 0.75,
    estimatedSize: '200-500 KB',
  },
} as const

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
