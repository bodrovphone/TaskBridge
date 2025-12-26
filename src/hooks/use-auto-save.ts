'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions<T> {
  /** The data to save */
  data: T
  /** Function to call when saving */
  onSave: (data: T) => Promise<void>
  /** Delay in ms before auto-saving (default: 5000ms) */
  delay?: number
  /** Whether auto-save is enabled (e.g., only when editing) */
  enabled?: boolean
  /** Optional callback after successful save (e.g., for showing toast) */
  onSuccess?: () => void
  /** Optional callback after failed save */
  onError?: (error: unknown) => void
}

/**
 * Hook for auto-saving data with debounce
 * Only triggers save when data changes and enabled is true
 *
 * @example
 * useAutoSave({
 *   data: { title, bio },
 *   onSave: handleSave,
 *   delay: 5000,
 *   enabled: isEditing
 * })
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 5000,
  enabled = true,
  onSuccess,
  onError
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  // Serialize data for comparison
  const serializedData = JSON.stringify(data)

  // Clear timeout on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    // Skip if not enabled
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Skip if data hasn't changed
    if (previousDataRef.current === serializedData) {
      return
    }

    // Skip first render (initial data load)
    if (previousDataRef.current === null) {
      previousDataRef.current = serializedData
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (isMountedRef.current && enabled) {
        try {
          await onSave(data)
          previousDataRef.current = serializedData
          onSuccess?.()
        } catch (error) {
          console.error('[useAutoSave] Save failed:', error)
          onError?.(error)
        }
      }
    }, delay)

    // Update previous data ref
    previousDataRef.current = serializedData

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [serializedData, enabled, delay, onSave, data])

  // Manual save function (cancels pending auto-save)
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    try {
      await onSave(data)
      previousDataRef.current = serializedData
    } catch (error) {
      console.error('[useAutoSave] Manual save failed:', error)
      throw error
    }
  }, [data, onSave, serializedData])

  return { saveNow }
}
