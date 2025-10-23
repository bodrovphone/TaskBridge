/**
 * Review Visibility Manager
 *
 * Implements negative review pattern detection to protect professionals from
 * single unfair reviews while exposing patterns of poor service.
 *
 * Rules:
 * - Reviews ≥4 stars: Always visible immediately
 * - Reviews ≤3 stars: Hidden until pattern detected (3+ negative reviews)
 * - Once pattern detected, all negative reviews become visible
 */

export type VisibilityReason =
  | 'visible_high_rating'       // ≥4 stars, always visible
  | 'visible_pattern_detected'  // ≤3 stars, pattern of 3+ negatives found
  | 'hidden_pending_pattern';   // ≤3 stars, hidden until pattern emerges

// Base review type - any review with a rating field
export type BaseReview = {
  rating: number;
  overallRating?: number; // For database reviews
  [key: string]: any; // Allow other properties
};

// Visibility fields that can be added to any review
export type ReviewVisibilityFields = {
  isVisible: boolean;
  visibilityReason: VisibilityReason;
};

// Review with visibility info
export type ReviewWithVisibility<T extends BaseReview = BaseReview> = T & ReviewVisibilityFields;

/**
 * Determines if a review should be visible based on rating and pattern detection
 */
export function calculateReviewVisibility<T extends BaseReview>(
  review: T,
  allProfessionalReviews: T[]
): { isVisible: boolean; visibilityReason: VisibilityReason } {
  const rating = 'overallRating' in review ? review.overallRating || review.rating : review.rating;

  // High ratings (≥4 stars) are always visible immediately
  if (rating >= 4) {
    return {
      isVisible: true,
      visibilityReason: 'visible_high_rating',
    };
  }

  // Low ratings (≤3 stars) - check for pattern
  const negativeReviews = allProfessionalReviews.filter((r) => {
    const rRating = 'overallRating' in r ? r.overallRating || r.rating : r.rating;
    return rRating <= 3;
  });

  // If 3 or more negative reviews exist, all negative reviews become visible
  if (negativeReviews.length >= 3) {
    return {
      isVisible: true,
      visibilityReason: 'visible_pattern_detected',
    };
  }

  // Less than 3 negative reviews - hide until pattern emerges
  return {
    isVisible: false,
    visibilityReason: 'hidden_pending_pattern',
  };
}

/**
 * Updates visibility for all reviews of a professional after a new review is added
 * Should be called whenever a new review is submitted
 */
export function recalculateAllReviewsVisibility<T extends BaseReview>(
  allProfessionalReviews: T[]
): ReviewWithVisibility<T>[] {
  return allProfessionalReviews.map((review) => {
    const { isVisible, visibilityReason } = calculateReviewVisibility(
      review,
      allProfessionalReviews
    );

    return {
      ...review,
      isVisible,
      visibilityReason,
    };
  });
}

/**
 * Filters reviews to only show visible ones (for public display)
 */
export function getVisibleReviews<T extends BaseReview>(
  reviews: ReviewWithVisibility<T>[]
): ReviewWithVisibility<T>[] {
  return reviews.filter((review) => review.isVisible);
}

/**
 * Gets count of hidden negative reviews for a professional
 */
export function getHiddenReviewsCount<T extends BaseReview>(
  reviews: ReviewWithVisibility<T>[]
): number {
  return reviews.filter(
    (review) => !review.isVisible && review.visibilityReason === 'hidden_pending_pattern'
  ).length;
}

/**
 * Checks if a professional has hidden negative reviews (for UI indicators)
 */
export function hasHiddenNegativeReviews<T extends BaseReview>(
  reviews: ReviewWithVisibility<T>[]
): boolean {
  return getHiddenReviewsCount(reviews) > 0;
}

/**
 * Gets statistics about review visibility for a professional
 */
export function getReviewVisibilityStats<T extends BaseReview>(
  reviews: ReviewWithVisibility<T>[]
) {
  const visible = reviews.filter((r) => r.isVisible);
  const hidden = reviews.filter((r) => !r.isVisible);
  const negativeVisible = visible.filter((r) => {
    const rating = 'overallRating' in r ? r.overallRating || r.rating : r.rating;
    return rating <= 3;
  });
  const negativeHidden = hidden.filter((r) => {
    const rating = 'overallRating' in r ? r.overallRating || r.rating : r.rating;
    return rating <= 3;
  });

  return {
    total: reviews.length,
    visible: visible.length,
    hidden: hidden.length,
    negativeVisible: negativeVisible.length,
    negativeHidden: negativeHidden.length,
    hasPattern: negativeVisible.length >= 3,
  };
}
