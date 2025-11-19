# Email Notification Templates - Variable Mapping

This document maps the **9 notification types** to the flexible base template (`04-base-notification.html`).

## Existing Translation Keys Analysis

### ✅ Already Have Telegram Templates (Can Adapt for Email):
1. **welcome** - Translation key exists (`notifications.telegram.welcome`)
2. **applicationReceived** - Translation key exists (`notifications.telegram.applicationReceived`)
3. **applicationAccepted** - Translation key exists (`notifications.telegram.applicationAccepted`)
4. **applicationRejected** - ⚠️ Hardcoded in `telegram-notification.ts` (need to add translation)
5. **messageReceived** - ⚠️ Hardcoded in `telegram-notification.ts` (need to add translation)
6. **taskCompleted** - Translation key exists (`notifications.telegram.taskCompleted`)
7. **paymentReceived** - ⚠️ Hardcoded in `telegram-notification.ts` (need to add translation)
8. **removedByCustomer** - Translation key exists (`notifications.telegram.removedByCustomer`)
9. **taskInvitation** - Translation key exists (`notifications.telegram.taskInvitation`)

---

## Email Template Variable Mapping

All 9 notifications use the same SendGrid template ID (`SENDGRID_TEMPLATE_ID_NOTIFICATION`), but with different variables.

### Base Template Variables (Used by All):
```typescript
{
  heading: string         // Main title
  greeting: string        // "Hi" / "Здравейте" / "Здравствуйте"
  user_name: string      // User's name
  message: string        // Main message body
  primary_link: string   // Main CTA URL
  primary_button_text: string  // Main button text
  footer_text: string    // Footer disclaimer
  footer_rights: string  // "All rights reserved"
  current_year: string   // "2025"

  // Optional:
  secondary_link?: string
  secondary_button_text?: string
  secondary_message?: string
  info_title?: string
  info_items?: string[]  // Array of info items
}
```

---

## 1. Application Received

**Trigger:** Professional applies to customer's task
**Audience:** Customer (task owner)
**Subject:** `{{customer_name}}, you have a new application!`

**Variables:**
```typescript
{
  heading: "New Application Received!",
  greeting: "Hi",
  user_name: customerName,
  message: `${professionalName} has applied to your task "${taskTitle}". Check their profile, reviews, and offer details.`,
  primary_link: applicationLink,
  primary_button_text: "View Application",
  secondary_link: professionalProfileLink,
  secondary_button_text: "View Profile",
  info_title: "Application Details:",
  info_items: [
    `Offered Price: ${offeredPrice} BGN`,
    `Expected Completion: ${timeline}`,
    `Rating: ${rating} ⭐ (${reviewCount} reviews)`
  ],
  footer_text: "You're receiving this because you posted a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.applicationReceived.subject'
'notifications.email.applicationReceived.heading'
'notifications.email.applicationReceived.message'
'notifications.email.applicationReceived.buttonText'
'notifications.email.applicationReceived.secondaryButtonText'
'notifications.email.applicationReceived.infoTitle'
```

---

## 2. Application Accepted

**Trigger:** Customer accepts professional's application
**Audience:** Professional
**Subject:** `Your application was accepted!`

**Variables:**
```typescript
{
  heading: "Congratulations! Application Accepted",
  greeting: "Hi",
  user_name: professionalName,
  message: `Your application for "${taskTitle}" has been accepted by ${customerName}!`,
  primary_link: taskLink,
  primary_button_text: "View Task Details",
  info_title: "Customer Contact Information:",
  info_items: [
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Email: ${customerEmail}`
  ],
  secondary_message: "Get started on the task and maintain good communication with the customer.",
  footer_text: "You're receiving this because you applied to a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.applicationAccepted.subject'
'notifications.email.applicationAccepted.heading'
'notifications.email.applicationAccepted.message'
'notifications.email.applicationAccepted.buttonText'
'notifications.email.applicationAccepted.infoTitle'
'notifications.email.applicationAccepted.secondaryMessage'
```

---

## 3. Application Rejected

**Trigger:** Customer rejects professional's application
**Audience:** Professional
**Subject:** `Application Update for "${taskTitle}"`

**Variables:**
```typescript
{
  heading: "Application Not Accepted",
  greeting: "Hi",
  user_name: professionalName,
  message: `Your application for "${taskTitle}" was not accepted this time. Don't worry! Keep applying to other opportunities.`,
  primary_link: browseTasksLink,
  primary_button_text: "Browse Other Tasks",
  secondary_message: "Remember: Each application is a learning experience. Review feedback and keep improving!",
  footer_text: "You're receiving this because you applied to a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.applicationRejected.subject'
'notifications.email.applicationRejected.heading'
'notifications.email.applicationRejected.message'
'notifications.email.applicationRejected.buttonText'
'notifications.email.applicationRejected.secondaryMessage'
```

---

## 4. Message Received

**Trigger:** User receives a message about a task
**Audience:** Customer or Professional
**Subject:** `New message from {{sender_name}}`

**Variables:**
```typescript
{
  heading: "You Have a New Message",
  greeting: "Hi",
  user_name: recipientName,
  message: `${senderName} sent you a message about "${taskTitle}"`,
  primary_link: messageLink,
  primary_button_text: "View Message",
  info_title: "Message Preview:",
  info_items: [`"${messagePreview.substring(0, 150)}..."`],
  secondary_message: "Respond quickly to maintain good communication and build trust.",
  footer_text: "You're receiving this because you're involved in a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.messageReceived.subject'
'notifications.email.messageReceived.heading'
'notifications.email.messageReceived.message'
'notifications.email.messageReceived.buttonText'
'notifications.email.messageReceived.infoTitle'
'notifications.email.messageReceived.secondaryMessage'
```

---

## 5. Task Completed

**Trigger:** Task is marked as complete
**Audience:** Customer and Professional
**Subject:** `Task completed: "${taskTitle}"`

**Variables:**
```typescript
{
  heading: "Task Completed Successfully!",
  greeting: "Hi",
  user_name: userName,
  message: `The task "${taskTitle}" has been marked as complete. Please rate your experience and help build trust in the community.`,
  primary_link: reviewLink,
  primary_button_text: "Leave a Review",
  secondary_message: "Your review helps other users find great professionals (or customers) and improves the Trudify community.",
  footer_text: "You're receiving this because you were involved in a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.taskCompleted.subject'
'notifications.email.taskCompleted.heading'
'notifications.email.taskCompleted.message'
'notifications.email.taskCompleted.buttonText'
'notifications.email.taskCompleted.secondaryMessage'
```

---

## 6. Payment Received

**Trigger:** Professional receives payment
**Audience:** Professional
**Subject:** `Payment received for "${taskTitle}"`

**Variables:**
```typescript
{
  heading: "Payment Received!",
  greeting: "Hi",
  user_name: professionalName,
  message: `You received ${amount} BGN for completing "${taskTitle}". Keep up the great work!`,
  primary_link: profileLink,
  primary_button_text: "View Balance",
  info_title: "Payment Details:",
  info_items: [
    `Amount: ${amount} BGN`,
    `Task: ${taskTitle}`,
    `Customer: ${customerName}`,
    `Date: ${paymentDate}`
  ],
  secondary_message: "Earnings are available in your profile. Continue providing excellent service to earn more!",
  footer_text: "You're receiving this because you completed a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.paymentReceived.subject'
'notifications.email.paymentReceived.heading'
'notifications.email.paymentReceived.message'
'notifications.email.paymentReceived.buttonText'
'notifications.email.paymentReceived.infoTitle'
'notifications.email.paymentReceived.secondaryMessage'
```

---

## 7. Welcome Email

**Trigger:** User signs up (email verified, no Telegram)
**Audience:** New user
**Subject:** `Welcome to Trudify, {{user_name}}!`

**Variables:**
```typescript
{
  heading: "Welcome to Trudify!",
  greeting: "Hi",
  user_name: userName,
  message: "Congratulations! Your account has been created successfully.",
  primary_link: dashboardLink,
  primary_button_text: "Get Started",
  info_title: "What You Can Do on Trudify:",
  info_items: [
    "📝 Post tasks and find trusted professionals",
    "💼 Apply for work and earn money",
    "⚡ Instant notifications for all updates",
    "💰 Secure payments and reviews"
  ],
  secondary_message: "Need help? Check out our guides or contact support.",
  footer_text: "You're receiving this because you created an account on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.welcome.subject'
'notifications.email.welcome.heading'
'notifications.email.welcome.message'
'notifications.email.welcome.buttonText'
'notifications.email.welcome.infoTitle'
'notifications.email.welcome.secondaryMessage'
```

---

## 8. Removed from Task

**Trigger:** Customer removes professional from task
**Audience:** Professional
**Subject:** `Task update: "${taskTitle}"`

**Variables:**
```typescript
{
  heading: "You've Been Removed from a Task",
  greeting: "Hi",
  user_name: professionalName,
  message: `You have been removed from the task "${taskTitle}" by the customer. The task is now open for other professionals to apply.`,
  primary_link: browseTasksLink,
  primary_button_text: "Browse Other Tasks",
  secondary_message: "This does not affect your rating unless there are quality or safety concerns. If you have questions, please contact support.",
  footer_text: "You're receiving this because you were working on a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.removedFromTask.subject'
'notifications.email.removedFromTask.heading'
'notifications.email.removedFromTask.message'
'notifications.email.removedFromTask.buttonText'
'notifications.email.removedFromTask.secondaryMessage'
```

---

## 9. Task Invitation

**Trigger:** Customer invites professional to apply for task
**Audience:** Professional
**Subject:** `{{customer_name}} invited you to a task!`

**Variables:**
```typescript
{
  heading: "You've Been Invited to a Task!",
  greeting: "Hi",
  user_name: professionalName,
  message: `${customerName} has invited you to apply for their task in ${taskCategory}.`,
  primary_link: taskLink,
  primary_button_text: "View Task & Apply",
  info_title: "Task Details:",
  info_items: [
    `Task: ${taskTitle}`,
    `Category: ${taskCategory}`,
    `Customer: ${customerName}`
  ],
  secondary_message: "You were selected based on your skills and reviews. Apply now before the task is filled!",
  footer_text: "You're receiving this because you were invited to apply for a task on Trudify.",
  footer_rights: "All rights reserved.",
  current_year: "2025"
}
```

**Translation Keys Needed:**
```typescript
'notifications.email.taskInvitation.subject'
'notifications.email.taskInvitation.heading'
'notifications.email.taskInvitation.message'
'notifications.email.taskInvitation.buttonText'
'notifications.email.taskInvitation.infoTitle'
'notifications.email.taskInvitation.secondaryMessage'
```

---

## Summary

### Single Template, Multiple Notification Types
- **1 SendGrid Template**: `04-base-notification.html`
- **9 Notification Types**: Controlled by backend variable mapping
- **3 Languages**: EN/BG/RU (all variables translated by backend before sending)

### Translation Keys to Add
Total: **54 new translation keys** (9 notification types × 6 keys each)

Each notification type needs:
1. `subject` - Email subject line
2. `heading` - Main title
3. `message` - Main body text
4. `buttonText` - Primary CTA button
5. `infoTitle` or `secondaryButtonText` - Context-specific
6. `secondaryMessage` - Additional guidance text

### Implementation Strategy
1. ✅ Base template ready (`04-base-notification.html`) with mobile responsiveness
2. ⏭️ Add 54 translation keys to `/src/lib/intl/[lang]/notifications.ts` (EN/BG/RU)
3. ⏭️ Create email notification service `/src/lib/services/email-notification.ts`
4. ⏭️ Implement Telegram → Email fallback logic
5. ⏭️ Test all 9 notification types

**Reuse Strategy:**
- ✅ Reuse Telegram message content as basis for email messages
- ✅ Reuse existing translation keys where applicable
- ⚠️ Add email-specific structure (subject, buttons, info boxes)
