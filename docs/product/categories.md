# Category & Subcategory System

> **Quick Reference**: Categories are stored as locale-independent slugs in the database, with translations managed through i18next keys. Always use utility functions to display translated names.

TaskBridge uses a hierarchical category system with **26 main categories** and **135 subcategories**, fully translated across EN/BG/RU locales.

## Architecture Overview

```
Main Category (e.g., 'handyman')
  └─ Subcategory 1 (e.g., 'plumber')
  └─ Subcategory 2 (e.g., 'electrician')
  └─ Subcategory 3 (e.g., 'locksmith')
  └─ ...

Database: Stores slugs only ('handyman', 'plumber')
UI Display: Shows translated labels ('Handyman', 'Plumber')
```

## Data Storage Locations

| Location | Purpose | Content |
|----------|---------|---------|
| `/src/lib/intl/[lang]/categories.ts` | **Primary source** | Translation keys for all categories |
| `/src/lib/constants/category-visuals.ts` | Visual mapping | Icons & gradient colors per category |
| `/src/features/categories/` | Category utilities | Helper functions & data structures |

## Main Categories (26 Total)

```typescript
// Examples from categories.ts
'categories.main.handyman.title': 'Handyman'
'categories.main.applianceRepair.title': 'Appliance Repair'
'categories.main.webDevelopment.title': 'Web Development'
'categories.main.cleaningServices.title': 'Cleaning Services'
'categories.main.aiServices.title': 'AI Services'
'categories.main.petServices.title': 'Pet Services'
// ... 20 more
```

**All Main Category Slugs**:

`handyman`, `appliance-repair`, `finishing-work`, `construction-work`, `furniture-work`, `cleaning-services`, `logistics`, `household-services`, `pet-services`, `beauty-health`, `auto-repair`, `courier-services`, `digital-marketing`, `ai-services`, `online-advertising`, `advertising-distribution`, `web-development`, `design`, `photo-video`, `tutoring`, `business-services`, `translation-services`, `trainer-services`, `event-planning`, `volunteer-help`, `online-work`

## Subcategories (135 Total)

```typescript
// Examples - Handyman subcategories
'categories.sub.plumber': 'Plumber'
'categories.sub.electrician': 'Electrician'
'categories.sub.locksmith': 'Locksmith'
'categories.sub.carpenter': 'Carpenter'

// Appliance Repair subcategories
'categories.sub.largeApplianceRepair': 'Large Appliance Repair'
'categories.sub.phoneRepair': 'Phone Repair'
'categories.sub.computerHelp': 'Computer Help'
```

**Format**: Translation keys prefixed with `categories.sub.`, stored as kebab-case slugs in database.

## Visual Configuration

Each category has visual branding in `/src/lib/constants/category-visuals.ts`:

```typescript
{
  'plumber': {
    gradient: 'from-blue-500 to-blue-700',  // Tailwind gradient
    icon: Wrench,                            // Lucide icon
  },
  'web-development': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Code,
  }
}
```

**Color Scheme by Domain**:
- **Home & Repair**: Blue tones
- **Delivery & Logistics**: Green tones
- **Personal Services**: Purple tones
- **Professional Services**: Orange tones
- **Learning & Creative**: Pink tones
- **Digital Services**: Indigo tones
- **Translation**: Teal tones
- **Volunteer**: Emerald tones

## How It Works: Slugs vs Translation Keys

### Database Storage (locale-independent)

```typescript
task = {
  category: 'handyman',        // Main category slug
  subcategory: 'plumber'       // Subcategory slug
}

user = {
  service_categories: ['plumber', 'electrician']  // Array of slugs
}
```

### Translation Keys (for display only)

```typescript
'categories.main.handyman.title'      // Main category translation
'categories.main.handyman.description'
'categories.sub.plumber'              // Subcategory translation
```

### Display in UI

```typescript
import { useTranslations } from 'next-intl'
import { getCategoryLabelBySlug } from '@/features/categories'

function TaskCard({ task }) {
  const t = useTranslations()

  // Method 1: Direct translation
  const label = t('categories.sub.plumber')  // Returns: "Plumber" / "Водопроводчик"

  // Method 2: Using utility (recommended)
  const label = getCategoryLabelBySlug(task.subcategory, t)

  return <span>{label}</span>
}
```

## Category Picker Flow

Located: `/src/app/[lang]/create-task/components/category-selection.tsx`

**User Experience**:
1. User sees: "Plumber" (translated via `t('categories.sub.plumber')`)
2. User clicks category chip
3. Form stores: `category: 'handyman'`, `subcategory: 'plumber'` (slugs)
4. Database receives: Locale-independent slugs
5. Display later: Uses translation key to show localized label again

```typescript
const handleSubcategorySelect = (slug: string) => {
  const subcategory = getSubcategoryBySlug(slug)

  // Stores SLUGS in form, not translation keys
  form.setFieldValue('category', subcategory.mainCategoryId)  // 'handyman'
  form.setFieldValue('subcategory', slug)                      // 'plumber'
}
```

## Usage Examples

### Display Category Label

```typescript
import { getCategoryLabelBySlug } from '@/features/categories'

const t = useTranslations()
const label = getCategoryLabelBySlug('plumber', t)  // Returns translated label
```

### Get All Categories for Dropdown

```typescript
import { getMainCategoriesWithSubcategories } from '@/features/categories'

const categories = useMemo(() =>
  getMainCategoriesWithSubcategories(t)
, [t])

// Returns: [{ title: "Handyman", subcategories: [...], icon, color }, ...]
```

### Get Subcategories for Main Category

```typescript
import { getSubcategoriesByMainCategory } from '@/features/categories'

const subs = getSubcategoriesByMainCategory('handyman')
// Returns: [{ slug: 'plumber', translationKey: 'categories.sub.plumber' }, ...]
```

### Get Visual Configuration

```typescript
import { getCategoryVisual } from '@/lib/constants/category-visuals'

const visual = getCategoryVisual('plumber')
// Returns: { gradient: 'from-blue-500 to-blue-700', icon: Wrench }
```

## Adding New Categories

### 1. Add translations to all three languages

```typescript
// /src/lib/intl/en/categories.ts
'categories.main.newCategory.title': 'New Category'
'categories.main.newCategory.description': 'Category description'
'categories.sub.newSubcategory': 'New Subcategory'

// /src/lib/intl/bg/categories.ts
'categories.main.newCategory.title': 'Нова категория'

// /src/lib/intl/ru/categories.ts
'categories.main.newCategory.title': 'Новая категория'
```

### 2. Add to category data structure

```typescript
// /src/features/categories/lib/data.ts
export const MAIN_CATEGORIES = [
  // ... existing categories
  {
    id: 'new-category',
    translationKey: 'categories.main.newCategory',
    subcategories: ['new-subcategory']
  }
]
```

### 3. Add visual configuration

```typescript
// /src/lib/constants/category-visuals.ts
'new-subcategory': {
  gradient: 'from-purple-500 to-purple-700',
  icon: YourIcon,
}
```

### 4. Update database (if needed)

```sql
-- Add CHECK constraint if enforcing valid categories at DB level
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check
  CHECK (category IN ('handyman', 'appliance-repair', ..., 'new-category'));
```

## Important Rules

### NEVER store translation keys in the database

❌ Bad: `category: 'categories.main.handyman'`
✅ Good: `category: 'handyman'`

### ALWAYS use utility functions for display

❌ Bad: Displaying raw slugs to users (`"plumber"`)
✅ Good: Using `getCategoryLabelBySlug()` or `t()` (`"Plumber"`)

### NEVER allow free text category input

❌ Bad: Text input field for categories
✅ Good: Dropdown/chip selection only

## Key Benefits

- **Locale-Independent Database**: Same queries work across all languages
- **Consistent Filtering**: URL filters always use slugs (`?category=plumber`)
- **Easy Translation Updates**: Change translations without touching database
- **Type Safety**: TypeScript ensures valid category slugs
- **SEO Friendly**: Clean, consistent URLs regardless of locale
