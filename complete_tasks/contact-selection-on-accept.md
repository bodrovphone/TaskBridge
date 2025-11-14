# Contact Selection on Application Acceptance

## Task Description
Allow customers to choose which contact information to share with the professional when accepting their application. This gives users control over their privacy while ensuring professionals can reach them to complete the task.

## Problem
Currently, when accepting an application, the customer's contact information is automatically shared with the professional. Users may want to:
- Share only specific contact methods (e.g., phone but not email)
- Provide alternative contact details (e.g., work phone instead of personal)
- Add custom contact information (Viber, WhatsApp, Telegram handle)
- Include a custom message with their contact details

## Requirements

### Contact Selection Interface

**Location**: Accept Application Dialog (`/components/tasks/accept-application-dialog.tsx`)

**Add before the agreement checkboxes:**

```typescript
{/* Contact Information Section */}
<div className="space-y-4">
  <h4 className="font-semibold text-lg">{t('acceptApplication.contactInfo')}</h4>
  <p className="text-sm text-gray-600">
    {t('acceptApplication.contactInfoDescription', 'Select which contact information to share with {{name}}', { name: professional.name })}
  </p>

  {/* Contact Options from Profile */}
  {user.phone && (
    <Checkbox
      isSelected={contactInfo.sharePhone}
      onValueChange={(checked) => setContactInfo(prev => ({ ...prev, sharePhone: checked }))}
    >
      {t('acceptApplication.sharePhone')}: {maskPhoneNumber(user.phone)}
    </Checkbox>
  )}

  {user.email && (
    <Checkbox
      isSelected={contactInfo.shareEmail}
      onValueChange={(checked) => setContactInfo(prev => ({ ...prev, shareEmail: checked }))}
    >
      {t('acceptApplication.shareEmail')}: {maskEmail(user.email)}
    </Checkbox>
  )}

  {user.telegram_username && (
    <Checkbox
      isSelected={contactInfo.shareTelegram}
      onValueChange={(checked) => setContactInfo(prev => ({ ...prev, shareTelegram: checked }))}
    >
      {t('acceptApplication.shareTelegram')}: @{user.telegram_username}
    </Checkbox>
  )}

  {/* Custom Contact Field */}
  <div>
    <Checkbox
      isSelected={contactInfo.useCustom}
      onValueChange={(checked) => setContactInfo(prev => ({ ...prev, useCustom: checked }))}
    >
      {t('acceptApplication.addCustomContact', 'Add custom contact information')}
    </Checkbox>

    {contactInfo.useCustom && (
      <Textarea
        placeholder={t('acceptApplication.customContactPlaceholder', 'e.g., WhatsApp: +359 888 123 456, Viber: @username')}
        value={contactInfo.customContact}
        onValueChange={(value) => setContactInfo(prev => ({ ...prev, customContact: value }))}
        className="mt-2"
        minRows={2}
      />
    )}
  </div>

  {/* Validation Message */}
  {!hasSelectedContact && (
    <div className="text-sm text-red-600">
      {t('acceptApplication.contactRequired', 'Please select at least one contact method')}
    </div>
  )}
</div>
```

### State Management

```typescript
interface ContactInfo {
  sharePhone: boolean;
  shareEmail: boolean;
  shareTelegram: boolean;
  useCustom: boolean;
  customContact: string;
}

const [contactInfo, setContactInfo] = useState<ContactInfo>({
  sharePhone: !!user.phone,  // Default to true if available
  shareEmail: false,          // Default to false for privacy
  shareTelegram: false,
  useCustom: false,
  customContact: ''
});

// Validation
const hasSelectedContact =
  contactInfo.sharePhone ||
  contactInfo.shareEmail ||
  contactInfo.shareTelegram ||
  (contactInfo.useCustom && contactInfo.customContact.trim().length > 0);
```

### API Integration

**Update `/api/applications/[id]/accept` endpoint:**

```typescript
// Accept request body type
interface AcceptApplicationRequest {
  contactInfo: {
    sharePhone?: boolean;
    shareEmail?: boolean;
    shareTelegram?: boolean;
    customContact?: string;
  };
  message?: string;  // Optional message to professional
}

// In the accept handler:
const { contactInfo, message } = await request.json();

// Build contact information to share
const sharedContact = {
  phone: contactInfo.sharePhone ? customerUser.phone : null,
  email: contactInfo.shareEmail ? customerUser.email : null,
  telegram: contactInfo.shareTelegram ? customerUser.telegram_username : null,
  custom: contactInfo.customContact || null
};

// Send notification to professional with contact info
await sendTemplatedNotification(
  application.professional_id,
  'applicationAccepted',
  {
    taskTitle: task.title,
    customerName: customerUser.full_name,
    contactInfo: sharedContact,
    message: message || null,
    taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
  }
);
```

### Helper Functions

**Add to `/lib/utils/privacy.ts`:**

```typescript
/**
 * Mask phone number for preview
 * Example: +359 888 123 456 → +359 888 *** ***
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 6) return phone;

  const visible = cleaned.slice(0, -6);
  const masked = cleaned.slice(-6).replace(/\d/g, '*');

  return `${visible} ${masked.slice(0, 3)} ${masked.slice(3)}`;
}

/**
 * Mask email for preview
 * Example: john.doe@example.com → j***e@example.com
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;

  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}
```

## Acceptance Criteria

### UI/UX
- [ ] Contact selection checkboxes appear in Accept Application Dialog
- [ ] User's profile contacts are pre-populated and masked for preview
- [ ] Custom contact textarea appears when "Add custom contact" is checked
- [ ] At least one contact method must be selected before accepting
- [ ] Accept button is disabled if no contact method is selected
- [ ] Clear visual indication of which contacts will be shared

### API
- [ ] Accept endpoint accepts `contactInfo` and `message` in request body
- [ ] Only selected contact information is included in notification
- [ ] Custom contact text is sanitized and validated
- [ ] Error handling for invalid contact selections

### Notification
- [ ] Professional receives notification with customer's contact information
- [ ] Notification formats contact info clearly and professionally
- [ ] Custom contact information is included if provided
- [ ] Optional customer message is included at the top

### Translations
- [ ] All new strings translated to EN/BG/RU
- [ ] Clear explanations for each contact option
- [ ] Professional validation messages

## Technical Notes

### Privacy Considerations
1. **Mask preview**: Show masked versions of contact info in selection UI
2. **Default to minimal**: Only phone is checked by default
3. **Clear consent**: Explain that contact info will be shared with professional
4. **Custom validation**: Sanitize custom contact text for XSS/injection

### Database Schema
No database changes required - contact sharing is ephemeral (sent via notification only)

### Alternative Approaches

**Option 1: Simple (Current Plan)**
- Select from profile contacts
- Add custom contact field
- Send via notification

**Option 2: Store Contact Preferences**
- Add `default_contact_sharing` JSONB to users table
- Remember user's preferences for next time
- Quick "Use default" button

**Option 3: Contact Presets**
- Save multiple contact presets (e.g., "Work contacts", "Personal contacts")
- Quick select from dropdown
- More complex but better UX for frequent users

### Security & Validation

```typescript
// Sanitize custom contact input
function sanitizeContactInput(input: string): string {
  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, '');

  // Trim and limit length
  return withoutTags.trim().slice(0, 500);
}

// Validate at least one contact selected
function validateContactInfo(contactInfo: ContactInfo): boolean {
  const hasProfileContact =
    contactInfo.sharePhone ||
    contactInfo.shareEmail ||
    contactInfo.shareTelegram;

  const hasCustomContact =
    contactInfo.useCustom &&
    contactInfo.customContact.trim().length > 0;

  return hasProfileContact || hasCustomContact;
}
```

## Translations

### English (`/lib/intl/en/applications.ts`)

```typescript
'acceptApplication.contactInfo': 'Contact Information',
'acceptApplication.contactInfoDescription': 'Select which contact information to share with {{name}}',
'acceptApplication.sharePhone': 'Share phone number',
'acceptApplication.shareEmail': 'Share email address',
'acceptApplication.shareTelegram': 'Share Telegram',
'acceptApplication.addCustomContact': 'Add custom contact information',
'acceptApplication.customContactPlaceholder': 'e.g., WhatsApp: +359 888 123 456, Viber: @username, or any other way to reach you',
'acceptApplication.contactRequired': 'Please select at least one contact method',
```

### Bulgarian
```typescript
'acceptApplication.contactInfo': 'Контактна информация',
'acceptApplication.contactInfoDescription': 'Изберете каква информация да споделите с {{name}}',
'acceptApplication.sharePhone': 'Сподели телефонен номер',
'acceptApplication.shareEmail': 'Сподели имейл адрес',
'acceptApplication.shareTelegram': 'Сподели Telegram',
'acceptApplication.addCustomContact': 'Добави допълнителна информация',
'acceptApplication.customContactPlaceholder': 'например WhatsApp: +359 888 123 456, Viber: @потребител или друг начин за връзка',
'acceptApplication.contactRequired': 'Моля изберете поне един начин за контакт',
```

### Russian
```typescript
'acceptApplication.contactInfo': 'Контактная информация',
'acceptApplication.contactInfoDescription': 'Выберите, какой информацией поделиться с {{name}}',
'acceptApplication.sharePhone': 'Поделиться номером телефона',
'acceptApplication.shareEmail': 'Поделиться email',
'acceptApplication.shareTelegram': 'Поделиться Telegram',
'acceptApplication.addCustomContact': 'Добавить дополнительную информацию',
'acceptApplication.customContactPlaceholder': 'например WhatsApp: +359 888 123 456, Viber: @username или другой способ связи',
'acceptApplication.contactRequired': 'Пожалуйста, выберите хотя бы один способ связи',
```

## Priority

**Medium** - Improves privacy and user control, but not blocking for MVP

## Estimated Effort

- **UI Implementation**: 3 hours
- **API Integration**: 2 hours
- **Notification Updates**: 2 hours
- **Translations**: 1 hour
- **Testing**: 2 hours
- **Total**: ~10 hours (~1.5 days)

## Dependencies

- User profile must have contact fields populated
- Accept Application Dialog already implemented ✅
- Notification system with templates (from notification-triggers-implementation.md)

## Success Metrics

- [ ] 80%+ of customers customize their contact sharing
- [ ] <5% of acceptances have no contact info selected (validation working)
- [ ] Positive feedback from professionals on receiving clear contact info
- [ ] No privacy complaints about unwanted information sharing

## Related Files

### Files to Modify
- `/src/components/tasks/accept-application-dialog.tsx` - Add contact selection UI
- `/src/app/api/applications/[id]/accept/route.ts` - Accept contact info in request
- `/src/lib/intl/en/applications.ts` - Add translations (EN/BG/RU)

### Files to Create
- `/src/lib/utils/privacy.ts` - Phone/email masking helpers

## Notes

- **Privacy first**: Default to minimal information sharing
- **Clear preview**: Show exactly what will be shared
- **Flexibility**: Allow custom contact methods (Viber, WhatsApp very popular in Bulgaria)
- **Professional trust**: Emphasize that contact info is only shared with accepted professional
- **Future enhancement**: Save contact preferences for faster next time

---

**Status**: Ready for implementation
**Last Updated**: 2025-01-04
**Priority**: Medium - Nice privacy feature but not blocking MVP
