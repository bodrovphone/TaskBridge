# Unified Profile Page

## Task Description
Consolidate the customer and professional profile pages into a single unified profile page. Currently users have to switch between tabs/pages which adds friction and confusion.

## Requirements
- Single profile page instead of separate customer/professional views
- All profile sections visible on one page
- Professional sections shown to everyone (encourage users to become professionals)
- Clean, logical ordering of sections
- Mobile-friendly layout

## Current State
- `/profile/customer` - Customer profile tab
- `/profile/professional` - Professional profile tab
- Users must switch between tabs to see different information

## Known Issues (caused by split profile pages)
- **Telegram toast redirect bug**: When clicking the Telegram connection toast, it always redirects to `/profile/customer` even if user was on professional page. This would be automatically fixed by having a single unified `/profile` page.

## Proposed Structure
1. **Profile Header** - Avatar, name, verification badges
2. **Personal Information** - Name, phone, location, language preferences
3. **Professional Identity** - Title, bio, experience (expandable if not filled)
4. **Service Categories** - Categories with auto-suggestion feature
5. **Services & Pricing** - Service items list
6. **Portfolio Gallery** - Work showcase images

## Acceptance Criteria
- [ ] Single unified profile page at `/profile`
- [ ] All sections visible without tab switching
- [ ] Professional sections encourage non-professionals to fill them
- [ ] Smooth scrolling between sections
- [ ] Mobile responsive layout
- [ ] Remove old tab-based navigation

## Technical Notes
- Reuse existing section components
- Consider collapsible sections for cleaner mobile UX
- Keep the profile completion banner logic

## Priority
Medium
