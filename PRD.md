# Balkan Freelance Platform - Product Requirements Document

## 1. Executive Summary

### Product Vision

A comprehensive regional task platform connecting people in the Balkans with verified local service providers for any kind of task - from home repairs and delivery services to pet care, childcare, elderly assistance, and personal errands.

### Target Markets

- Primary: Bulgaria, Romania, Serbia, North Macedonia
- Secondary: Greece (future expansion)

### Product Goals

- Create a trusted marketplace for home services in the Balkan region
- Minimize fraud through verification systems
- Provide localized experience with regional payment methods and languages
- Build community trust through comprehensive rating systems

## 2. Product Overview

### Core Value Proposition

**For Task Posters (Customers):**

- Easy task posting for ANY kind of service need
- Access to verified local service providers
- Transparent pricing and deadline management
- Protection through rating/review system

**For Service Providers:**

- Access to diverse local job opportunities across multiple categories
- Verified credential system builds trust
- Direct communication with customers
- Fair rating system for reputation building

### Target Users

- **Primary:** Anyone needing tasks completed (home services, deliveries, personal assistance)
- **Secondary:** Busy professionals, elderly individuals, families with children
- **Service Providers:** Verified individuals offering services across categories:
  - **Home & Repair:** Electricians, plumbers, handymen, cleaners
  - **Delivery & Transport:** Couriers, drivers, movers
  - **Personal Care:** Pet sitters, dog walkers, babysitters, elderly companions
  - **Personal Assistant:** Errand runners, shopping assistants, administrative help
  - **Other Services:** Tutors, fitness trainers, event helpers

## 3. Feature Requirements

### 3.1 User Registration & Authentication

#### Customer Registration

- Email/phone number registration
- Basic profile information (name, location)
- Optional profile photo
- Email/SMS verification

#### Professional Registration

- All customer registration fields
- **Optional business verification:**
  - Bulgarian VAT number (ЕИК/БУЛСТАТ) verification via public API (optional but provides verified badge)
- Phone number verification (mandatory)
- Service categories selection

### 3.2 Task Management System

#### Task Creation (Customers)

- Task title and detailed description
- Category selection:
  - **Home & Repair:** Electrical, plumbing, cleaning, maintenance, moving
  - **Delivery & Transport:** Package delivery, grocery shopping, pickup/dropoff
  - **Personal Care:** Pet sitting, dog walking, babysitting, elderly care
  - **Personal Assistant:** Errands, administrative tasks, event assistance
  - **Learning & Fitness:** Tutoring, personal training, lessons
  - **Other:** Custom category option
- Photo upload (multiple images supported)
- Budget setting (approximate range or fixed amount)
- Location specification:
  - City level (public)
  - Neighborhood (visible to applied service providers)
  - Exact address (shared after service provider selection)
- Deadline setting (optional)
  - Auto-expiration when deadline passes
- Task urgency level (same day, within week, flexible)
- Special requirements or notes

#### Task Discovery (Professionals)

- Browse tasks by:
  - Location (city/region)
  - Category
  - Budget range
  - Deadline proximity
- Search and filter functionality
- Task application system

### 3.3 Application & Contact System

#### Professional Applications

- Apply to tasks with:
  - Proposed timeline
  - Final price quote
  - Brief message to customer
  - Portfolio images (optional)
- Application status tracking

#### Contact Exchange

- After customer selects a service provider, contact information is exchanged:
  - Phone numbers revealed to both parties
  - Email addresses shared
- Platform sends notification with contact details
- All further communication happens directly between parties

### 3.4 Rating & Review System

#### Bidirectional Reviews

- Customers rate professionals on:
  - Quality of work (1-5 stars)
  - Timeliness (1-5 stars)
  - Communication (1-5 stars)
  - Overall satisfaction (1-5 stars)
  - Written review (optional)
- Professionals rate customers on:
  - Clear task description (1-5 stars)
  - Payment promptness (1-5 stars)
  - Communication (1-5 stars)
  - Overall experience (1-5 stars)
  - Written review (optional)

#### Review Management

- Reviews published after task completion
- Both parties must submit reviews to see each other’s
- 30-day review window
- Review authenticity verification

### 3.5 Anti-Fraud Measures (MVP)

#### Professional Verification

- Optional VAT number verification for verified badge
- Phone number verification
- Basic profile completeness check
- User reporting system for problematic behavior

#### Task Authenticity

- Photo requirement for task posts
- Location verification
- Suspicious activity detection (multiple similar posts, etc.)
- User reporting system

## 4. Technical Requirements

### 4.1 Platform Architecture

- **Frontend:** Next.js (React-based framework)
- **Backend:** Next.js API routes
- **Database:** MongoDB
- **Deployment:** Vercel (recommended for Next.js) or self-hosted
- **File Storage:** MongoDB GridFS or cloud storage for images

### 4.2 Core Technologies

- **Framework:** Next.js 14+ (App Router)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js or custom JWT implementation
- **Styling:** Tailwind CSS or styled-components
- **Image handling:** Next.js Image optimization
- **Forms:** React Hook Form with validation

### 4.3 Integration Requirements

- Bulgarian VAT number verification API
- SMS gateway for local providers
- Email service provider
- Map services (Google Maps/OpenStreetMap)
- **Payment gateway integration**

### 4.4 Localization

- Multi-language support:
  - Bulgarian (primary)
  - Romanian
  - Serbian
  - Macedonian
  - Greek (future)
- Regional phone number formats
- Local currency display
- Cultural considerations in UX/UI

## 5. User Experience Requirements

### 5.1 Design Principles

- **Minimal but attractive design**
- Clean, modern interface
- Intuitive navigation
- Mobile-responsive
- Fast loading times
- Accessibility compliance (WCAG 2.1 AA)

### 5.2 Key User Flows

#### Customer Journey

1. Register → Create Task → Receive Applications → Select Service Provider → Get Contact Details → Communicate Directly → Rate & Review

#### Service Provider Journey

1. Register → Browse Tasks → Apply → Get Selected → Receive Customer Contact → Complete Work → Receive Rating

### 5.3 Performance Requirements

- Page load time < 3 seconds
- Mobile responsiveness across devices
- 99.5% uptime target
- Support for slow internet connections

## 6. MVP Feature Prioritization

### Must Have (MVP v1.0)

- User registration (both types)
- Optional VAT verification system
- Task posting and browsing
- Application system
- Contact exchange system
- Rating/review system
- Search and filters
- Photo upload

### Should Have (v1.1)

- Advanced search filters
- Email notification system
- Service provider portfolios
- Task categories expansion
- Multiple language support

### Could Have (v2.0)

- Mobile apps (iOS/Android)
- In-app messaging system
- Video calls integration
- Advanced analytics
- Premium service provider features

### Won’t Have (Initial Release)

- Payment processing
- In-app messaging
- Video/audio calls
- Complex verification processes
- Document uploads

## 7. Business Requirements

### 7.1 Monetization Strategy (Future)

- Commission-based model (post-MVP)
- Premium service provider listings
- Featured task placements
- Advertisement revenue

### 7.2 Success Metrics

- User acquisition rate
- Task completion rate
- User retention (30/60/90 days)
- Average task value
- Professional verification success rate
- Customer satisfaction scores

### 7.3 Legal & Compliance

- GDPR compliance
- Local data protection laws
- Terms of service and privacy policy
- Dispute resolution framework
- Professional licensing compliance per country

## 8. Risk Assessment

### High Risk

- Professional verification fraud
- Cross-border payment complexity
- Regulatory differences between countries

### Medium Risk

- User adoption in competitive market
- Language localization accuracy
- Platform scalability

### Low Risk

- Technical implementation
- Basic feature development

## 9. Launch Strategy

### Phase 1: Bulgaria (Months 1-3)

- MVP development and testing
- Bulgarian VAT verification integration
- Local marketing and professional recruitment

### Phase 2: Regional Expansion (Months 4-6)

- Romania and Serbia market entry
- Multi-language implementation
- Cross-border operational framework

### Phase 3: Full Balkan Coverage (Months 7-12)

- North Macedonia and Greece expansion
- Advanced features rollout
- Payment system integration

## 10. Next Steps

1. **Technical Architecture Planning** - Define detailed technical specifications
1. **Design System Creation** - Develop UI/UX wireframes and design system
1. **Legal Framework Setup** - Establish terms, privacy policies, and regional compliance
1. **API Integration Research** - Verify availability and terms for VAT number verification APIs
1. **Team Assembly** - Identify development, design, and business development resources
1. **Market Research** - Conduct competitive analysis and user interviews in target markets

-----

**Document Version:** 1.0  
**Last Updated:** June 23, 2025  
**Next Review:** July 15, 2025