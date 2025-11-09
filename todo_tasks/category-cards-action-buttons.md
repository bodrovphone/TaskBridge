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
- [ ] "Search Professionals" button added to each category card
- [ ] "Search Tasks" button added to each category card
- [ ] Help button with question-mark icon added
- [ ] All buttons properly linked with category parameters
- [ ] Buttons styled consistently with NextUI design system
- [ ] Mobile-responsive layout (buttons stack or adapt on small screens)
- [ ] Category suggestion submission mechanism implemented (form/email/etc.)
- [ ] All button text translated in EN/BG/RU

## Technical Notes
- **Location**: Category cards are likely in `/src/app/[lang]/categories/` or components
- **URL Parameters**: Use `searchParams` or query string for category filtering
- **Translations**: Add new keys to `/src/lib/intl/[lang]/categories.ts`
  - `categories.searchProfessionals`: "Search Professionals"
  - `categories.searchTasks`: "Search Tasks"
  - `categories.cantFindCategory`: "Can't find your category?"
  - `categories.suggestCategoryMessage`: "Can't find your exact category? Send us a suggestion and we will add it within 24 hours for you."
  - `categories.submitSuggestion`: "Submit Suggestion"
- **Category Parameter Format**: Consider URL-encoding subcategory arrays
- **Help Button**: Can use NextUI Tooltip or Modal for the message
- **Suggestion Form**: Could be a simple modal with textarea and submit button that sends to API endpoint

## Design Considerations
- Buttons should be prominent but not overwhelming
- Consider icon + text for better UX (e.g., Search icon, Briefcase icon)
- Question-mark button can be smaller, positioned in corner or as a subtle icon
- Maintain visual hierarchy: primary action (Search Professionals) more prominent

## Priority
Medium - Improves discoverability and reduces user friction in finding relevant content
