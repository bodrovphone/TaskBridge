# Content Pages Improvements & Internal Linking

## Task Description
Improve content pages based on user feedback and add proper internal linking from footer and homepage to content pages.

## Status
**Priority**: Medium (Post-Launch)
**Blocking Release**: No

## Requirements

### 1. Footer Links
Add links to content pages in the footer:

- [ ] About (`/about`)
- [ ] How It Works (`/how-it-works`)
- [ ] FAQ (`/faq`)
- [ ] For Professionals (`/for-professionals`)
- [ ] Testimonials (`/testimonials`)

Suggested footer structure:
```
Company          |  Resources         |  Legal
----------------|--------------------|---------
About           |  How It Works      |  Privacy
For Professionals|  FAQ              |  Terms
Testimonials    |  Help/Support      |
```

### 2. Homepage Links
Add strategic links on landing page to content pages:

- [ ] "How It Works" link/button in hero section or below
- [ ] "For Professionals" link in section targeting professionals
- [ ] "Testimonials" social proof link (or embed testimonials section)
- [ ] "FAQ" link where appropriate (maybe near CTA)

### 3. Content Improvements (Post-Launch)
Based on user feedback and analytics:

- [ ] Refine copy/messaging on About page
- [ ] Improve How It Works clarity
- [ ] Add real testimonials (replace placeholders)
- [ ] Add images/illustrations to content pages
- [ ] Adjust CTAs based on conversion data
- [ ] A/B test different headlines

## Technical Notes

### Files to Update
- `src/components/common/footer.tsx` - Add content page links
- `src/app/[lang]/page.tsx` or landing components - Add homepage links
- Translation files if new link text needed

### SEO Benefit
Internal linking improves:
- User navigation and discovery
- Page authority distribution
- Crawlability for search engines

## Acceptance Criteria
- [ ] Footer includes links to all content pages
- [ ] Homepage links to relevant content pages
- [ ] Links work in all 4 languages (EN/BG/RU/UA)
- [ ] Mobile footer is properly organized
