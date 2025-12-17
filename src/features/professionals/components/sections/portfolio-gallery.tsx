'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { Card as NextUICard, CardBody, Modal, ModalContent, ModalBody } from '@nextui-org/react'
import { Camera, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GalleryItem } from '@/server/domain/user/user.types'

interface PortfolioGalleryProps {
  gallery: GalleryItem[]
}

export default function PortfolioGallery({ gallery }: PortfolioGalleryProps) {
  const t = useTranslations()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sort by order
  const sortedGallery = [...gallery].sort((a, b) => a.order - b.order)

  if (!gallery || gallery.length === 0) {
    return null // Don't show section if no gallery items
  }

  const currentItem = sortedGallery[currentImageIndex]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedGallery.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedGallery.length) % sortedGallery.length)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 shadow-lg border border-purple-100">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Camera className="text-purple-600" size={28} />
            {t('professionalDetail.gallery.title')}
          </h3>
          <p className="text-gray-600">
            {t('professionalDetail.gallery.subtitle')}
          </p>
        </div>

        {/* Main Gallery Card */}
        <NextUICard className="bg-white/95 shadow-lg">
          <CardBody className="p-0">
            <div
              className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-t-lg group cursor-pointer"
              onClick={openModal}
            >
              <NextImage
                src={currentItem.imageUrl}
                alt={currentItem.caption || `Gallery image ${currentImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />

              {/* Expand icon overlay */}
              <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} />
              </div>

              {/* Navigation arrows */}
              {sortedGallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      previousImage()
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {sortedGallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(index)
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Caption below main image */}
            {currentItem.caption && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-gray-700 text-center">{currentItem.caption}</p>
              </div>
            )}
          </CardBody>
        </NextUICard>

        {/* Thumbnail strip (only show if more than 1 image) */}
        {sortedGallery.length > 1 && (
          <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
            {sortedGallery.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? 'ring-2 ring-purple-500 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <NextImage
                  src={item.imageUrl}
                  alt={item.caption || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-size Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="full"
        hideCloseButton={true}
        className="bg-black/95"
        classNames={{
          backdrop: 'bg-black/80',
          wrapper: 'items-center justify-center',
        }}
      >
        <ModalContent>
          {() => (
            <>
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={32} />
              </button>

              <ModalBody className="p-0 flex items-center justify-center">
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {/* Full-size image */}
                  <div className="relative w-full h-full max-w-7xl max-h-[80vh] p-4">
                    <NextImage
                      src={currentItem.imageUrl}
                      alt={currentItem.caption || `Gallery image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Caption in modal */}
                  {currentItem.caption && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg max-w-lg text-center">
                      <p>{currentItem.caption}</p>
                    </div>
                  )}

                  {/* Navigation in modal */}
                  {sortedGallery.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={32} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={32} />
                      </button>

                      {/* Image counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {sortedGallery.length}
                      </div>
                    </>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
