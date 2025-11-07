# Split Profile Page into Customer and Professional Profiles

## Task Description
Separate the current unified profile page into two distinct pages - one for customers (taskgivers) and one for professionals. Both profiles will share the same underlying database fields but present different UI/UX tailored to each role.

## Current State
- Single profile page at `/[lang]/profile`
- Uses tabs to switch between customer and professional views
- Avatar dropdown shows single "Profile" link
- Mixed UI elements that may not be relevant to current role

## Target State
- Two separate profile routes:
  - `/[lang]/profile/customer` - Customer-focused profile
  - `/[lang]/profile/professional` - Professional-focused profile
- Avatar dropdown shows both profile options always:
  - "I am customer (taskgiver)"
  - "I am professional"
- Clean, role-specific UI for each page
- Shared fields (phone, email, avatar, name) synchronized across both profiles

## Requirements

### 1. Navigation Changes
- [ ] Update header avatar dropdown (`/src/components/common/header.tsx`)
- [ ] Replace single "Profile" link with two options:
  - "I am customer (taskgiver)" → `/[lang]/profile/customer`
  - "I am professional" → `/[lang]/profile/professional`
- [ ] Add icons to differentiate roles (e.g., User icon for customer, Briefcase for professional)
- [ ] Always show both options regardless of user's current role or profile completion

### 2. Routing Structure
- [ ] Create new route structure:
  ```
  /src/app/[lang]/profile/
  ├── customer/
  │   └── page.tsx          # Customer profile page
  └── professional/
      └── page.tsx          # Professional profile page
  ```
- [ ] Remove or redirect old `/[lang]/profile` route to `/[lang]/profile/customer` as default
- [ ] Ensure proper locale handling in both routes

### 3. Customer Profile Page (`/profile/customer`)

**Sections to Include:**
- [ ] Personal Information (avatar, name, email, phone, location)
  - Reuse: `personal-info-section.tsx` or extract common component
- [ ] Language & Contact Preferences
  - Language preference
  - Preferred contact method (email/phone/telegram)
- [ ] Statistics Section
  - Tasks posted
  - Tasks completed
  - Average rating received
  - Total spent
- [ ] Notification Settings
  - Email notifications toggle
  - SMS notifications toggle
  - Telegram connection (if available)
- [ ] Recent Activity (optional for MVP)
  - Latest tasks posted
  - Recent completions

**Buttons/Actions:**
- [ ] "My Posted Tasks" → `/[lang]/tasks/posted`
- [ ] "Settings" → Settings modal
- [ ] NO "My Work" or "My Applications" buttons (professional-only)

**Components to Create/Reuse:**
- [ ] Extract shared personal info component
- [ ] Reuse customer statistics section
- [ ] Reuse notification preferences section

### 4. Professional Profile Page (`/profile/professional`)

**Sections to Include:**
- [ ] Personal Information (avatar, name, email, phone, location)
  - Same component as customer profile
- [ ] Professional Identity
  - Professional title, bio, years of experience
  - Reuse: `professional-identity-section.tsx`
- [ ] Service Categories
  - Reuse: `service-categories-section.tsx`
- [ ] Verification & Trust
  - Phone verification status
  - Reuse: `verification-section.tsx`
- [ ] Availability & Preferences
  - Availability status, response time, service area, languages
  - Reuse: `availability-section.tsx`
- [ ] Business Settings
  - Payment methods, business hours
  - Reuse: `business-settings-section.tsx`
- [ ] Statistics Section
  - Completed jobs, total earnings, profile views
  - Reuse: `statistics-section.tsx`

**Buttons/Actions:**
- [ ] "Browse Tasks" → `/[lang]/browse-tasks`
- [ ] "My Applications" → `/[lang]/tasks/applications`
- [ ] "My Work" → `/[lang]/tasks/work`
- [ ] "Settings" → Settings modal
- [ ] NO "My Posted Tasks" button (customer-only)

**Components to Reuse:**
- [ ] All existing professional sections from current implementation
- [ ] Professional profile container logic

### 5. Shared Components Architecture

**Extract/Create Shared Components:**
- [ ] Create `/src/app/[lang]/profile/components/shared/` directory
- [ ] `personal-info-section.tsx` - Avatar, name, email, phone, location
- [ ] `notification-settings-section.tsx` - Email, SMS, Telegram toggles
- [ ] `settings-modal.tsx` - Account settings modal

**Component Organization:**
```
/src/app/[lang]/profile/
├── components/
│   ├── shared/                    # Shared between both profiles
│   │   ├── personal-info-section.tsx
│   │   ├── notification-settings-section.tsx
│   │   └── settings-modal.tsx
│   ├── customer/                  # Customer-specific components
│   │   └── customer-statistics-section.tsx
│   └── professional/              # Professional-specific components
│       ├── professional-identity-section.tsx
│       ├── availability-section.tsx
│       ├── business-settings-section.tsx
│       ├── service-categories-section.tsx
│       ├── verification-section.tsx
│       └── statistics-section.tsx (rename from existing)
├── customer/
│   └── page.tsx
└── professional/
    └── page.tsx
```

### 6. Data Synchronization

**Shared Fields (same DB columns):**
- [ ] `avatar_url` - Profile picture
- [ ] `full_name` or `first_name/last_name` - User name
- [ ] `email` - Email address
- [ ] `phone_number` - Phone number
- [ ] `is_phone_verified` - Phone verification status
- [ ] `location` or `city` - Location/city
- [ ] `preferred_language` - UI language preference
- [ ] `preferred_contact_method` - Contact method preference
- [ ] `telegram_id`, `telegram_username` - Telegram connection

**Customer-Only Fields:**
- [ ] Customer statistics (tasks_posted, tasks_completed, average_rating, total_spent)

**Professional-Only Fields:**
- [ ] Professional profile data (title, bio, years_experience)
- [ ] Service categories
- [ ] Availability status, response time, service area
- [ ] Business settings (payment methods, business hours)
- [ ] Professional statistics (completed_jobs, total_earnings, profile_views)

**Implementation Notes:**
- Both pages fetch from same `users` table
- Update mutations affect same user record
- UI only shows relevant fields for each role
- No data duplication in database

### 7. Translation Keys

**Add New Keys:**
- [ ] `nav.profileCustomer` - "I am customer (taskgiver)" / "Аз съм клиент (поръчвам услуги)" / "Я клиент (заказываю услуги)"
- [ ] `nav.profileProfessional` - "I am professional" / "Аз съм професионалист" / "Я профессионал"
- [ ] `profile.customer.title` - "Customer Profile" / "Профил на клиент" / "Профиль клиента"
- [ ] `profile.professional.title` - "Professional Profile" / "Професионален профил" / "Профессиональный профиль"

**Update Existing:**
- [ ] Review all profile-related translation keys for context
- [ ] Ensure customer vs professional distinction in translations

### 8. Quick Actions / Navigation

**Customer Profile Quick Actions:**
- [ ] Card/button: "My Posted Tasks" with badge count
- [ ] Card/button: "Create New Task"
- [ ] Link to "View my ratings and reviews"

**Professional Profile Quick Actions:**
- [ ] Card/button: "Browse Available Tasks"
- [ ] Card/button: "My Applications" with badge count
- [ ] Card/button: "My Active Work" with count
- [ ] Link to "View my professional ratings"

### 9. Mobile Responsiveness
- [ ] Ensure both profile pages are mobile-friendly
- [ ] Test navigation between profiles on mobile
- [ ] Verify all sections collapse/expand properly
- [ ] Check avatar dropdown works on mobile menu

### 10. Professional Onboarding Guide (Landing Page Update)

**Context:**
Users are considered professionals when they have:
- ✅ **Professional title set (REQUIRED)** - This is the ONLY hard requirement
- ⭐ Service categories (RECOMMENDED but optional) - Helps with search/filtering but not required

**Updated Requirements (Less Strict):**
The system now has a single requirement for professionals:
- **ONLY `professional_title` is required** to appear in professionals browse page
- `service_categories` is optional - professionals can list without categories
- This allows professionals to start getting visibility immediately with just a title
- They can add categories later to improve discoverability via category filters

**Professional Status Logic:**
```typescript
// Helper function to check if user is a professional (UPDATED - less strict)
export const isProfessional = (profile: UserProfile): boolean => {
  // ONLY professional title is required now
  return !!(profile.professionalTitle && profile.professionalTitle.trim() !== '');
};

// Profile completion percentage (UPDATED)
export const getProfessionalCompletion = (profile: UserProfile): number => {
  const hasTitle = !!(profile.professionalTitle && profile.professionalTitle.trim() !== '');
  const hasBio = !!(profile.bio && profile.bio.trim() !== '');
  const hasCategories = profile.serviceCategories && profile.serviceCategories.length > 0;
  const hasLocation = !!(profile.city || profile.location);

  // Calculate completion based on recommended fields
  let completion = 0;
  if (hasTitle) completion += 40; // Required field
  if (hasCategories) completion += 30; // Highly recommended
  if (hasBio) completion += 20; // Recommended
  if (hasLocation) completion += 10; // Nice to have

  return completion;
};
```

**Database Query Logic (Implementation):**
```typescript
// In professional.repository.ts - UPDATED to be less strict
let query = supabase
  .from('users')
  .select('*', { count: 'exact' })
  .not('professional_title', 'is', null)
  .neq('professional_title', '')
  // Note: service_categories check REMOVED - now optional

// Category filter still works when user searches by category
if (params.category) {
  query = query.contains('service_categories', [params.category])
}
```

**Requirements:**
- [ ] Update landing page guide to reflect new simplified requirements
- [ ] Add clear explanation:
  - "To become a professional, you only need to set your professional title"
  - "Adding service categories is recommended but optional"
- [ ] Add visual indicators showing:
  - ✅ Step 1: Set your professional title (REQUIRED)
  - ⭐ Step 2: Add bio and service categories (RECOMMENDED)
  - ✅ Step 3: Start browsing tasks and applying
- [ ] Update "Become a Professional" CTA button/section on homepage
- [ ] Link to `/[lang]/profile/professional` from guide
- [ ] Add tooltip explaining optional vs required fields
- [ ] Show profile completion percentage (based on recommended fields)

**Landing Page Sections to Update:**
```typescript
// Example guide structure - UPDATED for less strict requirements

<Section title="How to Become a Professional">
  <Step number={1} required={true}>
    <Icon>Briefcase</Icon>
    <Title>Set Your Professional Title</Title>
    <Badge>Required</Badge>
    <Description>
      Tell clients what you do (e.g., "Plumber", "Electrician", "House Cleaner")
      This is all you need to start appearing in the professionals directory!
    </Description>
  </Step>

  <Step number={2} required={false}>
    <Icon>Star</Icon>
    <Title>Complete Your Profile (Recommended)</Title>
    <Badge>Recommended</Badge>
    <Description>
      Add a bio, service categories, and location to improve your visibility
      and help clients find you more easily. You can do this anytime!
    </Description>
  </Step>

  <Step number={3}>
    <Icon>Zap</Icon>
    <Title>Start Browsing & Applying</Title>
    <Description>
      Browse available tasks and apply to jobs that match your skills.
      Build your reputation by completing tasks successfully!
    </Description>
  </Step>

  <Button href="/en/profile/professional">
    Set Professional Title →
  </Button>
</Section>
```

**Translation Keys to Add/Update:**
- [ ] `landing.professional.howToBecome` - "How to Become a Professional"
- [ ] `landing.professional.requirements` - "Simple requirements to get started"
- [ ] `landing.professional.step1Title` - "Set Your Professional Title"
- [ ] `landing.professional.step1Desc` - "Tell clients what you do - that's all you need!"
- [ ] `landing.professional.step2Title` - "Complete Your Profile"
- [ ] `landing.professional.step2Desc` - "Add bio and categories to improve visibility (optional)"
- [ ] `landing.professional.step3Title` - "Start Browsing & Applying"
- [ ] `landing.professional.step3Desc` - "Browse tasks and build your reputation"
- [ ] `landing.professional.setProfessionalTitle` - "Set Professional Title"
- [ ] `landing.professional.minRequirements` - "Only requirement: Professional title"
- [ ] `landing.professional.recommendedFields` - "Recommended: Bio + Service categories + Location"
- [ ] `profile.professional.required` - "Required"
- [ ] `profile.professional.recommended` - "Recommended"
- [ ] `profile.professional.optional` - "Optional"

**Files to Update:**
- [ ] `/src/app/[lang]/page.tsx` - Landing page component
- [ ] `/src/components/pages/landing-page.tsx` - Landing page sections
- [ ] `/src/lib/intl/[lang]/landing.ts` - Translation keys (EN/BG/RU)
- [x] `/src/server/professionals/professional.repository.ts` - Query logic updated

### 11. Testing Checklist
- [ ] User can navigate from avatar dropdown to customer profile
- [ ] User can navigate from avatar dropdown to professional profile
- [ ] Shared fields update correctly on both pages
- [ ] Customer-only features don't appear on professional page
- [ ] Professional-only features don't appear on customer page
- [ ] Statistics display correctly for each role
- [ ] Quick action buttons navigate to correct pages
- [ ] All sections are properly translated (EN/BG/RU)
- [ ] Mobile navigation works smoothly
- [ ] Settings modal works from both pages

## Technical Notes

### Migration Strategy
1. **Phase 1**: Create new routes and basic pages
   - Set up `/customer` and `/professional` routes
   - Create basic page shells

2. **Phase 2**: Extract shared components
   - Move personal info to shared folder
   - Create reusable sections

3. **Phase 3**: Build customer profile
   - Customer-specific sections
   - Customer quick actions

4. **Phase 4**: Move professional profile
   - Reorganize existing professional components
   - Professional quick actions

5. **Phase 5**: Update navigation
   - Update header dropdown
   - Add role icons
   - Test navigation flow

### Component Reuse Strategy
- **High Priority Reuse**: Personal info, notifications, settings modal
- **Medium Priority**: Statistics sections (similar structure, different data)
- **Low Priority**: Role-specific sections (already separate)

### Performance Considerations
- Both pages load same user data
- Consider caching strategy for user profile
- Lazy load heavy sections (portfolio, statistics)
- Optimize images (avatar, portfolio items)

## Priority
**High** - Improves user experience and clarifies role-specific functionality

## Estimated Effort
- Route setup: 1 hour
- Component extraction: 2 hours
- Customer profile page: 2 hours
- Professional profile page: 2 hours
- Navigation updates: 1 hour
- Translation updates: 1 hour
- Testing & refinement: 2 hours
- **Total**: ~11 hours (1.5 days)

## Benefits
✅ Cleaner, role-specific UI for each user type
✅ Better organization of profile-related features
✅ Easier to add role-specific features in future
✅ Improved user mental model (clear separation of roles)
✅ Better mobile experience (less clutter per page)
✅ Foundation for future dual-role user features

## Risks & Considerations
⚠️ Ensure users understand they have two profiles
⚠️ Keep shared field synchronization bug-free
⚠️ Don't confuse users with duplicate information
⚠️ Maintain backward compatibility with existing profile links
⚠️ Consider SEO implications of route changes

## Dependencies
- Current profile implementation at `/src/app/[lang]/profile/`
- Header component at `/src/components/common/header.tsx`
- User profile types in `/src/types/`
- Profile translation keys in `/src/lib/intl/[lang]/profile.ts`

## Follow-up Tasks
- [ ] Add profile completion indicators for each role separately
- [ ] Consider adding role-switching confirmation dialog (future)
- [ ] Add breadcrumbs showing current profile view
- [ ] Analytics tracking for profile page visits by role
