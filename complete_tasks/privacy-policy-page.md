# Privacy Policy Page

## Task Description
Create a comprehensive Privacy Policy page for TaskBridge/Trudify that complies with GDPR, explains data collection practices, and is required for Google/Facebook OAuth verification.

## Requirements
- Create page at `/[lang]/privacy` route
- Full i18n support (EN/BG/RU)
- Comply with GDPR and Bulgarian data protection laws
- Explain all data collection and usage clearly
- Include sections required by OAuth providers

## Acceptance Criteria
- [ ] Page created at `/app/[lang]/privacy/page.tsx`
- [ ] Privacy policy content written in all three languages (EN/BG/RU)
- [ ] All required GDPR sections included
- [ ] OAuth data usage explained (Google, Facebook, Telegram)
- [ ] Contact information for data privacy inquiries
- [ ] Last updated date displayed
- [ ] Mobile-responsive design
- [ ] Accessible via footer link
- [ ] Public URL available for OAuth app review submissions

## Required Sections

### 1. Introduction
- Who we are (TaskBridge/Trudify)
- Purpose of privacy policy
- Scope and applicability

### 2. Data Collection
- **Personal Information**:
  - Name, email, phone number
  - Profile photos
  - Location (city/neighborhood)
  - VAT number (for professionals)
- **OAuth Data**:
  - Google: Email, name, profile photo
  - Facebook: Email, name, profile photo
  - Telegram: ID, username, first/last name, photo
- **Usage Data**:
  - Tasks created, applications submitted
  - Messages and communications
  - Reviews and ratings
  - Browser and device information

### 3. How We Use Data
- Facilitate task matching between customers and professionals
- Send notifications (email, SMS, Telegram, in-app)
- Process payments and billing
- Verify professional credentials
- Improve service quality
- Comply with legal obligations

### 4. Data Sharing
- **We share with**:
  - Other users (public profiles, task details)
  - Payment processors
  - Communication providers (SendGrid, Telegram)
  - Legal authorities (when required)
- **We DO NOT sell** personal data to third parties

### 5. Data Storage & Security
- Hosted on Supabase (PostgreSQL database)
- Row Level Security (RLS) policies
- Encrypted connections (HTTPS/TLS)
- Regular security audits
- Data retention policies

### 6. User Rights (GDPR)
- Right to access your data
- Right to correct inaccurate data
- Right to delete your account
- Right to data portability
- Right to withdraw consent
- How to exercise these rights

### 7. Cookies & Tracking
- Authentication cookies (Supabase)
- Locale preference cookies
- No third-party advertising cookies
- Analytics (if implemented)

### 8. Third-Party Services
- **Supabase** (database and authentication)
- **SendGrid** (email notifications)
- **Telegram** (bot notifications)
- **Google OAuth** (optional login)
- **Facebook OAuth** (optional login)
- Links to their privacy policies

### 9. Children's Privacy
- Service not intended for users under 18
- Compliance with COPPA (if applicable)

### 10. International Data Transfers
- Data stored in EU (Supabase EU region)
- GDPR-compliant data transfers

### 11. Changes to Privacy Policy
- How users will be notified of changes
- Last updated date

### 12. Contact Information
- Email for privacy inquiries
- Data Protection Officer (if applicable)
- Physical address (if required by law)

## Technical Notes

### Route Structure
```
/app/[lang]/privacy/
├── page.tsx           # Main privacy policy page
└── layout.tsx         # Optional custom layout
```

### Translation Keys
Add to `/src/lib/intl/[lang]/common.ts` or create new `legal.ts` chunk:
```typescript
privacy: {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: {{date}}',
  intro: 'Introduction text...',
  sections: {
    dataCollection: { title: '...', content: '...' },
    dataUsage: { title: '...', content: '...' },
    // ... etc
  }
}
```

### Component Structure
```typescript
export default async function PrivacyPage({
  params
}: {
  params: { lang: string }
}) {
  const t = await getTranslations(params.lang)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1>{t('privacy.title')}</h1>
      <p>{t('privacy.lastUpdated', { date: '2025-01-24' })}</p>

      {/* Sections */}
      <section>{t('privacy.sections.dataCollection.content')}</section>
      {/* ... etc */}
    </div>
  )
}
```

### SEO & Metadata
```typescript
export const metadata = {
  title: 'Privacy Policy | Trudify',
  description: 'Learn how Trudify collects, uses, and protects your personal data.',
  robots: 'index, follow' // Make it public for OAuth verification
}
```

## Design Considerations
- Clean, readable typography
- Table of contents for easy navigation
- Anchor links to sections
- Print-friendly styles
- Downloadable PDF version (optional)

## OAuth Provider Requirements

### For Google Verification
- Must be publicly accessible (not behind login)
- Must explain Google OAuth data usage
- Must include contact email

### For Facebook App Review
- Must be publicly accessible
- Must explain Facebook Login data usage
- Must include company/developer contact info

## Priority
**High** - Required for Google/Facebook OAuth production approval and GDPR compliance

## Dependencies
- Terms of Service page (similar structure)
- Contact email/form for privacy inquiries
- Legal review (recommended before publishing)

## Estimated Effort
- Content writing: 3-4 hours (with translations)
- Implementation: 1-2 hours
- Legal review: 1-2 days (external)
- Total: 1-2 days
