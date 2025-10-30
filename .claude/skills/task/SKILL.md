---
name: task
description: Manage TaskBridge development tasks using the structured todo workflow. Use when creating, listing, completing, or updating task files in todo_tasks/ directory.
---

# Task Management

Manage TaskBridge development tasks using the structured todo workflow.

## Overview

TaskBridge uses a markdown-based task tracking system with three main directories:
- `todo_tasks/` - Active tasks to be completed
- `todo_tasks/for-later/` - Deferred tasks for future work
- `complete_tasks/` - Completed and archived tasks

**Important Note**: Some tasks in `complete_tasks/` may only have UI implementation complete, with backend/database work still pending. Always verify the actual completion state by reading the task file and checking the codebase, rather than assuming full completion based on directory location alone.

## Task File Structure

Each task follows this template:

```markdown
# Task Title

## Task Description
Brief description of what needs to be done

## Problem (optional)
Context about why this task is needed

## Requirements
- Bullet point requirements
- Keep it simple and focused
- Include technical requirements

## Acceptance Criteria
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Specific deliverable 3

## Technical Notes
Implementation details, affected files, code examples

## Related Files (optional)
- `/path/to/file.ts` - Description
- `/path/to/another.tsx` - Description

## Priority
Low/Medium/High

## Dependencies (optional)
- List of related tasks or features
- External dependencies

## Estimated Effort (optional)
Small/Medium/Large or time estimate
```

## Instructions

When asked to work with tasks, perform the appropriate action:

### 1. List Tasks

**When to use**: User asks "what tasks do we have?", "show me pending tasks", "list todos"

**Action**:
- Use `Bash` tool to list files in `todo_tasks/` (excluding `for-later/`)
- Show count of active tasks
- Optionally show `for-later/` tasks separately
- Present as organized list

**Example**:
```bash
ls -1 todo_tasks/*.md 2>/dev/null | wc -l
ls -1 todo_tasks/*.md 2>/dev/null
ls -1 todo_tasks/for-later/*.md 2>/dev/null
```

### 2. Create New Task

**When to use**: User asks to "create a task", "add a todo for...", "document this work"

**Action**:
1. Ask user for task details if not provided:
   - Task title (for filename)
   - Description
   - Requirements
   - Priority
2. Generate kebab-case filename (e.g., `add-user-notifications.md`)
3. Use the template structure above
4. Create file in `todo_tasks/` using `Write` tool
5. Optionally ask if task should go in `for-later/` instead

**Naming Convention**:
- Use descriptive kebab-case names
- Optional numeric prefix for sequenced tasks (e.g., `17-feature-name.md`)
- Examples: `invite-to-apply-notification-system.md`, `15-budget-unclear-option.md`

### 3. Complete Task

**When to use**: After finishing work on a task, user says "mark task X as done", "complete the Y task"

**Action**:
1. Identify the task file in `todo_tasks/`
2. Use `Bash` tool to move file:
   ```bash
   mv todo_tasks/task-name.md complete_tasks/task-name.md
   ```
3. Confirm the move
4. Optionally update any checkboxes in the file to mark all as complete

**Important Considerations**:
- Some tasks may be moved to `complete_tasks/` with only UI work done (backend/database pending)
- Consider adding a note at the top of partially-complete tasks: "**Status**: UI complete, backend pending"
- When moving a task, verify if it's fully complete or just UI-complete
- Git will automatically detect the file move in the working directory

### 4. Defer Task

**When to use**: User says "move X to for later", "defer this task"

**Action**:
1. Identify the task file in `todo_tasks/`
2. Use `Bash` tool to move file:
   ```bash
   mv todo_tasks/task-name.md todo_tasks/for-later/task-name.md
   ```
3. Confirm the move

### 5. Bring Back Deferred Task

**When to use**: User says "bring back X task", "move Y from for-later"

**Action**:
1. Identify the task file in `todo_tasks/for-later/`
2. Use `Bash` tool to move file:
   ```bash
   mv todo_tasks/for-later/task-name.md todo_tasks/task-name.md
   ```
3. Confirm the move

### 6. View Task Details

**When to use**: User asks "what's in the X task?", "show me task Y"

**Action**:
1. Use `Glob` to find task file (search all directories)
2. Use `Read` to display task contents
3. Summarize key sections for user

### 7. Update Task Progress

**When to use**: User says "update task X progress", "mark acceptance criteria Y as done"

**Action**:
1. Use `Read` to get current task content
2. Use `Edit` to update checkboxes: `- [ ]` → `- [x]`
3. Optionally add notes about progress in Technical Notes section

## Project Context

**TaskBridge Details**:
- Next.js 15 app with Supabase backend
- TypeScript + Tailwind CSS + NextUI + Radix UI
- Multilingual (EN/BG/RU) with i18n
- Feature-based architecture in `/src/features/`

**Common Task Types**:
- UI/UX improvements (forms, pages, components)
- Feature implementations (notifications, messaging, etc.)
- Database schema changes (migrations, RLS policies)
- Refactoring (component extraction, code organization)
- Infrastructure (deployment, optimization, performance)

## Guidelines

**DO**:
- ✅ Use descriptive task titles
- ✅ Include clear acceptance criteria with checkboxes
- ✅ Add technical implementation details
- ✅ Move completed tasks to `complete_tasks/` directory
- ✅ Keep task scope focused and achievable
- ✅ Update checkboxes as work progresses

**DON'T**:
- ❌ Create tasks without clear deliverables
- ❌ Delete task files (move to complete_tasks instead)
- ❌ Create duplicate tasks
- ❌ Make task descriptions too vague
- ❌ Use git commands directly (per project guidelines)

## Success Criteria

- Task files are properly structured and readable
- Tasks are correctly organized in appropriate directories
- Task progress is tracked via acceptance criteria checkboxes
- Completed work is properly archived in `complete_tasks/`
- Deferred tasks are organized in `todo_tasks/for-later/`

## Examples

**Create task**:
```
User: "Create a task for implementing dark mode"
Assistant: [Creates todo_tasks/implement-dark-mode.md with full template]
```

**Complete task**:
```
User: "We finished the budget unclear option task"
Assistant: [Moves todo_tasks/15-budget-unclear-option.md to complete_tasks/]
```

**Defer task**:
```
User: "Let's do the messaging system later"
Assistant: [Moves todo_tasks/12-persistent-messaging-system.md to todo_tasks/for-later/]
```
