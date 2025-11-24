# Terms of Service Page

## Task Description
Create comprehensive Terms of Service (Terms & Conditions) page for TaskBridge/Trudify that defines user agreements, liabilities, and is required for Google/Facebook OAuth verification.

## Requirements
- Create page at `/[lang]/terms` route
- Full i18n support (EN/BG/RU)
- Comply with Bulgarian law and EU regulations
- Define clear user agreements and platform rules
- Include sections required by OAuth providers

## Acceptance Criteria
- [ ] Page created at `/app/[lang]/terms/page.tsx`
- [ ] Terms of service content written in all three languages (EN/BG/RU)
- [ ] All required legal sections included
- [ ] User rights and responsibilities clearly defined
- [ ] Dispute resolution process explained
- [ ] Contact information provided
- [ ] Last updated date displayed
- [ ] Mobile-responsive design
- [ ] Accessible via footer link
- [ ] Public URL available for OAuth app review submissions

## Required Sections

### 1. Introduction & Acceptance
- What is TaskBridge/Trudify
- Agreement to terms by using the service
- Who can use the service (age requirement: 18+)
- Jurisdiction (Bulgaria, EU)

### 2. User Accounts
- Registration requirements
- Account security responsibilities
- Username and password rules
- Account termination rights (user and platform)
- Verification requirements (email, phone, VAT for professionals)

### 3. User Roles & Responsibilities

#### For Customers:
- Create accurate task descriptions
- Provide truthful requirements and budgets
- Respond to applications promptly
- Pay agreed amounts on time
- Review professionals honestly

#### For Professionals:
- Provide accurate skills and qualifications
- Submit honest applications
- Complete work as agreed
- Maintain professional conduct
- Verify credentials if required (VAT, licenses)

### 4. Platform Rules & Prohibited Conduct
- No fraudulent activity
- No harassment or abuse
- No spam or solicitation
- No illegal services
- No circumventing platform fees
- No fake reviews
- Content ownership and licensing

### 5. Task Creation & Applications
- Task posting rules
- Application submission process
- Task acceptance and completion
- Cancellation policies
- Refund policies

### 6. Payments & Fees
- Payment processing (future feature)
- Platform fees structure
- Refund conditions
- Payment disputes
- Tax responsibilities (users are responsible for their own taxes)

### 7. Reviews & Ratings
- Review system rules
- Honest feedback requirements
- Review disputes
- Removal of inappropriate reviews

### 8. Intellectual Property
- User-generated content ownership
- Platform content ownership (Trudify brand, logo, etc.)
- License grants (users grant us license to display their content)
- Copyright infringement reporting (DMCA)

### 9. Privacy & Data
- Reference to Privacy Policy
- How user data is used
- OAuth provider integrations
- Communication preferences

### 10. Platform Availability & Changes
- Service provided "as is"
- Right to modify or discontinue service
- Scheduled maintenance
- No guarantee of uptime

### 11. Disclaimers & Limitations of Liability
- **We are a platform, not a party to contracts between users**
- No liability for user conduct or services performed
- No warranty of service quality
- Limitation of damages
- Indemnification (users agree to defend us against claims)

### 12. Dispute Resolution
- Between users (encouraged to resolve directly)
- With platform (contact support first)
- Arbitration clause (if applicable)
- Governing law (Bulgarian law)
- Jurisdiction (Bulgarian courts)

### 13. Safety & Reporting
- How to report violations
- Content moderation policies
- Safety tips for users
- Background checks (if implemented)

### 14. Third-Party Services
- Links to external websites
- OAuth providers (Google, Facebook)
- No responsibility for third-party conduct

### 15. Termination
- Right to suspend or terminate accounts
- Violations that lead to termination
- Effects of termination (data retention)
- User's right to delete account

### 16. Changes to Terms
- How users will be notified of changes
- Continued use constitutes acceptance
- Last updated date

### 17. Contact & Legal Information
- Company name and registration
- Physical address (if required)
- Email for legal inquiries
- Support contact information

## Technical Notes

### Route Structure
```
/app/[lang]/terms/
├── page.tsx           # Main terms of service page
└── layout.tsx         # Optional custom layout
```

### Translation Keys
Add to `/src/lib/intl/[lang]/common.ts` or create new `legal.ts` chunk:
```typescript
terms: {
  title: 'Terms of Service',
  lastUpdated: 'Last updated: {{date}}',
  intro: 'Introduction text...',
  sections: {
    acceptance: { title: '...', content: '...' },
    accounts: { title: '...', content: '...' },
    // ... etc
  }
}
```

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

## Bulgarian Law Considerations
- Comply with Bulgarian Consumer Protection Act
- E-commerce regulations (if payments implemented)
- Distance selling rules
- Right of withdrawal (if applicable)
- Consider consulting Bulgarian lawyer for review

## Priority
**High** - Required for Google/Facebook OAuth production approval and legal protection

## Dependencies
- Privacy Policy page (cross-reference)
- Contact email/form for legal inquiries
- Legal review (STRONGLY recommended before publishing)
- Company registration details (if applicable)

## Estimated Effort
- Content writing: 4-5 hours (with translations)
- Implementation: 1-2 hours
- Legal review: 2-3 days (external, RECOMMENDED)
- Total: 2-3 days

## Important Note
**This is a legal document** - consider hiring a Bulgarian lawyer to review before publishing, especially for:
- Liability disclaimers
- Dispute resolution clauses
- Payment terms (when implemented)
- Compliance with Bulgarian/EU law
