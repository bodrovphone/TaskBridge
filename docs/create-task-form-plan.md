# Create Task Form - Implementation Plan

## Overview
Create a comprehensive, user-friendly task creation form that allows customers to post service requests on TaskBridge. The form should be intuitive, guide users through the process, and collect all necessary information to create compelling task listings that attract quality professionals.

## Route Information
- **Path**: `/[lang]/create-task`
- **Type**: Client Component (form interactivity required)
- **Auth**: Requires authentication (show auth slide-over if not logged in)
- **Localization**: Full i18n support (EN/BG/RU)

## Data Model (from schema.ts)

### Task Fields
Based on the database schema, we need to collect:

**Required Fields:**
- `title` (varchar, max 200) - Task title
- `description` (text) - Detailed description
- `category` (varchar) - Main category
- `city` (varchar) - City/location
- `customerId` (auto-filled from auth)

**Optional Fields:**
- `subcategory` (varchar) - More specific category
- `budgetMin` (decimal) - Minimum budget
- `budgetMax` (decimal) - Maximum budget
- `budgetType` (enum: 'range' | 'fixed') - Budget type
- `neighborhood` (varchar) - Specific area
- `exactAddress` (text) - Full address (hidden until professional selected)
- `deadline` (timestamp) - When task needs to be done
- `urgency` (enum: 'same_day' | 'within_week' | 'flexible')
- `requirements` (text) - Specific requirements/expectations
- `photos` (array of text URLs) - Task photos

**System Fields (auto-filled):**
- `id` (uuid) - Auto-generated
- `status` - Default: 'open'
- `isActive` - Default: true
- `createdAt` - Auto timestamp
- `updatedAt` - Auto timestamp

## Form Sections

### 1. Hero Section
**Purpose**: Set context and build confidence

**Elements:**
- Page title: "Post a New Task" (i18n: `createTask.title`)
- Subtitle: "Describe what you need and let professionals come to you"
- Trust indicators:
  - "Free to post"
  - "No payment until work starts"
  - "Average response time: 2 hours"
  - "1,500+ verified professionals"

### 2. Category Selection (Step 1)
**Purpose**: Help users categorize their task correctly

**UI Component**: Category cards grid
- Display 6 main categories with icons:
  - Home & Repair 🏠
  - Delivery & Transport 🚚
  - Personal Care 🐕
  - Personal Assistant 👤
  - Learning & Fitness 🎓
  - Other 📦

**Flow:**
1. User clicks category card
2. Subcategory dropdown appears (optional, based on category)
3. Form expands to next section

**Validation:**
- Category is required
- Show error if user tries to proceed without selection

### 3. Task Details (Step 2)
**Purpose**: Collect task title and description

**Fields:**

**3.1 Task Title**
- **Component**: NextUI Input
- **Label**: "Task Title" (i18n: `createTask.form.title`)
- **Placeholder**: "What do you need done?" (i18n: `createTask.form.titlePlaceholder`)
- **Max Length**: 200 characters
- **Validation**:
  - Required
  - Min 10 characters
  - Max 200 characters
  - Show character counter
- **Help Text**: "Be specific and clear (e.g., 'Professional house cleaning for 2-bedroom apartment')"

**3.2 Task Description**
- **Component**: NextUI Textarea
- **Label**: "Description" (i18n: `createTask.form.description`)
- **Placeholder**: "Describe your task in detail..." (i18n: `createTask.form.descriptionPlaceholder`)
- **Rows**: 6
- **Validation**:
  - Required
  - Min 50 characters
  - Max 2000 characters
  - Show character counter
- **Help Text**: "Include all important details: what needs to be done, any special requirements, tools/materials needed, etc."

**3.3 Requirements (Optional)**
- **Component**: NextUI Textarea
- **Label**: "Specific Requirements" (i18n: `createTask.form.requirements`)
- **Placeholder**: "• Requirement 1\n• Requirement 2\n• Requirement 3"
- **Rows**: 4
- **Help Text**: "List any special skills, certifications, or equipment needed (one per line)"

### 4. Location (Step 3)
**Purpose**: Specify where the task will be performed

**Fields:**

**4.1 City**
- **Component**: NextUI Select/Autocomplete
- **Label**: "City" (i18n: `createTask.form.city`)
- **Options**: Major Bulgarian cities
  - София
  - Пловдив
  - Варна
  - Бургас
  - Русе
  - Стара Загора
  - Плевен
  - Сливен
- **Validation**: Required
- **Allow custom input**: Yes (for smaller cities)

**4.2 Neighborhood (Optional)**
- **Component**: NextUI Input
- **Label**: "Neighborhood/District" (i18n: `createTask.form.neighborhood`)
- **Placeholder**: "e.g., Лозенец, Витоша, Център"
- **Help Text**: "Helps professionals determine if they can reach you"

**4.3 Exact Address (Optional)**
- **Component**: NextUI Input
- **Label**: "Full Address" (i18n: `createTask.form.exactAddress`)
- **Placeholder**: "Street, building number, entrance, floor, apartment"
- **Security Note**: "⚠️ Address will only be shown to the professional you hire"
- **Icon**: Lock icon next to label

### 5. Budget (Step 4)
**Purpose**: Set budget expectations

**Fields:**

**5.1 Budget Type**
- **Component**: NextUI Radio Group
- **Options**:
  - Fixed price (budgetType: 'fixed')
  - Price range (budgetType: 'range')
- **Default**: Range

**5.2 Budget Fields (Dynamic based on type)**

**If Fixed Price:**
- Single input: "Your budget" (uses budgetMax field)
- Placeholder: "100"
- Currency suffix: "лв"

**If Price Range:**
- Two inputs side by side:
  - "Minimum" (budgetMin)
  - "Maximum" (budgetMax)
- Currency suffix: "лв"
- Validation: budgetMax must be > budgetMin

**Help Text**: "Be realistic. Tasks with fair budgets get 3x more applications"

**Optional**: "I'm not sure" checkbox → allows submitting without budget (both null)

### 6. Timeline (Step 5)
**Purpose**: Communicate urgency and deadline

**Fields:**

**6.1 Urgency**
- **Component**: NextUI Radio Group with cards
- **Options**:
  - 🔴 Urgent - Same Day
    - urgency: 'same_day'
    - Description: "I need this done today"
  - 🟡 Soon - Within a Week
    - urgency: 'within_week'
    - Description: "I need this done in the next 7 days"
  - 🟢 Flexible
    - urgency: 'flexible'
    - Description: "I'm flexible with timing"
- **Default**: Flexible

**6.2 Specific Deadline (Optional)**
- **Component**: NextUI DatePicker
- **Label**: "Deadline (optional)"
- **Min Date**: Today
- **Max Date**: +90 days
- **Conditional**: Show if urgency is not 'same_day'
- **Help Text**: "Leave empty if you don't have a specific deadline"

### 7. Photos (Step 6)
**Purpose**: Visual context helps professionals understand the task

**Component**: Image upload with preview

**Features:**
- Drag & drop zone
- Click to browse
- Multiple file upload (max 5 images)
- Image preview with remove button
- File size limit: 5MB per image
- Accepted formats: JPG, PNG, WebP
- Thumbnail display: 150x150px
- Progress indicator during upload

**Help Text**: "Photos help professionals understand your task better and give more accurate quotes"

**Layout**: Grid of uploaded images with "Add more" button

### 8. Review & Submit (Step 7)
**Purpose**: Review all information before posting

**Layout**: Card-based summary

**Preview Sections:**
1. **Task Overview**
   - Category badge
   - Title
   - Description (collapsed after 3 lines)

2. **Location**
   - City, Neighborhood
   - Address (masked: "ул. *** ***, София")

3. **Budget & Timeline**
   - Budget display
   - Urgency badge
   - Deadline (if set)

4. **Requirements**
   - Bullet list

5. **Photos**
   - Thumbnail carousel

**Actions:**
- "Edit" buttons next to each section (scroll back)
- Primary button: "Post Task" (large, prominent)
- Secondary button: "Save as Draft" (optional future feature)

**Submit Flow:**
1. Click "Post Task"
2. Show loading state
3. If success:
   - Redirect to task detail page
   - Show success toast: "Task posted successfully!"
4. If error:
   - Show error message
   - Allow retry

## Form State Management

### Using React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createTaskSchema = z.object({
  // Category
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),

  // Details
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  requirements: z.string().optional(),

  // Location
  city: z.string().min(1, 'City is required'),
  neighborhood: z.string().optional(),
  exactAddress: z.string().optional(),

  // Budget
  budgetType: z.enum(['fixed', 'range']),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),

  // Timeline
  urgency: z.enum(['same_day', 'within_week', 'flexible']),
  deadline: z.date().optional(),

  // Photos
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed'),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>
```

## UI/UX Considerations

### Multi-Step vs Single Page
**Decision**: Use a **single scrollable page with progressive disclosure**

**Rationale:**
- Better for mobile (no step navigation)
- Users can see progress by scrolling
- Easier to go back and edit sections
- Less cognitive load (no "Where am I?" confusion)

**Implementation:**
- All sections visible but collapsed initially
- Sections expand as user completes previous section
- "Next" button at end of each section smoothly scrolls to next
- Sticky "Post Task" button appears after all required fields filled

### Form Persistence
- Auto-save to localStorage every 30 seconds
- Restore from localStorage on page load
- Show "Restore unsaved task?" prompt if data exists
- Clear localStorage after successful submission

### Validation Strategy
- **On blur**: Validate individual fields
- **On change**: Clear errors, show live character count
- **On submit**: Validate entire form
- Show inline errors below each field
- Scroll to first error on submit attempt

### Mobile Optimization
- Stack all inputs vertically
- Larger touch targets (min 44px)
- Show mobile-friendly date picker
- Optimize image upload for mobile cameras
- Fixed bottom bar with "Post Task" button

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management (auto-focus on errors)
- Screen reader announcements for errors
- Sufficient color contrast
- Error messages linked to inputs

## API Integration

### Endpoint: POST /api/tasks

**Request Body:**
```typescript
{
  title: string
  description: string
  category: string
  subcategory?: string
  city: string
  neighborhood?: string
  exactAddress?: string
  budgetMin?: number
  budgetMax?: number
  budgetType: 'fixed' | 'range'
  urgency: 'same_day' | 'within_week' | 'flexible'
  deadline?: string (ISO date)
  requirements?: string
  photos?: string[] (URLs)
}
```

**Response (Success - 201):**
```typescript
{
  success: true
  task: {
    id: string
    title: string
    // ... full task object
  }
}
```

**Response (Error - 400):**
```typescript
{
  success: false
  error: string
  fieldErrors?: Record<string, string>
}
```

## Image Upload Flow

### Strategy: Upload to Cloud Storage First

**Flow:**
1. User selects image
2. Validate file (size, type)
3. Show preview with loading state
4. Upload to cloud storage (Cloudinary/AWS S3)
5. Get URL back
6. Store URL in form state
7. Include URLs in final task submission

**Error Handling:**
- Show error toast if upload fails
- Allow retry for failed uploads
- Don't block form submission if optional

## Success Metrics

**Conversion Goals:**
- Form start rate: 70% (of visitors who view page)
- Form completion rate: 60% (of users who start)
- Time to complete: < 5 minutes average
- Validation errors per submission: < 2 average

**Quality Metrics:**
- Tasks with photos: > 50%
- Tasks with budget: > 80%
- Tasks with requirements: > 40%
- Professional application rate: > 5 per task average

## Technical Implementation Checklist

### Phase 1: Setup & Basic Structure
- [ ] Create `/app/[lang]/create-task/page.tsx`
- [ ] Set up form state with React Hook Form
- [ ] Create Zod validation schema
- [ ] Add all i18n translation keys
- [ ] Create layout component with hero section

### Phase 2: Form Sections
- [ ] Build Category Selection component
- [ ] Build Task Details section
- [ ] Build Location section
- [ ] Build Budget section
- [ ] Build Timeline section
- [ ] Build Photos upload section
- [ ] Build Review & Preview section

### Phase 3: Validation & UX
- [ ] Implement field-level validation
- [ ] Add inline error messages
- [ ] Add character counters
- [ ] Implement progressive disclosure
- [ ] Add smooth scroll between sections
- [ ] Add form persistence (localStorage)

### Phase 4: API Integration
- [ ] Create POST /api/tasks endpoint
- [ ] Implement image upload service
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success redirect

### Phase 5: Polish
- [ ] Mobile responsive design
- [ ] Accessibility audit
- [ ] Add animations/transitions
- [ ] Add help tooltips
- [ ] Performance optimization
- [ ] Cross-browser testing

## Dependencies

**UI Components:**
- NextUI: Button, Input, Textarea, Select, Radio, DatePicker, Card, Chip
- Lucide React: Icons
- React Hook Form: Form state management
- Zod: Schema validation
- date-fns: Date formatting

**New Dependencies to Add:**
- `react-dropzone` or `@uploadthing/react` - Image upload
- `cloudinary` or AWS SDK - Cloud storage (decide based on infra)

## File Structure

```
/src/app/[lang]/create-task/
├── page.tsx                          # Main page component
├── components/
│   ├── create-task-form.tsx         # Main form component
│   ├── category-selection.tsx       # Step 1
│   ├── task-details-section.tsx    # Step 2
│   ├── location-section.tsx         # Step 3
│   ├── budget-section.tsx           # Step 4
│   ├── timeline-section.tsx         # Step 5
│   ├── photos-section.tsx           # Step 6
│   ├── review-section.tsx           # Step 7
│   └── form-navigation.tsx          # Progress/navigation
└── lib/
    ├── validation.ts                 # Zod schemas
    ├── form-persistence.ts           # localStorage helpers
    └── types.ts                      # TypeScript types
```

## Translation Keys Needed

Add to all language files (en.ts, bg.ts, ru.ts):

```typescript
'createTask.hero.title': 'Post a New Task',
'createTask.hero.subtitle': 'Describe what you need and let professionals come to you',
'createTask.hero.freeToPost': 'Free to post',
'createTask.hero.noPayment': 'No payment until work starts',
'createTask.hero.avgResponse': 'Average response time: 2 hours',
'createTask.hero.verifiedPros': '1,500+ verified professionals',

'createTask.category.title': 'What type of service do you need?',
'createTask.category.subtitle': 'Select the category that best matches your task',

'createTask.details.title': 'Tell us about your task',
'createTask.details.titleLabel': 'Task Title',
'createTask.details.titlePlaceholder': 'What do you need done?',
'createTask.details.titleHelp': 'Be specific and clear',
'createTask.details.descriptionLabel': 'Description',
'createTask.details.descriptionPlaceholder': 'Describe your task in detail...',
'createTask.details.descriptionHelp': 'Include all important details',
'createTask.details.requirementsLabel': 'Specific Requirements',
'createTask.details.requirementsPlaceholder': '• Requirement 1\n• Requirement 2',

'createTask.location.title': 'Where will the task be performed?',
'createTask.location.cityLabel': 'City',
'createTask.location.neighborhoodLabel': 'Neighborhood',
'createTask.location.addressLabel': 'Full Address',
'createTask.location.addressSecurity': 'Address will only be shown to hired professional',

'createTask.budget.title': 'What is your budget?',
'createTask.budget.typeFixed': 'Fixed Price',
'createTask.budget.typeRange': 'Price Range',
'createTask.budget.minLabel': 'Minimum',
'createTask.budget.maxLabel': 'Maximum',
'createTask.budget.help': 'Fair budgets get 3x more applications',
'createTask.budget.notSure': "I'm not sure about the budget",

'createTask.timeline.title': 'When do you need this done?',
'createTask.timeline.urgentTitle': 'Urgent - Same Day',
'createTask.timeline.urgentDesc': 'I need this done today',
'createTask.timeline.soonTitle': 'Soon - Within a Week',
'createTask.timeline.soonDesc': 'I need this done in the next 7 days',
'createTask.timeline.flexibleTitle': 'Flexible',
'createTask.timeline.flexibleDesc': "I'm flexible with timing",
'createTask.timeline.deadlineLabel': 'Specific Deadline',

'createTask.photos.title': 'Add photos (optional)',
'createTask.photos.help': 'Photos help professionals understand your task better',
'createTask.photos.dragDrop': 'Drag and drop images here',
'createTask.photos.orBrowse': 'or click to browse',
'createTask.photos.maxFiles': 'Maximum 5 images',
'createTask.photos.maxSize': '5MB per image',

'createTask.review.title': 'Review your task',
'createTask.review.edit': 'Edit',
'createTask.review.submit': 'Post Task',
'createTask.review.saveDraft': 'Save as Draft',

'createTask.success.title': 'Task posted successfully!',
'createTask.success.message': 'Professionals will start applying soon',
'createTask.success.viewTask': 'View Your Task',

'createTask.errors.titleRequired': 'Task title is required',
'createTask.errors.titleTooShort': 'Title must be at least 10 characters',
'createTask.errors.descriptionRequired': 'Task description is required',
'createTask.errors.descriptionTooShort': 'Description must be at least 50 characters',
'createTask.errors.categoryRequired': 'Please select a category',
'createTask.errors.cityRequired': 'City is required',
'createTask.errors.budgetInvalid': 'Maximum must be greater than minimum',
```

## Open Questions / Decisions Needed

1. **Image Upload Service**: Use Cloudinary, AWS S3, or Uploadthing?
2. **Draft Saving**: Implement draft feature in MVP or post-MVP?
3. **Payment Integration**: Collect payment info during task creation or later?
4. **Professional Matching**: Auto-suggest professionals based on category/location?
5. **Notification Preferences**: Allow users to set notification preferences for task?
6. **Task Templates**: Provide common task templates to speed up creation?

## Future Enhancements (Post-MVP)

- AI-powered title/description suggestions
- Duplicate task detection
- Smart budget recommendations based on similar tasks
- Professional recommendation engine
- Video upload support
- Voice input for description
- Template library for common tasks
- Multi-task posting (batch creation)
- Social sharing preview
- Schedule task posting for later
