# Forgot Password Functionality

## Task Description
Add password reset functionality for users who forgot their password.

## Requirements
- Password reset request page
- Email with reset link
- Reset password form
- Use Supabase Auth password reset

## Acceptance Criteria
- [ ] Add "Forgot Password?" link on login form
- [ ] Create reset request page (email input)
- [ ] Send reset email via Supabase Auth
- [ ] Create password reset page with token validation
- [ ] Update password and redirect to login

## Technical Notes
- Use Supabase `resetPasswordForEmail()` method
- Password reset URL: `/reset-password?token=xxx`
- Add proper error handling and validation

## Priority
Medium
