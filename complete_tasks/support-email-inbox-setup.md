# Support Email Inbox Setup

## Task Description
Set up a proper email inbox for support@trudify.com to handle customer support inquiries.

## Requirements
- Receive and manage emails sent to support@trudify.com
- Ability to reply to customers
- Keep SendGrid for transactional email sending

## Options to Evaluate
1. **Google Workspace** - Full inbox, ~$6/user/month
2. **Zoho Mail** - Budget-friendly, free tier available
3. **Freshdesk/Zendesk** - Support ticketing, integrates with SendGrid
4. **SendGrid Inbound Parse** - Webhook to Supabase (requires custom UI)

## Acceptance Criteria
- [ ] Choose email/helpdesk solution
- [ ] Configure MX records for trudify.com
- [ ] Set up support@trudify.com inbox
- [ ] Test sending/receiving emails
- [ ] Document setup in /docs/

## Technical Notes
- SendGrid is for sending only, not a mailbox provider
- MX records will need updating based on chosen solution
- Consider future scaling needs (multiple support agents)

## Priority
Low
