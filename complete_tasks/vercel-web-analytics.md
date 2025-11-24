# Vercel Web Analytics Integration

## Task Description
Add Vercel Web Analytics to TaskBridge for traffic monitoring. This provides privacy-friendly visitor tracking without cookies, GDPR banners, or performance impact.

## Why Vercel Analytics (not Google Analytics)
- **44x smaller** than Google Analytics - no performance degradation
- **25-35% more accurate** - not blocked by ad blockers
- **No cookies** - no GDPR consent banner needed
- **Free** - included with Vercel plan
- **Simple setup** - one component, no configuration

## Requirements
- Install `@vercel/analytics` package
- Add Analytics component to root layout
- Verify data appears in Vercel dashboard

## Acceptance Criteria
- [ ] Package installed: `npm i @vercel/analytics`
- [ ] Analytics component added to root layout
- [ ] Traffic data visible at https://vercel.com/bodrovphones-projects/task-bridge/analytics
- [ ] No cookies added (verify in DevTools)
- [ ] No performance impact (verify with Lighthouse)

## Implementation

### 1. Install Package
```bash
npm i @vercel/analytics
```

### 2. Add to Root Layout
```typescript
// /src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Optional: Custom Event Tracking
```typescript
import { track } from '@vercel/analytics'

// Track custom events (e.g., task creation, application submit)
track('task_created', { category: 'handyman' })
track('application_submitted', { taskId: '123' })
```

## Metrics Available
- **Visitors** - Unique visitors (daily hash, privacy-friendly)
- **Page Views** - Total and per-page breakdown
- **Referrers** - Where traffic comes from (Google, Facebook, direct, etc.)
- **Countries** - Geographic distribution
- **Devices** - Desktop vs mobile vs tablet
- **Browsers** - Chrome, Safari, Firefox, etc.
- **OS** - Windows, macOS, iOS, Android
- **Bounce Rate** - Single-page session percentage

## Dashboard Location
https://vercel.com/bodrovphones-projects/task-bridge/analytics

## Technical Notes
- Only runs in production (Vercel deployments)
- No data collected in development mode
- Privacy-friendly: uses hashed request data, resets daily
- No cross-site tracking possible
- Component is tree-shaken in development builds

## Future Enhancements (Optional)
- [ ] Add custom event tracking for key user actions
- [ ] Track task creation funnel
- [ ] Track application submission events
- [ ] Monitor search/filter usage

## Related
- `vercel-speed-insights.md` - Performance monitoring (Core Web Vitals)
- Both can be added together in the same layout

## Documentation
- https://vercel.com/docs/analytics
- https://vercel.com/docs/analytics/quickstart

## Priority
**Low** - Nice to have for traffic insights, not blocking any features

## Estimated Effort
- 5 minutes
