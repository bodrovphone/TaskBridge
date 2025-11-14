# Restore Disabled Cron Jobs

## Task Description
Vercel's free tier only allows 2 cron jobs per team. We currently have only the `publish-delayed-reviews` cron enabled. Two other cron jobs were disabled and should be restored when upgrading to a paid Vercel plan or when cron capacity becomes available.

## Disabled Cron Jobs

### 1. Weekly Digest
```json
{
  "path": "/api/cron/weekly-digest",
  "schedule": "0 9 * * 1"
}
```
**Schedule**: Every Monday at 9:00 AM UTC
**Purpose**: Sends weekly summary emails to users with task updates and activity

### 2. Deadline Reminders
```json
{
  "path": "/api/cron/deadline-reminders",
  "schedule": "0 8 * * *"
}
```
**Schedule**: Daily at 8:00 AM UTC
**Purpose**: Sends reminder notifications for tasks approaching their deadline

## Currently Active Cron Job

### Publish Delayed Reviews
```json
{
  "path": "/api/cron/publish-delayed-reviews",
  "schedule": "0 2 * * *"
}
```
**Schedule**: Daily at 2:00 AM UTC
**Purpose**: Publishes reviews that have passed their delay period

## Requirements
- [ ] Upgrade Vercel plan to support more cron jobs (or manage cron limits)
- [ ] Add the disabled cron jobs back to `vercel.json`
- [ ] Verify the API endpoints still exist and work correctly:
  - `/api/cron/weekly-digest`
  - `/api/cron/deadline-reminders`
- [ ] Test all three cron jobs after re-enabling
- [ ] Monitor cron execution logs in Vercel dashboard

## Technical Notes
- Location: `/vercel.json` - `crons` array
- Vercel Free Tier Limitation: Max 2 cron jobs per team
- Current cron job count: 1/2 used
- Documentation: https://vercel.com/docs/cron-jobs

## Priority
Low (blocked by Vercel plan upgrade)
