# Customer Statistics - Computed Fields

## Task Description
Add computed statistics for customer profiles that aggregate data from tasks table.

## Fields Needed (Maybe - evaluate for MVP)
- `tasksPosted`: COUNT from tasks table where customer_id = user.id
- `totalSpent`: SUM of completed task payments (needs payment tracking first)

## Implementation Options
1. **Query on-demand**: Calculate when profile loads (slower, always accurate)
2. **Cached counters**: Update via database triggers (faster, more complex)
3. **Skip for MVP**: Don't show these stats initially

## Recommendation
**Skip for MVP** - These are "nice to have" stats, not core functionality.

## Priority
Low - Evaluate if actually needed

## Dependencies
- Payment system implementation (for totalSpent)
- Decision on caching strategy
