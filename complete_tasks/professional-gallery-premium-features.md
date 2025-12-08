# Professional Gallery & Premium Features

## Task Description
Implement a professional portfolio enhancement system with gallery, pricing, and external links. These premium features are available for free to early adopters (first 10 professionals per category) and require a Pro subscription for everyone else.

## Requirements

### 1. Professional Gallery (5-7 Photos)
- Allow professionals to upload 5-7 portfolio photos
- Each photo should have a description/caption field underneath
- Display in an attractive gallery format on the professional's profile
- Support image cropping/resizing on upload
- Store images in Supabase Storage (professional-portfolios bucket)

### 2. Service Pricing
- Allow professionals to list prices for their services
- Fields: Service name, Price (BGN), Price type (fixed/hourly/starting from)
- Support up to 10 service price entries
- Display pricing table on professional profile
- Optional: "Contact for quote" option for complex services

### 3. External Links
- Allow professionals to add external links:
  - Personal website URL
  - Facebook profile/page
  - Instagram profile
  - LinkedIn profile
  - YouTube channel
  - Custom link (label + URL)
- Display as clickable icons/buttons on profile
- Validate URLs before saving
- Max 6 external links

### 4. Monetization / Access Control
- **Early Adopter Access (Free)**:
  - First 10 registered professionals per category get these features free
  - If professional selects 2 categories: counted in both (first 20 total slots across categories)
  - Track registration order per category
  - Display "Early Adopter" badge on profile

- **Pro Subscription Required**:
  - All professionals after the first 10 per category need Pro subscription
  - Show upgrade prompt when trying to access these features
  - Pro subscription benefits displayed clearly
  - Placeholder for future Stripe integration

## Database Schema Changes

```sql
-- Professional portfolio images
CREATE TABLE professional_portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service pricing
CREATE TABLE professional_service_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  price DECIMAL(10,2),
  price_type TEXT CHECK (price_type IN ('fixed', 'hourly', 'starting_from', 'contact')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- External links
CREATE TABLE professional_external_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  link_type TEXT CHECK (link_type IN ('website', 'facebook', 'instagram', 'linkedin', 'youtube', 'custom')),
  url TEXT NOT NULL,
  label TEXT, -- For custom links
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Early adopter tracking
ALTER TABLE users ADD COLUMN category_registration_order JSONB DEFAULT '{}';
-- Format: {"handyman": 5, "plumber": 3} meaning 5th in handyman, 3rd in plumber

-- Pro subscription status
ALTER TABLE users ADD COLUMN is_pro_subscriber BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN pro_subscription_expires_at TIMESTAMPTZ;
```

## Acceptance Criteria

### Gallery
- [ ] Professional can upload up to 7 portfolio images
- [ ] Each image has an editable caption/description
- [ ] Images can be reordered via drag-and-drop
- [ ] Images can be deleted
- [ ] Gallery displays beautifully on profile page
- [ ] Images are optimized/compressed on upload

### Pricing
- [ ] Professional can add up to 10 service prices
- [ ] Each price has: name, amount, type (fixed/hourly/starting/contact)
- [ ] Prices display in a clean table format on profile
- [ ] Prices can be edited and deleted
- [ ] BGN currency formatting applied

### External Links
- [ ] Professional can add up to 6 external links
- [ ] Supported: Website, Facebook, Instagram, LinkedIn, YouTube, Custom
- [ ] Links display as icons on profile
- [ ] URL validation before saving
- [ ] Links open in new tab

### Access Control
- [ ] Track registration order per category
- [ ] First 10 per category get free access
- [ ] Multi-category professionals counted correctly
- [ ] Non-early-adopters see upgrade prompt
- [ ] "Early Adopter" badge displays on qualifying profiles
- [ ] Pro subscription check implemented (placeholder for Stripe)

### UI/UX
- [ ] Edit interface in professional settings/profile edit
- [ ] Clear visual distinction between free and premium features
- [ ] Smooth upgrade flow with clear value proposition
- [ ] Mobile-responsive gallery and pricing display

## Technical Notes

### Image Upload Flow
1. Use Supabase Storage bucket: `professional-portfolios`
2. Resize images to max 1200x1200 on client before upload
3. Generate unique filename: `{user_id}/{uuid}.{ext}`
4. Store URL in `professional_portfolio_images` table

### Early Adopter Logic
```typescript
// Check if professional qualifies for early adopter
function isEarlyAdopter(user: User): boolean {
  const registrationOrder = user.category_registration_order || {};
  const categories = user.professional_categories || [];

  // Check if any category registration is within first 10
  return categories.some(cat =>
    registrationOrder[cat] && registrationOrder[cat] <= 10
  );
}

// On category selection, assign order
async function assignCategoryOrder(userId: string, category: string) {
  const count = await db.count('users')
    .where('professional_categories', 'contains', category);

  await db.update('users', userId, {
    category_registration_order: {
      ...existing,
      [category]: count + 1
    }
  });
}
```

### Feature Access Check
```typescript
function canAccessPremiumFeatures(user: User): boolean {
  // Early adopters get free access
  if (isEarlyAdopter(user)) return true;

  // Pro subscribers get access
  if (user.is_pro_subscriber &&
      user.pro_subscription_expires_at > new Date()) {
    return true;
  }

  return false;
}
```

## UI Components to Create

1. `ProfessionalGalleryEditor` - Upload/manage portfolio images
2. `ProfessionalGalleryDisplay` - Public gallery view
3. `ServicePricingEditor` - Manage service prices
4. `ServicePricingDisplay` - Public pricing table
5. `ExternalLinksEditor` - Manage external links
6. `ExternalLinksDisplay` - Social/website icons
7. `EarlyAdopterBadge` - Badge component
8. `UpgradePrompt` - Pro subscription CTA
9. `PremiumFeatureGate` - Wrapper for access control

## Translation Keys Required

```typescript
// Add to professionals.ts
'professionals.gallery.title': 'Portfolio Gallery',
'professionals.gallery.addPhoto': 'Add Photo',
'professionals.gallery.caption': 'Caption',
'professionals.gallery.maxPhotos': 'Maximum 7 photos',

'professionals.pricing.title': 'Service Pricing',
'professionals.pricing.serviceName': 'Service',
'professionals.pricing.price': 'Price',
'professionals.pricing.priceType.fixed': 'Fixed Price',
'professionals.pricing.priceType.hourly': 'Per Hour',
'professionals.pricing.priceType.startingFrom': 'Starting From',
'professionals.pricing.priceType.contact': 'Contact for Quote',

'professionals.links.title': 'Connect',
'professionals.links.website': 'Website',
'professionals.links.addLink': 'Add Link',

'professionals.earlyAdopter.badge': 'Early Adopter',
'professionals.earlyAdopter.description': 'One of the first 10 professionals in this category',

'professionals.pro.upgrade': 'Upgrade to Pro',
'professionals.pro.unlockFeatures': 'Unlock gallery, pricing, and external links',
'professionals.pro.benefits': 'Pro Benefits',
```

## Priority
High - Key monetization feature and strong user demand

## Future Considerations
- Stripe integration for Pro subscriptions
- Analytics on gallery views and link clicks
- Featured professional placement for Pro users
- Video portfolio support
- Reviews showcase section
