# Account Deletion Feature

## Task Description
Implement GDPR-compliant account deletion functionality that satisfies Google OAuth and Facebook Login requirements. Immediate hard delete with review anonymization.

## Requirements

### OAuth Provider Compliance
- **Google**: Provide public "Delete Account URL" for Data Safety form → `/[lang]/account/delete`
- **Facebook**: Implement Data Deletion Callback URL (endpoint Facebook calls when user removes app)

### Core Functionality
- Dedicated account deletion page (serves as Google's required public URL)
- Pre-flight checks before allowing deletion
- Immediate hard delete (no grace period)
- Anonymize reviews to preserve rating integrity

## Acceptance Criteria

### Phase 1: Database & API
- [ ] Create `/api/account/delete` endpoint (immediate hard delete)
- [ ] Create `/api/auth/facebook/data-deletion` callback endpoint
- [ ] Implement pre-flight check logic (block if tasks in_progress)
- [ ] Create deletion audit log table for GDPR compliance

### Phase 2: UI - Dedicated Delete Page
- [ ] Create `/[lang]/account/delete` page with two states:

**Not authenticated:**
- "Delete Your Account" heading
- Brief explanation of what happens when you delete
- "Log in to continue" button → redirects to login, then back to this page

**Authenticated:**
- Pre-flight check results (pass/fail with blockers listed)
- Summary of what will be deleted/anonymized
- Clear warning this is irreversible
- Re-authentication requirement (enter password)
- "Delete My Account" button (destructive styling)

### Phase 3: Profile Settings Integration
- [ ] Update Danger Zone section in AccountSettingsSection
- [ ] Replace any delete functionality with simple link to `/account/delete`
- [ ] Style as destructive/warning button

### Phase 4: Data Handling (all immediate)
- [ ] Cancel user's open tasks
- [ ] Withdraw user's pending applications
- [ ] Anonymize reviews (keep rating, replace author with "Deleted User")
- [ ] Delete messages and notifications
- [ ] Delete avatar from Supabase Storage
- [ ] Revoke OAuth tokens (Google/Facebook)
- [ ] Delete user record (CASCADE)
- [ ] Delete from Supabase Auth (`auth.users`)
- [ ] Log deletion for GDPR compliance

## Technical Notes

### Pre-flight Blockers (cannot delete if):
- Any tasks with status `in_progress`
- Any tasks with status `pending_customer_confirmation`
- User is the `selected_professional` on an active task

### Data Handling Strategy:
| Data Type | Action |
|-----------|--------|
| User profile | Hard delete immediately |
| Open tasks (as customer) | Cancel immediately |
| Pending applications | Withdraw immediately |
| Reviews written | Anonymize (keep rating, author → "Deleted User") |
| Reviews received | Keep (other user's content, anonymize reviewer) |
| Messages | Hard delete |
| Notifications | Hard delete |
| Avatar/files | Delete from storage |

### Page Structure:
```
/[lang]/account/delete

┌─────────────────────────────────────────┐
│  Delete Your Account                    │
├─────────────────────────────────────────┤
│                                         │
│  [If not logged in]                     │
│  To delete your account, you need to    │
│  be logged in.                          │
│                                         │
│  What happens when you delete:          │
│  • Your profile is permanently removed  │
│  • Open tasks are cancelled             │
│  • Your reviews become anonymous        │
│  • This cannot be undone                │
│                                         │
│  [Log in to continue]                   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [If logged in - can delete]            │
│  Pre-flight check: ✓ Ready to delete    │
│                                         │
│  This will permanently delete:          │
│  • Your profile and personal data       │
│  • 3 open tasks (will be cancelled)     │
│  • 2 pending applications (withdrawn)   │
│  • Your messages and notifications      │
│                                         │
│  Your 5 reviews will be anonymized      │
│  (ratings kept, name → "Deleted User")  │
│                                         │
│  ⚠️ This action cannot be undone        │
│                                         │
│  Enter password to confirm: [____]      │
│                                         │
│  [Delete My Account] (red button)       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [If logged in - blockers exist]        │
│  Pre-flight check: ✗ Cannot delete yet  │
│                                         │
│  You have active work that must be      │
│  completed first:                       │
│                                         │
│  • Task "Fix bathroom" is in progress   │
│  • Task "Paint room" pending confirm    │
│                                         │
│  Complete or cancel these tasks before  │
│  deleting your account.                 │
│                                         │
│  [View My Tasks]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Danger Zone in Profile Settings:
```tsx
// Simple link, no deletion logic here
<Card className="border-danger">
  <CardHeader>Danger Zone</CardHeader>
  <CardBody>
    <p>Permanently delete your account and all associated data.</p>
    <Button
      as={Link}
      href={`/${lang}/account/delete`}
      color="danger"
      variant="bordered"
    >
      Delete Account
    </Button>
  </CardBody>
</Card>
```

### Deletion Flow:
```
1. User navigates to /account/delete (from settings or direct link)
2. If not authenticated → show info + login prompt
3. If authenticated → run pre-flight check
4. If blockers exist → show blockers + link to resolve
5. If clear → show summary + password confirmation
6. On confirm:
   a. Verify password
   b. Cancel open tasks
   c. Withdraw pending applications
   d. Anonymize reviews
   e. Delete messages, notifications
   f. Delete avatar from Supabase Storage
   g. Delete user record (triggers CASCADE)
   h. Delete from auth.users
   i. Insert audit log record
7. Sign out user
8. Redirect to homepage with "Account deleted" toast
```

### Facebook Callback Format:
```
POST /api/auth/facebook/data-deletion
Body: { signed_request: "..." }
Response: { url: "status_url", confirmation_code: "abc123" }
```

### Audit Log Schema:
```sql
CREATE TABLE deletion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id UUID NOT NULL,
  deleted_user_email TEXT,
  deletion_method TEXT NOT NULL, -- 'user_request' | 'facebook_callback' | 'admin'
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- store counts: tasks_cancelled, applications_withdrawn, reviews_anonymized
);
```

### Review Anonymization Query:
```sql
UPDATE reviews
SET
  reviewer_name = 'Deleted User',
  reviewer_id = NULL
WHERE reviewer_id = $user_id;
```

## Priority
Medium

## Dependencies
- Email service for deletion confirmation (optional)

## References
- Google: https://support.google.com/googleplay/android-developer/answer/13327111
- Facebook: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
