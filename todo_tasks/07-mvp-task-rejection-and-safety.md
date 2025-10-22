# MVP Task Rejection & Safety System

## Task Description

Implement a simplified task rejection and safety reporting system for MVP without requiring admin/support team intervention. Focus on automated safety mechanisms and transparent feedback.

## MVP Philosophy

**No Support Team Required** - All dispute resolution and safety measures are automated and community-driven.

## Core Features

### 1. Task Rejection (Instead of Disputes)

**Customer Can Reject Completion:**
- When professional marks task as complete, customer sees:
  - ✅ Confirm Completion
  - ❌ Reject Completion

**Rejection Flow:**
```
┌────────────────────────────────────┐
│ Reject Task Completion?            │
├────────────────────────────────────┤
│ Professional: John D.              │
│ Task: Plumbing Repair              │
│                                    │
│ Why are you rejecting?             │
│ ○ Work not completed               │
│ ○ Poor quality                     │
│ ○ Different from agreed scope      │
│ ○ Other issues                     │
│                                    │
│ Optional: Explain the issue        │
│ [Textarea - optional]              │
│                                    │
│ Task will return to "In Progress"  │
│ You can discuss with professional  │
│                                    │
│ [Cancel] [Reject Completion]       │
└────────────────────────────────────┘
```

**After Rejection:**
- Task status returns to `in_progress`
- Professional receives notification
- Both parties can message each other
- Professional can mark complete again
- No limit on rejection cycles (for MVP)

### 2. Negative Review System

**Hidden Until Pattern Emerges:**
- Customer leaves review (1-5 stars + text)
- Reviews with ≤3 stars are **hidden by default**
- Negative review becomes visible when:
  - **Option A**: Another review with ≤3 stars from different customer
  - **Option B**: Professional accumulates 2-3 negative reviews total

**Review Display Logic:**
```typescript
interface ReviewVisibility {
  // Review is visible if:
  // 1. Rating > 3 stars (always visible)
  // 2. Rating ≤ 3 stars AND (
  //    - Professional has 2+ other reviews with ≤3 stars
  //    - OR another review with ≤3 stars exists
  // )

  isVisible: boolean;
  reason: 'high_rating' | 'pattern_detected' | 'hidden_single_negative';
}
```

**Why This Approach:**
- Prevents single malicious/unfair review from destroying reputation
- Patterns of poor service become visible
- Encourages professionals to maintain quality
- Fair to professionals who have one bad day

### 3. Scam Report Button

**"Report Scam/Abuse" Feature:**

```
┌────────────────────────────────────┐
│ ⚠️ Report Scam or Abuse             │
├────────────────────────────────────┤
│ This is a serious action that      │
│ should only be used for:           │
│                                    │
│ ○ Suspected fraud/scam             │
│ ○ Threatening behavior             │
│ ○ Requests for off-platform payment│
│ ○ Identity theft                   │
│ ○ Harassment                       │
│                                    │
│ Describe the issue:                │
│ [Textarea - required]              │
│                                    │
│ Upload evidence (optional):        │
│ [📸 Add Screenshots/Photos]        │
│                                    │
│ ⚠️ False reports may result in     │
│    account suspension              │
│                                    │
│ [Cancel] [Submit Report]           │
└────────────────────────────────────┘
```

**Automated Action System:**

**After 1st Report:**
- Report logged in database
- User receives confirmation: "Thank you for your report. We take safety seriously."
- **No immediate action**

**After 2nd Report (from different user):**
- Professional account **automatically suspended**
- Email sent to professional: "Your account has been temporarily suspended due to multiple safety reports. Please contact support@trudify.com"
- Professional cannot:
  - Apply to new tasks
  - Message customers
  - Mark tasks as complete
  - Access platform (temporary ban)

**Professional Rehabilitation:**
- Manual review by founder/support (post-MVP)
- Can appeal via email
- Account can be reinstated if reports were false

### 4. Safety Indicators

**Trust Badges on Profiles:**
- ✅ Phone Verified
- ✅ Email Verified
- ✅ Clean Safety Record (no reports)
- ⚠️ Has Negative Reviews (if pattern detected)

**Warning Banner:**
```
┌────────────────────────────────────┐
│ ⚠️ This professional has received   │
│    multiple negative reviews.      │
│    Please exercise caution.        │
└────────────────────────────────────┘
```

## UI Components Needed

### 1. RejectCompletionDialog
**Location:** `/src/components/tasks/reject-completion-dialog.tsx`
- Rejection reason selection
- Optional explanation
- Warning about task status returning to in_progress

### 2. ReportScamDialog
**Location:** `/src/components/tasks/report-scam-dialog.tsx`
- Serious warning about false reports
- Issue type selection
- Evidence upload
- Submit to automated system

### 3. NegativeReviewBadge
**Location:** `/src/components/professionals/negative-review-badge.tsx`
- Warning indicator when multiple negative reviews
- Tooltip explaining review visibility system

### 4. SafetyIndicators
**Location:** `/src/components/professionals/safety-indicators.tsx`
- Trust badges (verified phone, email, etc.)
- Clean record indicator
- Multiple reports warning

## Database Schema Updates

```typescript
// Add to tasks table
interface Task {
  // ... existing fields
  rejectionCount: number;
  lastRejectedAt?: Date;
  rejectionReasons: string[];
}

// Add to reviews table
interface Review {
  // ... existing fields
  isVisible: boolean; // Calculated field
  visibilityReason: 'high_rating' | 'pattern_detected' | 'hidden_single_negative';
}

// New table: safety_reports
interface SafetyReport {
  id: string;
  reportedUserId: string; // Professional being reported
  reporterUserId: string; // Customer reporting
  taskId?: string; // Optional - related task
  type: 'fraud' | 'threatening' | 'off_platform_payment' | 'identity_theft' | 'harassment' | 'other';
  description: string;
  evidenceUrls: string[];
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
}

// Add to users table
interface User {
  // ... existing fields
  safetyReportsCount: number; // Count of reports against this user
  isSuspended: boolean;
  suspendedAt?: Date;
  suspensionReason?: string;
}
```

## Acceptance Criteria

### Task Rejection:
- [ ] Customer can reject professional's completion
- [ ] Rejection dialog shows reason options
- [ ] Task returns to "in_progress" status
- [ ] Professional receives notification
- [ ] No limit on rejection cycles (for MVP)

### Negative Review System:
- [ ] Reviews with ≤3 stars are hidden by default
- [ ] Hidden reviews become visible when pattern detected
- [ ] Professional profile shows warning badge if multiple negative reviews
- [ ] Review visibility logic works correctly

### Scam Reporting:
- [ ] "Report Scam" button accessible from task/profile
- [ ] Report dialog with serious warnings
- [ ] First report logged, no action taken
- [ ] Second report (different user) suspends account automatically
- [ ] Suspended professional cannot access platform

### Safety Indicators:
- [ ] Trust badges display on professional profiles
- [ ] Warning banner shows when multiple reports/negative reviews
- [ ] Clean record badge for professionals with no issues

### Translations:
- [ ] All UI strings in English
- [ ] All UI strings in Bulgarian
- [ ] All UI strings in Russian

## Translation Keys Needed

```typescript
{
  // Task Rejection
  "taskCompletion.reject.title": "Reject Task Completion?",
  "taskCompletion.reject.reason": "Why are you rejecting?",
  "taskCompletion.reject.notCompleted": "Work not completed",
  "taskCompletion.reject.poorQuality": "Poor quality",
  "taskCompletion.reject.differentScope": "Different from agreed scope",
  "taskCompletion.reject.other": "Other issues",
  "taskCompletion.reject.explain": "Optional: Explain the issue",
  "taskCompletion.reject.warning": "Task will return to 'In Progress'. You can discuss with professional.",
  "taskCompletion.reject.button": "Reject Completion",

  // Scam Reporting
  "safety.reportScam.title": "Report Scam or Abuse",
  "safety.reportScam.warning": "This is a serious action that should only be used for:",
  "safety.reportScam.fraud": "Suspected fraud/scam",
  "safety.reportScam.threatening": "Threatening behavior",
  "safety.reportScam.offPlatform": "Requests for off-platform payment",
  "safety.reportScam.identityTheft": "Identity theft",
  "safety.reportScam.harassment": "Harassment",
  "safety.reportScam.describe": "Describe the issue:",
  "safety.reportScam.evidence": "Upload evidence (optional):",
  "safety.reportScam.falseWarning": "False reports may result in account suspension",
  "safety.reportScam.button": "Report Scam",
  "safety.reportScam.submit": "Submit Report",
  "safety.reportScam.confirmation": "Thank you for your report. We take safety seriously.",

  // Safety Indicators
  "safety.cleanRecord": "Clean Safety Record",
  "safety.phoneVerified": "Phone Verified",
  "safety.emailVerified": "Email Verified",
  "safety.hasNegativeReviews": "Has Negative Reviews",
  "safety.multipleReportsWarning": "This professional has received multiple safety reports. Please exercise caution.",
  "safety.negativeReviewsWarning": "This professional has received multiple negative reviews. Please exercise caution.",

  // Review Visibility
  "reviews.hiddenNegative": "Some negative reviews are hidden until a pattern is detected",
  "reviews.patternDetected": "Multiple customers have reported similar issues",
}
```

## Priority

**High** - Core safety and trust feature for MVP

## Estimated Time

2-3 days

## Related Tasks

- Task Completion UI (04-task-completion-ui.md) - Will be simplified
- Review System (needs to be created)
- Professional Profile Safety Indicators

## Notes

- This approach requires ZERO manual support for MVP
- Automated suspension after 2 reports is aggressive but safe
- Can be refined post-MVP based on user feedback
- False positive protection: requires multiple reports
- Negative review hiding protects against single unfair reviews
