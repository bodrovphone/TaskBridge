# Top Professionals Ranking & Featured System

## Task Description
Implement a ranking system that rewards active professionals with badges and visibility. Early adopters and top performers get featured placement and are suggested for direct invitations during task creation. Telegram connection is required to unlock these perks, driving platform engagement.

## Requirements

### 1. Top Professional Badge
- Professionals who complete **3+ tasks per month** earn "Top Professional" badge
- Badge displayed prominently on profile and in search results
- Monthly calculation (reset each month, re-earned based on performance)
- **Launch Period**: Lower threshold to 2 tasks/month for first 3 months
- Badge levels (future consideration):
  - Bronze: 3+ tasks/month
  - Silver: 5+ tasks/month
  - Gold: 10+ tasks/month

### 2. Featured Professionals List
- **Who qualifies**:
  - First 10 registered professionals per category (Early Adopters)
  - Current Top Professionals (3+ tasks last month)
  - Pro subscribers (from premium features task)
- **Where displayed**:
  - Homepage "Featured Professionals" section
  - Category pages hero section
  - Browse professionals filters ("Show Featured Only")
- **Rotation**: Featured list shuffled daily for fairness

### 3. Task Creation Invitations
- When customer creates a task, suggest relevant professionals to invite
- **Suggestion Priority**:
  1. Top Professionals in the category (highest priority)
  2. Early Adopters in the category
  3. Pro subscribers
  4. Professionals with high ratings (4.5+)
- Display as "Recommended Professionals" during task creation
- Customer can send direct invitation (notification to professional)
- Invited professionals see task in "Invitations" tab

### 4. Telegram Connection Requirement
**Critical**: All above perks require Telegram to be connected

- **Perks locked until Telegram connected**:
  - Top Professional badge display
  - Featured list inclusion
  - Receiving task invitations
  - Early Adopter benefits (from previous task)

- **Motivation messaging**:
  - "Connect Telegram to unlock your Top Professional badge"
  - "Get instant task invitations via Telegram"
  - "Featured professionals receive 3x more task offers"
  - Progress bar: "Complete your profile: Connect Telegram to unlock perks"

- **Telegram connection benefits displayed**:
  - Instant notifications (vs delayed email)
  - Direct task invitations
  - Top Professional badge eligibility
  - Featured placement eligibility
  - Priority in search results

## Database Schema Changes

```sql
-- Professional performance tracking
CREATE TABLE professional_monthly_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- Format: '2025-01'
  tasks_completed INT DEFAULT 0,
  tasks_accepted INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  response_rate DECIMAL(5,2), -- % of applications responded to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, year_month)
);

-- Badge tracking
CREATE TABLE professional_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'top_professional', 'early_adopter', 'verified', etc.
  badge_level TEXT, -- 'bronze', 'silver', 'gold' for top_professional
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for permanent badges
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(professional_id, badge_type)
);

-- Task invitations
CREATE TABLE task_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'applied', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  UNIQUE(task_id, professional_id)
);

-- Add to users table
ALTER TABLE users ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN featured_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN last_badge_calculation TIMESTAMPTZ;
```

## Acceptance Criteria

### Top Professional Badge
- [ ] Track completed tasks per professional per month
- [ ] Award badge when threshold reached (3+ tasks, 2+ during launch)
- [ ] Badge displays on profile page
- [ ] Badge displays in search results/cards
- [ ] Badge expires if not maintained next month
- [ ] Only visible if Telegram is connected

### Featured Professionals
- [ ] Featured section on homepage
- [ ] Featured section on category pages
- [ ] "Featured" filter in browse professionals
- [ ] Daily rotation/shuffle of featured order
- [ ] Featured status requires Telegram connection

### Task Invitations
- [ ] Suggest professionals during task creation (step 2 or 3)
- [ ] Priority algorithm implemented correctly
- [ ] Customer can select professionals to invite
- [ ] Invitation sent via Telegram notification
- [ ] Professional sees invitation in dedicated tab
- [ ] Invitation status tracking (pending/viewed/applied/declined)

### Telegram Requirement
- [ ] Perks locked UI for non-Telegram users
- [ ] Clear messaging about benefits of connecting
- [ ] Easy Telegram connection flow from lock screen
- [ ] Profile completion indicator includes Telegram
- [ ] Perks activate immediately after Telegram connection

## Technical Notes

### Monthly Badge Calculation (Cron Job)
```typescript
// Run daily at midnight
async function calculateTopProfessionalBadges() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const threshold = isLaunchPeriod() ? 2 : 3;

  // Get all professionals with enough completed tasks
  const topProfessionals = await db.query(`
    SELECT professional_id, tasks_completed
    FROM professional_monthly_stats
    WHERE year_month = $1
    AND tasks_completed >= $2
  `, [currentMonth, threshold]);

  for (const pro of topProfessionals) {
    // Only award if Telegram connected
    const user = await getUser(pro.professional_id);
    if (!user.telegram_id) continue;

    await upsertBadge({
      professional_id: pro.professional_id,
      badge_type: 'top_professional',
      badge_level: getBadgeLevel(pro.tasks_completed),
      expires_at: endOfMonth(new Date()),
      is_active: true
    });
  }
}

function getBadgeLevel(tasksCompleted: number): string {
  if (tasksCompleted >= 10) return 'gold';
  if (tasksCompleted >= 5) return 'silver';
  return 'bronze';
}
```

### Professional Suggestion Algorithm
```typescript
interface SuggestedProfessional {
  user: User;
  score: number;
  reasons: string[]; // "Top Professional", "Early Adopter", etc.
}

async function getSuggestedProfessionals(
  category: string,
  city?: string,
  limit = 5
): Promise<SuggestedProfessional[]> {
  const professionals = await db.query(`
    SELECT u.*,
           pb.badge_type,
           pms.tasks_completed,
           u.category_registration_order->$1 as category_order
    FROM users u
    LEFT JOIN professional_badges pb ON u.id = pb.professional_id
    LEFT JOIN professional_monthly_stats pms ON u.id = pms.professional_id
    WHERE u.is_professional = true
    AND u.professional_categories @> ARRAY[$1]
    AND u.telegram_id IS NOT NULL  -- Required!
    ${city ? 'AND u.city = $2' : ''}
    ORDER BY
      CASE WHEN pb.badge_type = 'top_professional' THEN 0 ELSE 1 END,
      CASE WHEN (u.category_registration_order->$1)::int <= 10 THEN 0 ELSE 1 END,
      CASE WHEN u.is_pro_subscriber THEN 0 ELSE 1 END,
      u.average_rating DESC NULLS LAST
    LIMIT $3
  `, [category, city, limit].filter(Boolean));

  return professionals.map(p => ({
    user: p,
    score: calculateScore(p),
    reasons: getReasons(p)
  }));
}
```

### Telegram Lock Component
```typescript
interface TelegramLockProps {
  feature: 'badge' | 'featured' | 'invitations';
  children: React.ReactNode;
}

function TelegramLock({ feature, children }: TelegramLockProps) {
  const { user } = useAuth();

  if (user?.telegram_id) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="p-6 text-center max-w-sm">
          <TelegramIcon className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="font-semibold mb-2">
            {t(`telegram.unlock.${feature}.title`)}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t(`telegram.unlock.${feature}.description`)}
          </p>
          <TelegramLoginButton />
        </Card>
      </div>
    </div>
  );
}
```

## UI Components to Create

1. `TopProfessionalBadge` - Badge with level indicator (bronze/silver/gold)
2. `EarlyAdopterBadge` - Special badge for first 10 per category
3. `FeaturedProfessionalsSection` - Homepage/category featured carousel
4. `ProfessionalSuggestionPicker` - Task creation invitation selector
5. `InvitationsTab` - Professional's received invitations
6. `TelegramLockOverlay` - Blur overlay with connect CTA
7. `ProfileCompletionBar` - Shows Telegram connection status
8. `BadgeShowcase` - Display all earned badges on profile

## Translation Keys Required

```typescript
// Add to professionals.ts
'professionals.badge.topProfessional': 'Top Professional',
'professionals.badge.topProfessional.bronze': 'Top Professional',
'professionals.badge.topProfessional.silver': 'Top Professional (Silver)',
'professionals.badge.topProfessional.gold': 'Top Professional (Gold)',
'professionals.badge.earned': 'Earned by completing {count}+ tasks this month',

'professionals.featured.title': 'Featured Professionals',
'professionals.featured.filter': 'Show Featured Only',
'professionals.featured.why': 'Why am I featured?',

'professionals.invitations.title': 'Task Invitations',
'professionals.invitations.empty': 'No invitations yet',
'professionals.invitations.invited': 'You were invited to apply',
'professionals.invitations.viewTask': 'View Task',

// Add to tasks.ts
'createTask.inviteProfessionals': 'Invite Professionals',
'createTask.inviteProfessionals.description': 'Suggest this task directly to top professionals',
'createTask.inviteProfessionals.recommended': 'Recommended for You',
'createTask.inviteProfessionals.selected': '{count} professionals will be notified',

// Add to common.ts or new telegram.ts
'telegram.unlock.badge.title': 'Unlock Your Badge',
'telegram.unlock.badge.description': 'Connect Telegram to display your Top Professional badge',
'telegram.unlock.featured.title': 'Get Featured',
'telegram.unlock.featured.description': 'Connect Telegram to appear in Featured Professionals',
'telegram.unlock.invitations.title': 'Receive Invitations',
'telegram.unlock.invitations.description': 'Connect Telegram to get direct task invitations',
'telegram.benefits.instant': 'Instant notifications',
'telegram.benefits.invitations': 'Direct task invitations',
'telegram.benefits.badge': 'Top Professional badge',
'telegram.benefits.featured': 'Featured placement',
```

## Priority
High - Core engagement and retention feature, drives Telegram adoption

## Dependencies
- Telegram authentication (already implemented)
- Professional premium features task (early adopter logic shared)
- Task completion tracking (needs to update monthly stats)

## Future Considerations
- Leaderboard page showing top professionals by category
- Monthly "Professional of the Month" recognition
- Push notifications for badge earned/lost
- Analytics dashboard for professionals (views, invitations, conversion)
- Seasonal badges (holiday specials)
- Referral bonuses for top professionals
