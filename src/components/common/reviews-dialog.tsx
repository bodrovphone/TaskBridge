'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, Card, CardBody, Avatar, Chip } from "@nextui-org/react";
import { Star, CheckCircle, MessageSquare, UserX } from "lucide-react";
import { useTranslations } from 'next-intl';

interface ReviewsDialogProps {
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 reviews: API['ReviewDisplay'][];
 averageRating: string;
}

export default function ReviewsDialog({
 isOpen,
 onOpenChange,
 reviews,
 averageRating
}: ReviewsDialogProps) {
 const t = useTranslations();

 const renderStars = (rating: number) => {
  return (
   <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
     <Star
      key={star}
      className={`w-4 h-4 ${
       star <= rating
        ? 'fill-yellow-400 text-yellow-400'
        : 'text-gray-300'
      }`}
     />
    ))}
   </div>
  );
 };

 return (
  <Modal
   isOpen={isOpen}
   onOpenChange={onOpenChange}
   size="5xl"
   scrollBehavior="inside"
   classNames={{
    base: "bg-white",
    header: "border-b border-gray-200",
    body: "py-6",
    wrapper: "items-center",
   }}
   style={{
    height: '70vh'
   }}
  >
   <ModalContent className="max-h-[70vh]">
    {(onClose) => (
     <>
      <ModalHeader className="flex flex-col gap-1">
       <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="text-orange-600" size={24} />
        {t('professionalDetail.reviews.allReviews')} ({reviews.length})
       </h3>
       <div className="text-sm text-gray-600">
        {t('professionalDetail.reviews.avgRating')}: {averageRating} ⭐
       </div>
      </ModalHeader>
      <ModalBody className="flex-1 overflow-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
        {reviews.map((review) => (
         <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardBody className="p-4">
           <div className="flex items-start gap-3">
            <Avatar
             name={review.anonymous ? "Анонимен" : review.clientName}
             size="sm"
             className={`flex-shrink-0 ${review.anonymous ? 'bg-gray-400 text-white' : ''}`}
             fallback={review.anonymous ? <UserX size={16} /> : undefined}
            />

            <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
               <span className={`font-medium text-sm ${review.anonymous ? 'text-gray-600 italic' : 'text-gray-900'}`}>
                {review.clientName}
               </span>
               {review.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
               )}
               {review.anonymous && (
                <Chip size="sm" variant="flat" color="default" className="text-xs">
                 Анонимен
                </Chip>
               )}
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
               {review.date}
              </span>
             </div>

             <div className="mb-2">
              {renderStars(review.rating)}
             </div>

             <p className="text-gray-700 text-sm leading-relaxed">
              {review.comment}
             </p>
            </div>
           </div>
          </CardBody>
         </Card>
        ))}
       </div>
      </ModalBody>
     </>
    )}
   </ModalContent>
  </Modal>
 );
}