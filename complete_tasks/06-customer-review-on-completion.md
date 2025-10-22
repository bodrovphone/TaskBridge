# Customer Review on Task Completion

## Task Description
Add optional review fields to the Customer Confirmation Dialog when confirming task completion. Allow customers to immediately provide a rating, review, and actual price paid alongside their completion confirmation.

## Problem
Currently, when a customer confirms task completion, they only see a simple Yes/No choice. We need to enhance this with optional fields that allow customers to provide immediate feedback and track actual payment amounts.

## Requirements

### Fields to Add (when customer selects "Yes, I'm satisfied")

1. **Actual Price Paid** (optional)
   - Number input field
   - Currency symbol (BGN) displayed
   - Placeholder: "Enter actual amount paid..."
   - Help text: "Track actual payment vs original budget"
   - Validation: Positive number only

2. **Rating** (optional)
   - 5-star rating component (like in professional reviews)
   - Interactive stars (click to rate)
   - Default: No rating (0 stars)
   - Visual feedback on hover
   - Label: "Rate your experience (optional)"

3. **Review Text** (optional)
   - Textarea input
   - Placeholder: "Share your experience with [Professional Name]..."
   - Character limit: 500 characters
   - Character counter displayed
   - Label: "Write a review (optional)"
   - Help text: "Your review will be visible on the professional's profile"

### UI/UX Requirements

- All three fields should appear ONLY when customer selects "Yes, I'm satisfied"
- Fields should be visually grouped together in a "Review" section
- Clear visual hierarchy:
  1. Satisfaction question (Yes/No)
  2. Review section (if Yes selected)
  3. Confirm button at bottom
- Mobile-responsive design
- Smooth animation when review fields appear
- "Skip and Confirm" button option for quick confirmation without review

### Component Structure

Update `/src/components/tasks/confirm-completion-dialog.tsx`:

```typescript
interface ConfirmationData {
  actualPricePaid?: number
  rating?: number  // 1-5 stars, or undefined if not rated
  reviewText?: string
}

// When customer clicks "Confirm Completion":
onConfirm({
  actualPricePaid: actualPrice || undefined,
  rating: starRating || undefined,
  reviewText: reviewText.trim() || undefined
})
```

### Translation Keys Needed

Add to all language files (en.ts, bg.ts, ru.ts):

```typescript
'taskCompletion.confirmDialog.reviewSection': 'Review (Optional)',
'taskCompletion.confirmDialog.actualPricePaid': 'Actual Price Paid',
'taskCompletion.confirmDialog.actualPricePlaceholder': 'Enter amount...',
'taskCompletion.confirmDialog.actualPriceHelp': 'Track actual payment vs original budget',
'taskCompletion.confirmDialog.ratingLabel': 'Rate your experience',
'taskCompletion.confirmDialog.reviewLabel': 'Write a review',
'taskCompletion.confirmDialog.reviewPlaceholder': 'Share your experience with {{name}}...',
'taskCompletion.confirmDialog.reviewHelp': 'Your review will be visible on the professional\'s profile',
'taskCompletion.confirmDialog.skipAndConfirm': 'Skip and Confirm',
'taskCompletion.confirmDialog.confirmWithReview': 'Confirm Completion',
```

## Acceptance Criteria

- [ ] Actual Price Paid field added with currency symbol and validation
- [ ] 5-star rating component integrated (reusable component)
- [ ] Review textarea with character counter (max 500 chars)
- [ ] All three fields only visible when "Yes" is selected
- [ ] Fields are optional - can confirm without filling any
- [ ] Smooth animation when fields appear/disappear
- [ ] Mobile-responsive layout
- [ ] Translation keys added for EN/BG/RU
- [ ] "Skip and Confirm" vs "Confirm with Review" button clarity
- [ ] Data properly passed to onConfirm handler
- [ ] Demo page updated to show new fields

## Technical Notes

### Star Rating Component
- Create reusable `/src/components/common/star-rating.tsx`
- Interactive (clickable) variant for input
- Display-only variant for showing existing ratings
- Half-star support (optional for MVP)
- Hover effects with fill preview
- Keyboard accessible (arrow keys to select)

### Character Counter Component
```typescript
<div className="flex justify-between items-center">
  <label>Write a review (optional)</label>
  <span className={`text-sm ${charCount > 500 ? 'text-danger' : 'text-gray-500'}`}>
    {charCount}/500
  </span>
</div>
```

### Data Flow
1. Customer selects "Yes" → Review fields appear with smooth slide-down animation
2. Customer optionally fills any/all fields
3. Customer clicks "Confirm Completion"
4. Dialog passes all data to parent via onConfirm callback
5. Parent handles saving review data (future backend integration)
6. Dialog closes with success animation

## Priority
**High** - Core feature for customer feedback loop

## Estimated Effort
2-3 hours (star rating component + dialog updates + translations)

## Dependencies
- None - can be implemented immediately
- Star rating component will be reused in future review features

## Future Enhancements (Post-MVP)
- Photo upload for completed work (customer can upload photos)
- Tip/bonus amount field
- Share to social media option
- Review draft auto-save
- Edit review option (within 48 hours)

## Notes
- Keep all fields optional to reduce friction
- Default state should allow instant confirmation (one click)
- Review data should be stored but not immediately visible (pending review period)
- Professional's review of customer also needs similar flow (separate task)
