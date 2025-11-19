# SendGrid Notification Templates - Email Fallback System

## ⚠️ BLOCKER - Must Complete First!

**Before starting this task, you MUST improve the base email template:**

### Required Template Improvements:
1. **Production-Ready Logo**
   - Replace "Trudify" text logo with actual brand logo image
   - Add proper logo sizing and responsive design
   - Ensure logo looks good on all email clients

2. **Professional Styling**
   - Refine colors, spacing, typography
   - Add email-safe CSS (tested across Gmail, Outlook, Apple Mail)
   - Improve mobile responsiveness
   - Add proper email padding and margins

3. **Brand Consistency**
   - Match website design language
   - Use consistent color palette (#0066CC primary, etc.)
   - Professional footer with social links (optional)

**✋ STOP: When you're asked to start this task, remind the user to complete template improvements first!**

---

## Task Overview

Create SendGrid email templates for all notification types as fallback when user:
- ✅ Has verified email (`is_email_verified = true`)
- ❌ Does NOT have Telegram connected (`telegram_id IS NULL`)

**Notification Delivery Priority:**
1. **Telegram** (if user has `telegram_id`) - Free, instant
2. **Email** (if `is_email_verified = true` AND no Telegram) - SendGrid free tier
3. **No notification** (if neither verified email nor Telegram)

---

## Notification Templates to Create (9 Total)

All templates will reuse the **base branded template** with dynamic content areas.

### 1. Application Received
**Trigger:** Professional applies to customer's task
**Audience:** Customer (task owner)
**Subject:** `{{customer_name}}, you have a new application! 🎉`

**Content:**
```
Heading: New Application Received!
Message: {{professional_name}} has applied to your task "{{task_title}}"

CTA Button: View Application
Button Link: {{application_link}}

Secondary text: Check their profile, reviews, and offer details.
```

**Variables:**
- `customer_name`
- `professional_name`
- `task_title`
- `application_link`
- `subject` (translated)
- `heading` (translated)
- `message` (translated)
- `button_text` (translated)

---

### 2. Application Accepted
**Trigger:** Customer accepts professional's application
**Audience:** Professional
**Subject:** `🎉 Your application was accepted!`

**Content:**
```
Heading: Congratulations! Application Accepted
Message: Your application for "{{task_title}}" has been accepted!

CTA Button: View Task Details
Button Link: {{task_link}}

Secondary text: Get started on the task and communicate with the customer.
```

**Variables:**
- `professional_name`
- `task_title`
- `task_link`
- + all translation variables

---

### 3. Application Rejected
**Trigger:** Customer rejects professional's application
**Audience:** Professional
**Subject:** `Application Update for "{{task_title}}"`

**Content:**
```
Heading: Application Not Accepted
Message: Your application for "{{task_title}}" was not accepted this time.

CTA Button: Browse Other Tasks
Button Link: {{browse_tasks_link}}

Secondary text: Don't worry! Keep applying to other opportunities.
```

**Variables:**
- `professional_name`
- `task_title`
- `browse_tasks_link`
- + all translation variables

---

### 4. Message Received
**Trigger:** User receives a message about a task
**Audience:** Customer or Professional
**Subject:** `💬 New message from {{sender_name}}`

**Content:**
```
Heading: You Have a New Message
Message: {{sender_name}} sent you a message about "{{task_title}}"

Message Preview: "{{message_preview}}" (first 100 chars)

CTA Button: View Message
Button Link: {{message_link}}

Secondary text: Respond quickly to maintain good communication.
```

**Variables:**
- `recipient_name`
- `sender_name`
- `task_title`
- `message_preview`
- `message_link`
- + all translation variables

---

### 5. Task Completed
**Trigger:** Task is marked as complete
**Audience:** Customer and Professional
**Subject:** `✅ Task completed: "{{task_title}}"`

**Content:**
```
Heading: Task Completed Successfully!
Message: The task "{{task_title}}" has been marked as complete.

CTA Button: Leave a Review
Button Link: {{review_link}}

Secondary text: Please rate your experience and help build trust in the community.
```

**Variables:**
- `user_name`
- `task_title`
- `review_link`
- `other_party_name` (customer or professional)
- + all translation variables

---

### 6. Payment Received
**Trigger:** Professional receives payment
**Audience:** Professional
**Subject:** `💰 Payment received for "{{task_title}}"`

**Content:**
```
Heading: Payment Received!
Message: You received {{amount}} BGN for completing "{{task_title}}"

CTA Button: View Balance
Button Link: {{profile_link}}

Secondary text: Keep up the great work! Earnings are available in your profile.
```

**Variables:**
- `professional_name`
- `amount`
- `currency` (BGN)
- `task_title`
- `profile_link`
- + all translation variables

---

### 7. Welcome Email
**Trigger:** User signs up (email verified, no Telegram)
**Audience:** New user
**Subject:** `👋 Welcome to Trudify, {{user_name}}!`

**Content:**
```
Heading: Welcome to Trudify!
Message: Congratulations! Your account has been created successfully.

Benefits list:
• Post tasks and find trusted professionals
• Apply for work and earn money
• Instant notifications for all updates
• Secure payments and reviews

CTA Button: Get Started
Button Link: {{dashboard_link}}

Secondary text: Need help? Check out our guides or contact support.
```

**Variables:**
- `user_name`
- `dashboard_link`
- + all translation variables

---

### 8. Removed from Task
**Trigger:** Customer removes professional from task
**Audience:** Professional
**Subject:** `Task update: "{{task_title}}"`

**Content:**
```
Heading: You've Been Removed from a Task
Message: You have been removed from the task "{{task_title}}" by the customer.

CTA Button: Browse Other Tasks
Button Link: {{browse_tasks_link}}

Secondary text: The task is now open for other professionals to apply. This does not affect your rating unless there are quality concerns. If you have questions, please contact support.
```

**Variables:**
- `professional_name`
- `task_title`
- `browse_tasks_link`
- + all translation variables

---

### 9. Task Invitation
**Trigger:** Customer invites professional to apply for task
**Audience:** Professional
**Subject:** `🎯 {{customer_name}} invited you to a task!`

**Content:**
```
Heading: You've Been Invited to a Task!
Message: {{customer_name}} has invited you to apply for their task in {{task_category}}:

Task Title: "{{task_title}}"

CTA Button: View Task & Apply
Button Link: {{task_link}}

Secondary text: You were selected based on your skills and reviews. Apply now before the task is filled!
```

**Variables:**
- `professional_name`
- `customer_name`
- `task_title`
- `task_category`
- `task_link`
- + all translation variables

---

## Implementation Checklist

### Phase 1: Improve Base Template (BLOCKER)
- [ ] Add production logo to base template
- [ ] Refine styling, colors, typography
- [ ] Test across email clients (Gmail, Outlook, Apple Mail)
- [ ] Ensure mobile responsiveness
- [ ] Get user approval on design

### Phase 2: Create SendGrid Templates
- [ ] Create 9 dynamic templates in SendGrid (one per notification type)
- [ ] All templates use same base design (branded template)
- [ ] Add unique template IDs to `.env.local`
- [ ] Add test data for each template

### Phase 3: Add Translation Keys
- [ ] Add notification translation keys to `/src/lib/intl/en/notifications.ts`
- [ ] Add Bulgarian translations to `/src/lib/intl/bg/notifications.ts`
- [ ] Add Russian translations to `/src/lib/intl/ru/notifications.ts`
- [ ] Create email notification helper function

### Phase 4: Implement Email Notification Service
- [ ] Create `/src/lib/services/email-notification.ts`
- [ ] Implement template selection logic
- [ ] Add fallback: Telegram → Email → None
- [ ] Log all notification attempts to `notification_logs` table
- [ ] Track costs (€0 for both Telegram and SendGrid free tier)

### Phase 5: Update Notification Triggers
- [ ] Application received: Send email if no Telegram
- [ ] Application accepted: Send email if no Telegram
- [ ] Application rejected: Send email if no Telegram
- [ ] Message received: Send email if no Telegram
- [ ] Task completed: Send email if no Telegram
- [ ] Payment received: Send email if no Telegram
- [ ] Welcome: Send email if no Telegram
- [ ] Removed from task: Send email if no Telegram
- [ ] Task invitation: Send email if no Telegram

### Phase 6: Testing
- [ ] Test each notification type with email-only user
- [ ] Test each notification type with Telegram-only user
- [ ] Verify no duplicate notifications
- [ ] Check SendGrid Activity for delivery
- [ ] Verify translations work correctly (EN/BG/RU)
- [ ] Test unsubscribe functionality (future)

---

## Technical Notes

### SendGrid Environment Variables
```bash
# .env.local
SENDGRID_API_KEY=SG.xxx
SENDGRID_TEMPLATE_ID_VERIFICATION=d-xxx
SENDGRID_TEMPLATE_ID_APPLICATION_RECEIVED=d-xxx
SENDGRID_TEMPLATE_ID_APPLICATION_ACCEPTED=d-xxx
SENDGRID_TEMPLATE_ID_APPLICATION_REJECTED=d-xxx
SENDGRID_TEMPLATE_ID_MESSAGE_RECEIVED=d-xxx
SENDGRID_TEMPLATE_ID_TASK_COMPLETED=d-xxx
SENDGRID_TEMPLATE_ID_PAYMENT_RECEIVED=d-xxx
SENDGRID_TEMPLATE_ID_WELCOME=d-xxx
SENDGRID_TEMPLATE_ID_REMOVED_FROM_TASK=d-xxx
SENDGRID_TEMPLATE_ID_TASK_INVITATION=d-xxx
```

### Notification Logic Pseudocode
```typescript
async function sendNotification(userId, notificationType, data) {
  const user = await getUserPreferences(userId)

  // Priority 1: Telegram (free, instant)
  if (user.telegram_id) {
    return await sendTelegramNotification(...)
  }

  // Priority 2: Email (if verified)
  if (user.is_email_verified) {
    return await sendEmailNotification(...)
  }

  // No notification method available
  console.warn('User has no notification channel:', userId)
  return { success: false, reason: 'no_channel' }
}
```

### Translation Key Structure
```typescript
'notifications.email.applicationReceived.subject': 'Trudify - {{customer_name}}, you have a new application!',
'notifications.email.applicationReceived.heading': 'New Application Received!',
'notifications.email.applicationReceived.message': '{{professional_name}} has applied to your task "{{task_title}}"',
'notifications.email.applicationReceived.buttonText': 'View Application',
// ... etc
```

---

## Success Criteria

- [ ] All 9 notification types working via email
- [ ] Email sent ONLY when user has no Telegram and email verified
- [ ] All emails fully translated (EN/BG/RU)
- [ ] SendGrid Activity shows successful delivery
- [ ] notification_logs table tracking all attempts
- [ ] No duplicate notifications (Telegram + Email)
- [ ] Professional, branded email design
- [ ] Mobile-responsive emails
- [ ] Working CTAs (buttons link to correct pages)

---

## Future Enhancements (Not in Scope)

- [ ] Email unsubscribe functionality
- [ ] User preference: "Email me even if I have Telegram"
- [ ] Digest emails (daily/weekly summary)
- [ ] Rich email templates with images
- [ ] A/B testing different email designs
- [ ] Email open/click tracking analytics

---

## Priority

**High** - Email is critical fallback for users without Telegram

## Estimated Effort

**6-8 hours** (after base template is production-ready)
- Template creation: 2 hours
- Translations: 1 hour
- Service implementation: 2 hours
- Integration & testing: 2-3 hours
