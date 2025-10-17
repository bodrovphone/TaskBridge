# Application Submission UI Components

## Task Description

Build the complete UI for task application submission flow, including the application dialog, form validation, and success states. This is pure frontend work with mock data - no backend integration.

## Requirements

### 1. ApplicationDialog Component

**Location:** `/src/components/tasks/application-dialog.tsx`

**Features:**
- Modal/SlideOver component using NextUI or Radix UI
- Multi-step form (optional wizard pattern)
- Real-time client-side validation
- Character counters for text inputs
- Image upload with drag & drop
- Loading states during submission
- Success confirmation view

**Form Fields:**
```typescript
interface ApplicationFormData {
  proposedPrice: number;        // Required, > 0
  timeline: string;             // Required, select or text
  message: string;              // Required, 50-500 chars
  portfolioImages?: File[];     // Optional, max 5 images, 5MB each
  experience?: string;          // Optional, textarea
}
```

### 2. Form Validation

- **Proposed Price:**
  - Must be greater than 0
  - Show task budget range for reference
  - Format with currency (BGN)

- **Timeline:**
  - Predefined options: "Today", "Within 3 days", "Within a week", "Flexible"
  - Or free text input

- **Application Message:**
  - Min 50 characters
  - Max 500 characters
  - Character counter (live update)
  - Placeholder: "Why are you the best fit for this task? Share your experience..."

- **Portfolio Images:**
  - Drag & drop or file selector
  - Image preview thumbnails
  - Delete uploaded images
  - Max 5 images
  - Max 5MB per image
  - Accepted formats: JPG, PNG, WEBP

### 3. Application States & Badges

**Create TaskApplicationBadge component:**
- Location: `/src/components/tasks/task-application-badge.tsx`
- States:
  - "Apply" (default button)
  - "✓ Applied" (green badge, disabled)
  - "Pending Review" (yellow badge)
  - "Accepted" (green badge with checkmark)
  - "Rejected" (gray badge)

### 4. Success Confirmation

After submission, show:
```
✅ Your application has been submitted!

The task owner will review your application and
respond soon. You'll be notified when they respond.

[View My Application] [Browse Other Tasks]
```

## UI Design Requirements

- Use NextUI components (Modal, Button, Input, Textarea)
- Framer Motion animations for smooth transitions
- Mobile responsive
- Accessible (keyboard navigation, ARIA labels)
- Loading spinners during image upload
- Error messages clearly displayed

## Mock Data Integration

```typescript
// Mock submission function
const submitApplication = async (data: ApplicationFormData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock success response
  return {
    success: true,
    applicationId: 'app-' + Math.random(),
    message: 'Application submitted successfully'
  };
};
```

## Acceptance Criteria

- [ ] ApplicationDialog component created and styled
- [ ] All form fields implemented with validation
- [ ] Image upload with drag & drop works
- [ ] Character counter updates in real-time
- [ ] Form validation prevents invalid submissions
- [ ] Success confirmation screen shows after submit
- [ ] Loading states display during submission
- [ ] Mobile responsive design
- [ ] TaskApplicationBadge component created
- [ ] All application states visually distinct
- [ ] Component integrated on task detail page
- [ ] Animations smooth and polished

## Technical Notes

- Use React Hook Form for form management
- Use Zod for schema validation
- Store uploaded images as base64 or mock URLs
- Use localStorage to persist application state (optional)
- Handle form errors gracefully

## Translation Keys Needed

```typescript
{
  "application.title": "Apply for this Task",
  "application.proposedPrice": "Your Price",
  "application.pricePlaceholder": "Enter your price",
  "application.timeline": "When can you start?",
  "application.timelineToday": "Today",
  "application.timeline3days": "Within 3 days",
  "application.timelineWeek": "Within a week",
  "application.timelineFlexible": "Flexible",
  "application.message": "Why are you the best fit?",
  "application.messagePlaceholder": "Share your relevant experience and why you're perfect for this task...",
  "application.portfolio": "Portfolio Images (Optional)",
  "application.portfolioDragDrop": "Drag & drop images or click to browse",
  "application.experience": "Relevant Experience (Optional)",
  "application.submit": "Submit Application",
  "application.submitting": "Submitting...",
  "application.cancel": "Cancel",
  "application.success": "Application Submitted!",
  "application.successMessage": "The task owner will review your application and respond soon.",
  "application.viewApplication": "View My Application",
  "application.browseOther": "Browse Other Tasks",
  "application.errors.priceRequired": "Price is required",
  "application.errors.priceMin": "Price must be greater than 0",
  "application.errors.timelineRequired": "Timeline is required",
  "application.errors.messageRequired": "Message is required",
  "application.errors.messageMin": "Message must be at least 50 characters",
  "application.errors.messageMax": "Message cannot exceed 500 characters",
  "application.errors.imagesMax": "Maximum 5 images allowed",
  "application.errors.imageSizeMax": "Image size must be less than 5MB"
}
```

## Priority

**High** - Core feature for MVP

## Estimated Time

2-3 days
