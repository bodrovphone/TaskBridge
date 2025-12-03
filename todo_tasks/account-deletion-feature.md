# Account Deletion Feature

## Task Description
Implement GDPR-compliant account deletion functionality that satisfies Google OAuth and Facebook Login requirements.

## Requirements

### OAuth Provider Compliance
- **Google**: Provide in-app deletion + public "Delete Account URL" for Data Safety form
- **Facebook**: Implement Data Deletion Callback URL (endpoint Facebook calls when user removes app)

### Core Functionality
- Pre-flight checks before allowing deletion
- 30-day soft delete grace period with recovery option
- Hard delete via scheduled job after grace period
- Proper handling of user's tasks, applications, reviews, and messages

## Acceptance Criteria

### Phase 1: Database & API
- [ ] Add `deleted_at` and `deletion_scheduled_for` columns to users table
- [ ] Create `/api/account/delete` endpoint (initiate deletion)
- [ ] Create `/api/account/restore` endpoint (cancel during grace period)
- [ ] Create `/api/auth/facebook/data-deletion` callback endpoint for Facebook
- [ ] Implement pre-flight check logic (block if tasks in_progress)

### Phase 2: UI Components
- [ ] Create `/[lang]/account/delete` page (serves as public URL for Google/Facebook)
- [ ] Create confirmation dialog with:
  - Summary of what will be deleted/anonymized
  - 30-day recovery period explanation
  - Re-authentication requirement
- [ ] Update Danger Zone section in AccountSettingsSection
- [ ] Add "Account scheduled for deletion" banner for soft-deleted users

### Phase 3: Data Handling
- [ ] Cancel user's open tasks on deletion
- [ ] Withdraw user's pending applications on deletion
- [ ] Anonymize reviews (keep rating, replace name with "Deleted User")
- [ ] Keep completed task history (anonymized) for other party
- [ ] Revoke OAuth tokens (Google/Facebook)
- [ ] Delete avatar from Supabase Storage
- [ ] Send confirmation email on deletion request
- [ ] Create deletion audit log for compliance

### Phase 4: Scheduled Job
- [ ] Create cron job / Supabase Edge Function for hard delete
- [ ] Run daily: find users where `deletion_scheduled_for < NOW()`
- [ ] Perform CASCADE delete on user record
- [ ] Delete from Supabase Auth (auth.users)
- [ ] Log completion for GDPR compliance records

## Technical Notes

### Pre-flight Blockers (cannot delete if):
- Any tasks with status `in_progress`
- Any tasks with status `pending_customer_confirmation`
- User is the selected_professional on an active task

### Data Handling Strategy:
| Data Type | Action |
|-----------|--------|
| User profile | Hard delete after 30 days |
| Open tasks (as customer) | Cancel immediately |
| Pending applications | Withdraw immediately |
| Reviews written | Anonymize (keep rating) |
| Reviews received | Keep (other user's content) |
| Messages | Delete with user |
| Notifications | Delete with user |
| Avatar/files | Delete from storage |

### Facebook Callback Format:
```
POST /api/auth/facebook/data-deletion
Body: { signed_request: "..." }
Response: { url: "status_url", confirmation_code: "abc123" }
```

### Migration SQL:
```sql
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deletion_scheduled_for TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_users_deletion_scheduled
ON users(deletion_scheduled_for)
WHERE deleted_at IS NOT NULL;
```

## Priority
Medium

## Dependencies
- Supabase Edge Functions or external cron for scheduled hard delete
- Email service for deletion confirmation emails

## References
- Google: https://support.google.com/googleplay/android-developer/answer/13327111
- Facebook: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
