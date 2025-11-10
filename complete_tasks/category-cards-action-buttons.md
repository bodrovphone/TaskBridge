# Category Cards Action Buttons

## Task Description
Add action buttons to category cards on the categories page to improve navigation and user experience. Each category card should have clear call-to-action buttons that help users quickly find professionals or tasks within that category.

## Requirements
Add three buttons to each category card:

1. **"Search Professionals"** button
   - Links to `/professionals` page with category filter pre-applied
   - Should pass all subcategories from that category card as parameters
   - Example: `/en/professionals?category=cleaning&subcategories=home-cleaning,office-cleaning`

2. **"Search Tasks"** button
   - Links to `/browse-tasks` page with category filter pre-applied
   - Should pass all subcategories from that category card as parameters
   - Example: `/en/browse-tasks?category=cleaning&subcategories=home-cleaning,office-cleaning`

3. **"Can't find your category?"** help button (question-mark icon)
   - Shows tooltip or opens modal with message:
     - "Can't find your exact category? Send us a suggestion and we will add it within 24 hours for you."
   - Should provide way to submit category suggestion (form or link to contact)

## Acceptance Criteria

### Database
- [ ] `category_suggestions` table created with proper schema
- [ ] RLS policies implemented (users can only see/create their own)
- [ ] Indexes added for performance
- [ ] Migration file created in `/supabase/migrations/`

### API
- [ ] `POST /api/category-suggestions` endpoint created
- [ ] Authentication required (reject unauthenticated requests)
- [ ] Input validation (10-500 characters, required field)
- [ ] Proper error handling and responses
- [ ] User can only submit their own suggestions

### Frontend
- [ ] "Search Professionals" button added to each category card
- [ ] "Search Tasks" button added to each category card
- [ ] "Can't find your category?" button with question-mark icon added
- [ ] All buttons properly linked with category parameters
- [ ] Suggestion modal with form (textarea, character counter, submit button)
- [ ] Authentication check before opening suggestion modal
- [ ] Loading states during submission
- [ ] Success/error toast notifications
- [ ] Buttons styled consistently with NextUI design system
- [ ] Mobile-responsive layout (buttons stack or adapt on small screens)
- [ ] All text translated in EN/BG/RU

## Technical Notes

### Database Table: `category_suggestions`
Create a new table to track category suggestions from users:

```sql
CREATE TABLE category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

-- Index for faster queries
CREATE INDEX idx_category_suggestions_user_id ON category_suggestions(user_id);
CREATE INDEX idx_category_suggestions_status ON category_suggestions(status);
CREATE INDEX idx_category_suggestions_created_at ON category_suggestions(created_at DESC);

-- RLS Policies
ALTER TABLE category_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
  ON category_suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can create suggestions"
  ON category_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all suggestions
-- @todo: Add admin role check when admin system is implemented
```

### API Endpoint: `POST /api/category-suggestions`

**Request Body:**
```typescript
{
  suggestion: string  // Required, 10-500 characters
}
```

**Response (Success):**
```typescript
{
  success: true,
  message: "Thank you! We'll review your suggestion within 24 hours.",
  suggestion: {
    id: string,
    suggestion_text: string,
    status: 'pending',
    created_at: string
  }
}
```

**Response (Error - Not Authenticated):**
```typescript
{
  error: "Authentication required to submit suggestions",
  code: "AUTH_REQUIRED"
}
```

**Authentication**: Required - only logged-in users can submit suggestions (prevents spam)

**Rate Limiting**: Consider limiting to 5 suggestions per user per day

### Frontend Implementation

- **Location**: Category cards in `/src/app/[lang]/categories/page.tsx`
- **URL Parameters**: Use `searchParams` or query string for category filtering
- **Translations**: Add new keys to `/src/lib/intl/[lang]/categories.ts`
  - `categories.searchProfessionals`: "Search Professionals"
  - `categories.searchTasks`: "Search Tasks"
  - `categories.cantFindCategory`: "Can't find your category?"
  - `categories.suggestCategoryTitle`: "Suggest New Category"
  - `categories.suggestCategoryMessage`: "Can't find your exact category? Send us a suggestion and we'll add it within 24 hours."
  - `categories.suggestCategoryPlaceholder`: "Describe the category you need... (e.g., 'Dog training', 'Solar panel installation')"
  - `categories.submitSuggestion`: "Submit Suggestion"
  - `categories.suggestionSuccess`: "Thank you! We'll review your suggestion within 24 hours."
  - `categories.suggestionError`: "Failed to submit suggestion. Please try again."
  - `categories.suggestionAuthRequired`: "Please log in to submit category suggestions"
  - `categories.suggestionMinLength`: "Suggestion must be at least 10 characters"
  - `categories.suggestionMaxLength`: "Suggestion must be at most 500 characters"
- **Category Parameter Format**: Consider URL-encoding subcategory arrays
- **Help Button**: Use NextUI Modal with form for suggestion submission
- **Suggestion Form**:
  - Textarea (10-500 characters)
  - Character counter
  - Submit button with loading state
  - Authentication check before opening modal
  - Success/error toast notifications

## Design Considerations
- Buttons should be prominent but not overwhelming
- Consider icon + text for better UX (e.g., Search icon, Briefcase icon)
- Question-mark button can be smaller, positioned in corner or as a subtle icon
- Maintain visual hierarchy: primary action (Search Professionals) more prominent

## Priority
Medium - Improves discoverability and reduces user friction in finding relevant content

## Estimated Time
**6-8 hours total**
- Database migration: 1 hour
- API endpoint implementation: 2 hours
- Frontend UI (buttons + modal): 2-3 hours
- Translations (3 languages): 1 hour
- Testing and polish: 1-2 hours

## Benefits
- **User Experience**: Easy navigation from categories to professionals/tasks
- **Data Collection**: Track user needs for future category expansion
- **Spam Prevention**: Authentication requirement prevents abuse
- **Analytics**: Learn which categories users are looking for but missing
- **Future Admin Panel**: Data ready for admin review dashboard
