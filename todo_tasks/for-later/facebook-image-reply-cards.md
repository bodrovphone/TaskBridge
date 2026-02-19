# Facebook Image Reply Cards for Lead Generation

## Task Description
Create a set of branded image reply cards to use when commenting on Facebook group posts. Images bypass Facebook's link-based spam filters that auto-flag comments from business pages or comments containing URLs.

## Problem
When commenting on Facebook group posts (leads looking for professionals or professionals offering services), comments with links get flagged as "awaiting admin approval" and never get published. This blocks our lead generation workflow. Image-based replies with the URL embedded as text (not a clickable link) avoid this filtering.

## Requirements
- Design 3-5 branded card templates in BG (primary), RU, and EN variants
- Two card types:
  - **"Find a Professional"** - for posts where someone is seeking help
  - **"Get More Clients"** - for posts where professionals are offering services
- Each card should include:
  - Trudify logo/branding
  - Short value proposition (1-2 lines)
  - The registration URL as visible text (not a clickable link)
  - Optional: QR code pointing to the appropriate deep registration link
- Multiple visual variants per type to avoid Facebook's repetitive content detection
- Cards should feel helpful, not spammy

## Acceptance Criteria
- [ ] 3+ "Find a Professional" card designs (BG language minimum)
- [ ] 3+ "Get More Clients" card designs (BG language minimum)
- [ ] RU and EN variants for each design
- [ ] QR codes generated for common deep links (customer intent, professional intent)
- [ ] Cards optimized for Facebook comment image dimensions
- [ ] Visual style consistent with Trudify branding (Primary: #0066CC, Secondary: #00A86B)
- [ ] Dia browser skill `/trudify-comment` updated to suggest which card to use

## Technical Notes

### Deep Link Format (for QR codes and visible URLs)
- Customer: `trudify.com/bg/register?intent=customer`
- Professional: `trudify.com/bg/register?intent=professional`
- With city: append `&city=sofia` (slugs: sofia, plovdiv, varna, burgas, ruse, stara-zagora, pleven, sliven)

### Card Content Ideas

**"Find a Professional" (BG):**
- "Търсите майстор? Trudify.com - проверени професионалисти, безплатна регистрация"
- "Намерете точния специалист за минути на Trudify.com"

**"Get More Clients" (BG):**
- "Искате повече клиенти? Регистрирайте се безплатно на Trudify.com"
- "Trudify.com - платформата за професионалисти в България"

### Implementation Options
1. **Canva templates** - Quick to create and iterate, easy for non-designers
2. **Figma components** - More polished, reusable design system
3. **Script-generated** - Auto-generate cards with different QR codes per city/category using a Node script (e.g., using `canvas` or `sharp` + `qrcode` packages)

### Workflow Integration
- Store final images in a shared folder (Google Drive / Notion)
- Update Dia `/trudify-comment` skill to reference which image to attach
- Rotate images to avoid repetitive content flagging

## Priority
Medium

## Estimated Effort
Medium - Design work + localization + QR code generation
