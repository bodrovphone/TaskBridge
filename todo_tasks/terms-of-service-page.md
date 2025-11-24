# Terms of Service Page

## Task Description
Create Terms of Service (Terms & Conditions) page for TaskBridge/Trudify by adapting an existing Bulgarian freelance platform's ToS document. As a small startup without legal resources, we'll use https://freelance.bg/legal-tos.html as our base template with modifications for our company.

## Pragmatic Startup Approach
1. **Small startup, limited resources** - No legal team available
2. **Use proven template** - Adapt existing ToS from freelance.bg (similar Bulgarian service)
3. **Customize company data** - Replace with Trudify/TaskBridge legal entity information
4. **Bulgarian-first** - Start with BG version only (primary market)
5. **Translations later** - EN/RU can be added when expanding to those markets

## Requirements
- Create page at `/[lang]/terms` route
- Start with **Bulgarian (BG) version only**
- Base content on https://freelance.bg/legal-tos.html
- Replace company legal data with Trudify information
- Include sections required by OAuth providers (Google/Facebook)
- Comply with Bulgarian law and EU regulations

## Acceptance Criteria
- [ ] Fetch and review freelance.bg ToS document (https://freelance.bg/legal-tos.html)
- [ ] Page created at `/app/[lang]/terms/page.tsx`
- [ ] ToS content adapted from freelance.bg template (Bulgarian only initially)
- [ ] Company legal data replaced with Trudify/TaskBridge information
- [ ] All required legal sections included (per freelance.bg structure)
- [ ] Contact information updated to Trudify details
- [ ] Last updated date displayed
- [ ] Mobile-responsive design
- [ ] Accessible via footer link
- [ ] Public URL available for OAuth app review submissions
- [ ] EN/RU translations can be added later when needed

## Source Template
**Base document**: https://freelance.bg/legal-tos.html

We'll adapt their structure and content, which is already proven for a Bulgarian freelance marketplace. The sections will follow their organization, with modifications for:
- Company name/branding (Trudify instead of Freelance.bg)
- Contact information (email, legal entity)
- Any Trudify-specific features or policies
- OAuth provider requirements (Google, Facebook)

**Note**: The freelance.bg ToS is already compliant with Bulgarian law and EU regulations, making it a safe template to build from.

## Technical Notes

### Route Structure
```
/app/[lang]/terms/
├── page.tsx           # Main terms of service page
└── layout.tsx         # Optional custom layout
```

### Translation Keys
**Phase 1 (MVP)**: Bulgarian only - store content directly in Bulgarian
- Create new `/src/lib/intl/bg/legal.ts` chunk with Bulgarian ToS content
- Use HTML/markdown for formatting long legal text
- Structure follows freelance.bg sections

**Phase 2 (Future)**: Add EN/RU translations when expanding markets
- Same structure in `/src/lib/intl/en/legal.ts` and `/src/lib/intl/ru/legal.ts`
- Professional translation recommended (not machine translation for legal docs)

### Component Structure
```typescript
export default async function TermsPage({
  params
}: {
  params: { lang: string }
}) {
  const t = await getTranslations(params.lang)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1>{t('terms.title')}</h1>
      <p>{t('terms.lastUpdated', { date: '2025-01-24' })}</p>

      {/* Sections */}
      <section>{t('terms.sections.acceptance.content')}</section>
      {/* ... etc */}
    </div>
  )
}
```

### SEO & Metadata
```typescript
export const metadata = {
  title: 'Terms of Service | Trudify',
  description: 'Read the terms and conditions for using Trudify freelance platform.',
  robots: 'index, follow' // Make it public for OAuth verification
}
```

## Design Considerations
- Clean, readable typography (same as Privacy Policy)
- Table of contents for easy navigation
- Anchor links to sections
- Important sections highlighted
- Print-friendly styles
- Downloadable PDF version (optional)

## OAuth Provider Requirements

### For Google Verification
- Must be publicly accessible (not behind login)
- Must define user agreements
- Must include company/developer contact info

### For Facebook App Review
- Must be publicly accessible
- Must explain platform rules and user conduct
- Must include dispute resolution

## Company Information Needed
To replace freelance.bg's company details with Trudify information:
- [ ] Legal entity name (company or individual registration)
- [ ] Registration number (if applicable)
- [ ] Physical address (if required by Bulgarian law)
- [ ] Contact email for legal inquiries
- [ ] VAT number (if applicable)

**Note**: If not yet registered as a legal entity, can use individual/sole proprietor details temporarily.

## Translation Strategy
**MVP Approach**:
- **Bulgarian only** - Primary market, legal compliance
- No EN/RU initially - Saves time and money
- Can add later when expanding to those markets

**When to add translations**:
- When expanding marketing to EN/RU markets
- When OAuth providers request in specific language
- Use professional legal translator (not machine translation)

## Bulgarian Law Considerations
- Freelance.bg template already complies with Bulgarian law
- Their ToS covers: Consumer Protection Act, e-commerce regulations, GDPR
- Using proven template reduces legal risk significantly
- Optional: Have Bulgarian lawyer review final version (but not critical for MVP)

## Priority
**High** - Required for Google/Facebook OAuth production approval and legal protection

## Dependencies
- Privacy Policy page (cross-reference)
- Company registration details (see "Company Information Needed" above)
- Contact email for legal inquiries

## Estimated Effort
- Fetch and review freelance.bg ToS: 30 mins
- Adapt content with Trudify details: 1-2 hours
- Implementation: 1 hour
- **Total: 2-3 hours** (much faster than writing from scratch!)

## Why This Approach Works
1. **Proven template** - freelance.bg is established, legally compliant service
2. **Time efficient** - Adapt existing vs writing from scratch
3. **Cost effective** - No lawyer fees for initial version
4. **Bulgarian compliance** - Template already follows local law
5. **OAuth ready** - Can submit for approval immediately
6. **Iterative** - Can refine/translate later as business grows
