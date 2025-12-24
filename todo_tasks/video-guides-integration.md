# Video Guides Integration

## Task Description
Integrate YouTube Shorts guide videos into the website to help onboard customers and professionals.

## Video Assets

### For Customers (4 videos)
1. **Registration & First Task** - https://youtube.com/shorts/njXl_ARz610
   - How to register and publish first task

2. **Invite Professional** (optional feature) - https://youtube.com/shorts/KKSOJl-17hE
   - How to invite a specific professional to your task

3. **Review Applications** - https://youtube.com/shorts/TEt-4mU2Rds
   - How to review and accept applications on your task

4. **Leave Review** - https://youtube.com/shorts/E_IdaJ1Ehv8
   - How to leave a review after task completion

### For Professionals (2 videos)
1. **Getting Started** - https://youtube.com/shorts/CxX2YdOva60
   - Registration and profile setup

2. **Finding Work** - https://youtube.com/shorts/u5PXMrdE9OQ
   - Searching tasks, applying, notifications

## Implementation Chosen
Dedicated audience-specific pages: `/for-professionals` and `/for-customers`

## Technical Notes
- Use youtube-nocookie.com for privacy-enhanced embeds
- Shorts aspect ratio: 9:16 (vertical) - special styling with max-w-[220px] and aspect-[9/16]
- Videos embedded with proper title, allow attributes, and fullscreen support

## Acceptance Criteria
- [x] Decide on placement - Audience-specific pages
- [x] Create video embed component with proper styling for Shorts
- [x] Add videos to /for-professionals page (2 videos)
- [x] Create /for-customers page with 4 videos
- [x] Add translations (EN, BG, RU) for both pages
- [x] Add page metadata for /for-customers
- [x] Add links from /how-it-works to both pages
- [x] Mobile responsive design (grid stacks on mobile)

## Priority
Medium - Improves onboarding and reduces support questions

## Related
- Blog article already has 2 videos embedded (professional guides)

## Files Modified
- `/src/app/[lang]/for-professionals/page.tsx` - Added video guides section
- `/src/app/[lang]/for-customers/page.tsx` - Created new page with 4 videos
- `/src/app/[lang]/how-it-works/page.tsx` - Added links to both pages
- `/src/lib/intl/en/content-pages.ts` - Added translations
- `/src/lib/intl/bg/content-pages.ts` - Added translations
- `/src/lib/intl/ru/content-pages.ts` - Added translations
- `/src/lib/utils/metadata.ts` - Added for-customers metadata
