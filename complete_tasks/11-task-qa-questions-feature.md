# Task Q&A / Questions Feature

## Task Description
Implement a public Q&A feature on task detail pages that allows professionals to ask questions about tasks and task authors to respond. This feature enables professionals to clarify requirements before applying, making the application process more informed and reducing mismatched applications.

## Current State
- **UI Components**: Already exist in task detail page
  - "Ask Question" button in task actions (`task-actions.tsx`)
  - Questions tab in Task Activity component (`task-activity.tsx`)
  - Mock questions data with UI rendering
- **Backend**: Not implemented
- **Authentication Flow**: Exists (auth slide-over for non-authenticated users)
- **Notification System**: Basic UI exists in notification center

## Feature Overview

### Key Characteristics
- **Public visibility**: All questions and answers are visible to everyone viewing the task
- **No application required**: Professionals can ask questions without applying to the task
- **Author responses**: Only task authors can answer questions
- **Real-time updates**: Questions appear immediately after posting
- **Notification system**: Both askers and task authors get notified of new activity

## Requirements

### 1. Database Schema
- [ ] Create `task_questions` table:
  ```sql
  task_questions:
    - id (uuid, primary key)
    - task_id (uuid, foreign key -> tasks.id)
    - asker_id (uuid, foreign key -> users.id)
    - question_text (text, required)
    - created_at (timestamp)
    - updated_at (timestamp)
  ```

- [ ] Create `question_answers` table:
  ```sql
  question_answers:
    - id (uuid, primary key)
    - question_id (uuid, foreign key -> task_questions.id)
    - author_id (uuid, foreign key -> users.id)
    - answer_text (text, required)
    - created_at (timestamp)
    - updated_at (timestamp)
  ```

- [ ] Add indexes:
  - `task_questions.task_id` for fast lookup by task
  - `task_questions.asker_id` for user's question history
  - `question_answers.question_id` for answers lookup

### 2. API Endpoints

#### Questions
- [ ] `POST /api/tasks/[taskId]/questions` - Create new question
  - Auth required
  - Validates: user is authenticated, task exists and is active
  - Returns: created question with asker details

- [ ] `GET /api/tasks/[taskId]/questions` - Get all questions for a task
  - Public (no auth required)
  - Returns: questions with answers and user details
  - Sort by: most recent first
  - Include: asker profile (name, avatar, verification status)
  - Include: all answers with author details

#### Answers
- [ ] `POST /api/tasks/[taskId]/questions/[questionId]/answer` - Post answer
  - Auth required
  - Validates: user is task author
  - Returns: created answer with author details

- [ ] `PATCH /api/tasks/[taskId]/questions/[questionId]/answer/[answerId]` - Edit answer
  - Auth required
  - Validates: user is answer author OR task author
  - Returns: updated answer

### 3. Frontend Components

#### Ask Question Dialog
- [ ] Create `AskQuestionDialog.tsx` component
  - Textarea for question (min 10 chars, max 500 chars)
  - Character counter
  - Submit button with loading state
  - Error handling and validation
  - Success feedback

#### Questions List
- [ ] Update `task-activity.tsx` Questions tab:
  - Fetch real questions from API
  - Display questions with answers in chronological order
  - Each question shows:
    - Asker profile (avatar, name, verified badge)
    - Question text
    - Timestamp (relative time)
    - Answer section (if answered)
  - Empty state for no questions
  - Loading state while fetching

#### Question Card Component
- [ ] Create `QuestionCard.tsx`:
  - Question section (asker info + question text)
  - Answer section (task author response)
  - Reply button (visible only to task author)
  - Edit button (visible to answer author)
  - Compact, readable layout

#### Answer Dialog
- [ ] Create `AnswerQuestionDialog.tsx`:
  - Shows original question context
  - Textarea for answer
  - Submit/Update button
  - Available only to task author

### 4. Notifications

#### Question Posted Notification
- [ ] Send notification to task author when new question is posted
  - Type: `question_posted`
  - Title: "New question on your task"
  - Message: "{asker_name} asked: {question_preview}"
  - Action: Link to task detail page with question highlighted

#### Answer Posted Notification
- [ ] Send notification to question asker when author responds
  - Type: `question_answered`
  - Title: "Your question was answered"
  - Message: "{author_name} answered your question on {task_title}"
  - Action: Link to task detail page with answer highlighted

### 5. Permissions & Validation

- [ ] **Ask Question**:
  - Must be authenticated
  - Cannot ask questions on own tasks
  - Rate limit: 5 questions per task per user
  - Cooldown: 1 minute between questions

- [ ] **Post Answer**:
  - Must be task author
  - Can only answer questions on own tasks
  - One answer per question (can edit existing)

- [ ] **View Questions**:
  - Public - no authentication required
  - Visible to all users viewing the task

### 6. UI/UX Enhancements

- [ ] Question counter badge on "Questions" tab
- [ ] Highlight unanswered questions in task activity
- [ ] Scroll to question when navigating from notification
- [ ] Loading skeletons for questions list
- [ ] Optimistic UI updates when posting questions/answers
- [ ] Toast notifications for successful actions

### 7. Internationalization

- [ ] Add translation keys for all Q&A-related strings:
  - `taskDetail.askQuestionDialog.title`
  - `taskDetail.askQuestionDialog.placeholder`
  - `taskDetail.askQuestionDialog.submit`
  - `taskDetail.questions.empty.title`
  - `taskDetail.questions.empty.message`
  - `taskDetail.questions.unanswered`
  - `taskDetail.questions.answered`
  - `taskDetail.answerDialog.title`
  - `taskDetail.answerDialog.placeholder`
  - `notifications.questionPosted.title`
  - `notifications.questionAnswered.title`

### 8. Testing & Quality Assurance

- [ ] Unit tests for API endpoints
- [ ] Integration tests for question flow
- [ ] E2E tests:
  - Professional asks question → author receives notification → author answers → asker receives notification
- [ ] Edge cases:
  - Deleted user handling
  - Archived task questions
  - Question spam prevention

## Technical Notes

### Mock Data Location
- Current mock questions in `/app/[lang]/tasks/[id]/components/task-activity.tsx`
- Replace with API calls when backend is ready

### Component Files
- `/app/[lang]/tasks/[id]/components/task-actions.tsx` - Contains "Ask Question" button
- `/app/[lang]/tasks/[id]/components/task-activity.tsx` - Contains Questions tab UI
- Create new: `/components/tasks/ask-question-dialog.tsx`
- Create new: `/components/tasks/question-card.tsx`
- Create new: `/components/tasks/answer-question-dialog.tsx`

### State Management
- Consider using TanStack Query for:
  - Fetching questions list
  - Optimistic updates
  - Cache invalidation after posting
  - Real-time updates (optional: polling or websockets)

### Security Considerations
- Sanitize all question/answer text to prevent XSS
- Rate limiting on question posting
- Verify task ownership before allowing answers
- Validate question length on both client and server
- Prevent question spam (same question multiple times)

## User Stories

### Story 1: Professional Asks Question
**As a** professional browsing tasks
**I want to** ask questions about task requirements
**So that** I can understand the task better before applying

**Acceptance Criteria:**
- Can ask questions without applying to task
- Questions are visible to everyone
- Receive notification when task author answers
- Can ask multiple questions per task (with rate limit)

### Story 2: Task Author Answers Questions
**As a** task author
**I want to** answer questions from professionals
**So that** I can clarify requirements and attract better candidates

**Acceptance Criteria:**
- Receive notification when someone asks a question
- Can view all questions on task detail page
- Can post public answers visible to everyone
- Can edit my answers after posting

### Story 3: Public Transparency
**As a** professional viewing a task
**I want to** see all questions and answers
**So that** I can learn from others' questions without asking duplicates

**Acceptance Criteria:**
- All questions and answers are publicly visible
- No authentication required to view Q&A
- Questions sorted chronologically (newest first)
- Clear indication of answered vs unanswered questions

## Benefits

1. **Reduces Mismatched Applications**: Professionals get clarity before applying
2. **Saves Time**: Public answers help multiple professionals at once
3. **Improves Task Quality**: Detailed questions help authors clarify requirements
4. **Transparency**: Open communication builds trust
5. **SEO Benefits**: Public Q&A adds valuable content to task pages
6. **Engagement**: Increases platform interaction and retention

## Priority
**Medium** - Valuable feature but not blocking MVP launch

## Dependencies
- Authentication system (already implemented)
- Notification system (basic UI exists, needs backend)
- Database migrations (Drizzle ORM)
- TanStack Query setup (optional but recommended)

## Related Files
- `/app/[lang]/tasks/[id]/components/task-actions.tsx` - Ask Question button
- `/app/[lang]/tasks/[id]/components/task-activity.tsx` - Questions tab UI
- `/database/schema.ts` - Add new tables
- `/lib/intl/*/notifications.ts` - Add translation keys
- `/types/questions.ts` - Type definitions (to be created)

## Notes
- Consider implementing real-time updates via websockets for live Q&A
- Add email notifications for question/answer activity (optional)
- Consider allowing professionals to upvote questions (future feature)
- Monitor for spam and implement moderation tools if needed
- Analytics: Track question engagement and answer rates
