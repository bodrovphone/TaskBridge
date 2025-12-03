# Branded 404 Page

## Task Description
Create a custom branded 404 page to replace the default Next.js 404 page. Should match Trudify's visual identity and provide helpful navigation options.

## Requirements
- Match Trudify brand colors and styling
- Display friendly error message in user's locale (EN/BG/RU)
- Provide navigation options (home, browse tasks, create task)
- Include Trudify logo
- Mobile responsive

## Acceptance Criteria
- [ ] Custom 404 page at `/app/not-found.tsx`
- [ ] Branded with Trudify colors and logo
- [ ] i18n support for error message and buttons
- [ ] Links to key pages (home, browse-tasks, create-task)
- [ ] Responsive design for mobile/desktop

## Technical Notes
- Use Next.js App Router `not-found.tsx` convention
- May need `[lang]/not-found.tsx` for locale support
- Use NextUI components for consistency

## Priority
Low
