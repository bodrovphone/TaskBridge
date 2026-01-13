'use client'

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { Card as NextUICard, CardBody, Modal, ModalContent, ModalBody } from "@heroui/react";
import DefaultTaskImage from "@/components/ui/default-task-image";

interface TaskGalleryProps {
 images?: string[] | null;
 title: string;
 category?: string;
 subcategory?: string | null;
}

export default function TaskGallery({ images, title, category, subcategory }: TaskGalleryProps) {
 const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // Handle undefined/null images
 const imageArray = Array.isArray(images) ? images : [];

 const nextImage = () => {
  setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
 };

 const previousImage = () => {
  setCurrentImageIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
 };

 const openModal = () => {
  setIsModalOpen(true);
 };

 const closeModal = () => {
  setIsModalOpen(false);
 };

 // Show default image if no images
 if (imageArray.length === 0) {
  return (
   <NextUICard className="bg-white/95 shadow-lg w-full max-w-full">
    <CardBody className="p-0 overflow-hidden">
     <DefaultTaskImage
      category={subcategory || category || 'other'}
      className="h-64 md:h-80 rounded-lg"
     />
    </CardBody>
   </NextUICard>
  );
 }

 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg w-full max-w-full">
    <CardBody className="p-0 overflow-hidden">
     <div className="relative h-64 md:h-80 overflow-hidden rounded-lg group cursor-pointer" onClick={openModal}>
      {imageArray.length > 0 && (
       <>
        <Image
         src={imageArray[currentImageIndex]}
         alt={`${title} - image ${currentImageIndex + 1}`}
         fill
         className="object-cover transition-transform duration-300 group-hover:scale-105"
         priority
        />

        {/* Expand icon overlay */}
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
         <Maximize2 size={20} />
        </div>
       {imageArray.length > 1 && (
        <>
         <button
          onClick={(e) => {
           e.stopPropagation();
           previousImage();
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          aria-label="Previous image"
         >
          <ChevronLeft size={20} />
         </button>
         <button
          onClick={(e) => {
           e.stopPropagation();
           nextImage();
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          aria-label="Next image"
         >
          <ChevronRight size={20} />
         </button>

         {/* Image indicators */}
         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {imageArray.map((_, index) => (
           <button
            key={index}
            onClick={(e) => {
             e.stopPropagation();
             setCurrentImageIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
             index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
           />
          ))}
         </div>
        </>
       )}
      </>
     )}
    </div>
   </CardBody>
  </NextUICard>

  {/* Full-size Image Modal */}
  <Modal
   isOpen={isModalOpen}
   onClose={closeModal}
   size="full"
   hideCloseButton={true}
   className="bg-black/95"
   classNames={{
    backdrop: "bg-black/80",
    wrapper: "items-center justify-center",
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
       <div className="relative w-full h-full flex items-center justify-center">
        {/* Full-size image - tap to close on mobile */}
        <div
         className="relative w-full h-full max-w-7xl max-h-screen p-4 md:cursor-default cursor-pointer"
         onClick={() => {
          // Only close on tap for mobile (no navigation buttons clicked)
          if (window.innerWidth < 768) {
           closeModal();
          }
         }}
        >
         <Image
          src={imageArray[currentImageIndex]}
          alt={`${title} - image ${currentImageIndex + 1}`}
          fill
          className="object-contain pointer-events-none"
          priority
         />
        </div>

        {/* Navigation in modal */}
        {imageArray.length > 1 && (
         <>
          <button
           onClick={(e) => {
            e.stopPropagation();
            previousImage();
           }}
           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
           aria-label="Previous image"
          >
           <ChevronLeft size={32} />
          </button>
          <button
           onClick={(e) => {
            e.stopPropagation();
            nextImage();
           }}
           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
           aria-label="Next image"
          >
           <ChevronRight size={32} />
          </button>

          {/* Image counter - adjusted position on mobile to not overlap close button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm max-md:bottom-8">
           {currentImageIndex + 1} / {imageArray.length}
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
 );
}