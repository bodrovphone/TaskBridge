'use client'

import { memo, useMemo, useCallback } from 'react';
import { Card, CardBody, Avatar, Chip, Button, useDisclosure } from "@nextui-org/react";
import { Star, CheckCircle, MessageSquare, UserX } from "lucide-react";
import { useTranslations } from 'next-intl';
import ReviewsDialog from '@/components/common/reviews-dialog';
import { HiddenReviewsNotice } from '@/components/reviews/hidden-reviews-notice';
import { getVisibleReviews, getReviewVisibilityStats } from '@/lib/reviews';

interface Review {
 id: string;
 clientName: string;
 rating: number;
 comment: string;
 date: string;
 verified: boolean;
 anonymous: boolean;
 // Visibility fields for pattern detection
 isVisible?: boolean;
 visibilityReason?: 'visible_high_rating' | 'visible_pattern_detected' | 'hidden_pending_pattern';
}

interface ReviewsSectionProps {
 reviews: Review[];
}

// Star rating component - memoized to prevent re-renders
const StarRating = memo(function StarRating({ rating }: { rating: number }) {
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
});

function ReviewsSectionComponent({ reviews }: ReviewsSectionProps) {
 const t = useTranslations();
 const { isOpen, onOpen, onOpenChange } = useDisclosure();

 // Memoize all review calculations to prevent recalculation on every render
 const { reviewsWithVisibility, visibleReviews, stats, averageRating } = useMemo(() => {
  const withVisibility = reviews.map(r => ({
   ...r,
   isVisible: r.isVisible !== undefined ? r.isVisible : true,
   visibilityReason: r.visibilityReason || ('visible_high_rating' as const)
  }));

  const visible = getVisibleReviews(withVisibility);
  const reviewStats = getReviewVisibilityStats(withVisibility);
  const average = visible.length > 0
   ? (visible.reduce((sum, review) => sum + review.rating, 0) / visible.length).toFixed(1)
   : "0";

  return {
   reviewsWithVisibility: withVisibility,
   visibleReviews: visible,
   stats: reviewStats,
   averageRating: average
  };
 }, [reviews]);

 // Memoized renderStars callback
 const renderStars = useCallback((rating: number) => <StarRating rating={rating} />, []);

 return (
  <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-100">
   <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center gap-3">
    <MessageSquare className="text-orange-600" size={28} />
    {t('professionalDetail.reviews.title')}
   </h3>

   {/* Hidden Reviews Notice */}
   {(stats.hidden > 0 || stats.hasPattern) && (
    <HiddenReviewsNotice
     hiddenCount={stats.hidden}
     hasPattern={stats.hasPattern}
     className="mb-6"
    />
   )}

   {/* Rating Summary */}
   {visibleReviews.length > 0 && (
    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
     <div className="flex items-center justify-between">
      <div>
       <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
       <div className="flex items-center gap-2 mb-1">
        {renderStars(Math.round(Number(averageRating)))}
       </div>
       <div className="text-sm text-gray-600">
        {visibleReviews.length} {t('professionalDetail.reviews.count')}
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

   {/* Reviews List - Show first 4 visible reviews */}
   {visibleReviews.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {visibleReviews.slice(0, 4).map((review) => (
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
     <div className="flex justify-center mb-6">
      {renderStars(5)}
     </div>
     <p className="text-gray-700 text-lg mb-2">
      {t('professionalDetail.reviews.emptyState')}
     </p>
     <p className="text-sm text-gray-500">
      {t('professionalDetail.reviews.emptyStateCTA')}
     </p>
    </div>
   )}

   {/* Show All Reviews Button */}
   {visibleReviews.length > 4 && (
    <div className="text-center mt-6 pt-4 border-t border-gray-100">
     <Button
      variant="ghost"
      color="primary"
      onPress={onOpen}
      className="font-medium"
     >
{t('professionalDetail.reviews.showMore')} ({visibleReviews.length - 4} {t('professionalDetail.reviews.more')})
     </Button>
    </div>
   )}

   {/* Reviews Dialog - Pass only visible reviews */}
   <ReviewsDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    reviews={visibleReviews}
    averageRating={averageRating}
   />
  </div>
 );
}

// Export with React.memo for performance optimization
const ReviewsSection = memo(ReviewsSectionComponent);
export default ReviewsSection;