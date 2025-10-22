'use client'

import { Card, CardBody, Avatar, Chip, Button, useDisclosure } from "@heroui/react";
import { Star, CheckCircle, MessageSquare, UserX } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ReviewsDialog from '@/components/common/reviews-dialog';

interface Review {
 id: string;
 clientName: string;
 rating: number;
 comment: string;
 date: string;
 verified: boolean;
 anonymous: boolean;
}

interface ReviewsSectionProps {
 reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
 const { t } = useTranslation();
 const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

 const averageRating = reviews.length > 0
  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
  : "0";

 return (
  <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-100">
   <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center gap-3">
    <MessageSquare className="text-orange-600" size={28} />
    {t('professionalDetail.reviews.title')}
   </h3>

   {/* Rating Summary */}
   {reviews.length > 0 && (
    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
     <div className="flex items-center justify-between">
      <div>
       <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
       <div className="flex items-center gap-2 mb-1">
        {renderStars(Math.round(Number(averageRating)))}
       </div>
       <div className="text-sm text-gray-600">
        {reviews.length} {t('professionalDetail.reviews.count')}
       </div>
      </div>
      <div className="text-right">
       <div className="text-sm text-gray-600 mb-1">
        {t('professionalDetail.reviews.recentRating')}
       </div>
       <Chip size="sm" color="success" variant="flat">
        {t('professionalDetail.reviews.excellent')}
       </Chip>
      </div>
     </div>
    </div>
   )}

   {/* Reviews List - Show first 4 reviews */}
   {reviews.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {reviews.slice(0, 4).map((review) => (
      <Card key={review.id} className="hover:shadow-md transition-shadow">
       <CardBody className="p-4">
        <div className="flex items-start gap-3">
         <Avatar
          name={review.anonymous ? t('common.anonymous') : review.clientName}
          size="sm"
          className={`flex-shrink-0 ${review.anonymous ? 'bg-gray-400 text-white' : ''}`}
          fallback={review.anonymous ? <UserX size={16} /> : undefined}
         />

         <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${review.anonymous ? 'text-gray-600 italic' : 'text-gray-900'}`}>
             {review.anonymous ? t('common.anonymous') : review.clientName}
            </span>
            {review.verified && (
             <CheckCircle className="w-4 h-4 text-green-500" />
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
   ) : (
    <div className="text-center py-8">
     <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
     <p className="text-gray-500 mb-4">
      {t('professionalDetail.reviews.noReviews')}
     </p>
     <p className="text-sm text-gray-400">
      {t('professionalDetail.reviews.beFirst')}
     </p>
    </div>
   )}

   {/* Show All Reviews Button */}
   {reviews.length > 4 && (
    <div className="text-center mt-6 pt-4 border-t border-gray-100">
     <Button
      variant="ghost"
      color="primary"
      onPress={onOpen}
      className="font-medium"
     >
{t('professionalDetail.reviews.showMore')} ({reviews.length - 4} {t('professionalDetail.reviews.more')})
     </Button>
    </div>
   )}

   {/* Reviews Dialog */}
   <ReviewsDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    reviews={reviews}
    averageRating={averageRating}
   />
  </div>
 );
}