# Task 15: Default Images/Placeholders for Tasks Without Photos

## Task Description
Implement visually appealing default images for tasks that don't have photos uploaded. Use a hybrid approach with gradient backgrounds + category-specific icons.

## Requirements
- Display gradient background with icon when task has no photos
- Each category should have distinct visual identity (color + icon)
- Fast loading (no image downloads, pure CSS)
- Consistent with existing design system
- Works in both task cards (browse page) and task detail page

## Acceptance Criteria
- [ ] Create utility function that maps categories to gradients + icons
- [ ] Implement default image component with gradient + icon
- [ ] Update TaskCard to show default image when no photos
- [ ] Update TaskGallery to show default image when no photos
- [ ] Map all ~25 main categories to colors and icons
- [ ] Test with tasks that have no photos
- [ ] Ensure consistent appearance across all pages
- [ ] Verify performance (no degradation)

## Technical Approach

### 1. Create Category Visual Mapping
```typescript
// /lib/constants/category-visuals.ts
import { Wrench, Sparkles, Package, Car, Dog, /* ... */ } from 'lucide-react'

export const categoryVisuals = {
  // Home & Repair (Blue tones)
  'handyman': {
    gradient: 'from-blue-500 to-blue-600',
    icon: Wrench,
  },
  'appliance-repair': {
    gradient: 'from-blue-400 to-blue-500',
    icon: Settings,
  },

  // Cleaning & Personal (Purple tones)
  'cleaning-services': {
    gradient: 'from-purple-500 to-purple-600',
    icon: Sparkles,
  },
  'pet-services': {
    gradient: 'from-purple-400 to-purple-500',
    icon: Dog,
  },

  // Delivery & Logistics (Green tones)
  'courier-services': {
    gradient: 'from-green-500 to-green-600',
    icon: Package,
  },
  'logistics': {
    gradient: 'from-green-400 to-green-500',
    icon: Truck,
  },

  // Professional Services (Orange tones)
  'business-services': {
    gradient: 'from-orange-500 to-orange-600',
    icon: Briefcase,
  },

  // Learning & Creative (Pink tones)
  'tutoring': {
    gradient: 'from-pink-500 to-pink-600',
    icon: BookOpen,
  },

  // Digital Services (Indigo tones)
  'web-development': {
    gradient: 'from-indigo-500 to-indigo-600',
    icon: Code,
  },

  // Default fallback
  'other': {
    gradient: 'from-gray-500 to-gray-600',
    icon: FileText,
  },
}
```

### 2. Create DefaultTaskImage Component
```typescript
// /components/ui/default-task-image.tsx
'use client'

import { categoryVisuals } from '@/lib/constants/category-visuals'

interface DefaultTaskImageProps {
  category: string
  className?: string
}

export default function DefaultTaskImage({ category, className = '' }: DefaultTaskImageProps) {
  const visual = categoryVisuals[category] || categoryVisuals.other
  const Icon = visual.icon

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} ${className}`}>
      {/* Subtle diagonal pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
        }}
      />

      {/* Large icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-24 h-24 text-white opacity-20" strokeWidth={1.5} />
      </div>
    </div>
  )
}
```

### 3. Update TaskCard Component
```typescript
// In task-card.tsx
{task.photos && task.photos.length > 0 ? (
  <Image
    src={task.photos[0]}
    alt={task.title}
    width={400}
    height={192}
    className="w-full h-full object-cover"
  />
) : (
  <DefaultTaskImage category={task.category} className="w-full h-48" />
)}
```

### 4. Update TaskGallery Component
```typescript
// In task-gallery.tsx
if (!photos || photos.length === 0) {
  return <DefaultTaskImage category={task.category} className="h-64 md:h-80 rounded-lg" />
}
```

### 5. Map All Categories
Complete the mapping for all main categories:
- handyman
- appliance-repair
- finishing-work
- furniture-work
- construction-work
- auto-repair
- courier-services
- logistics
- pet-services
- beauty-health
- cleaning-services
- household-services
- business-services
- event-planning
- advertising-distribution
- tutoring
- trainer-services
- photo-video
- design
- web-development
- digital-marketing
- online-advertising
- ai-services
- translation-services
- volunteer-help

## Design Benefits
- **Fast**: No image downloads, pure CSS gradients
- **Distinctive**: Each category has unique color + icon identity
- **Professional**: Modern gradients look polished
- **Scalable**: Easy to add new categories
- **Accessible**: High contrast, works with screen readers
- **Performance**: No bandwidth or caching concerns

## Priority
Medium - Not blocking MVP but improves user experience significantly

## Estimated Time
~2-3 hours
- 1 hour: Create mapping for all categories
- 30 min: Create DefaultTaskImage component
- 30 min: Update TaskCard and TaskGallery
- 30 min: Testing and refinement

## Dependencies
- None - can be implemented independently

## Related Files
- `/lib/constants/category-visuals.ts` (new)
- `/components/ui/default-task-image.tsx` (new)
- `/components/ui/task-card.tsx` (update)
- `/app/[lang]/tasks/[id]/components/task-gallery.tsx` (update)
