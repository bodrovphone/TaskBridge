# Vercel Speed Insights Integration

## Task Description
Add Vercel Speed Insights to TaskBridge for real-time performance monitoring. This provides Real User Monitoring (RUM) data to track Core Web Vitals and identify performance bottlenecks in production.

## Requirements
- Install `@vercel/speed-insights` package
- Add SpeedInsights component to root layout
- Verify metrics appear in Vercel dashboard

## Acceptance Criteria
- [ ] Package installed: `npm i @vercel/speed-insights`
- [ ] SpeedInsights component added to root layout
- [ ] Metrics visible at https://vercel.com/bodrovphones-projects/task-bridge/speed-insights
- [ ] No impact on page load performance (component loads async)

## Implementation

### 1. Install Package
```bash
npm i @vercel/speed-insights
```

### 2. Add to Root Layout
```typescript
// /src/app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 3. Configuration Options (Optional)
```typescript
// Custom sample rate (default: 100% in production)
<SpeedInsights sampleRate={0.5} />

// Debug mode for local testing
<SpeedInsights debug={true} />

// Custom route tracking
<SpeedInsights route={pathname} />
```

## Metrics Tracked
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response time
- **INP** (Interaction to Next Paint) - Responsiveness

## Technical Notes
- SpeedInsights only runs in production (Vercel deployments)
- No data collected in development mode
- Automatically integrates with Vercel Analytics dashboard
- Zero configuration needed for basic setup
- Component is tree-shaken in development builds

## Related Documentation
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- Project Dashboard: https://vercel.com/bodrovphones-projects/task-bridge/speed-insights

## Priority
**Low** - Nice to have for performance monitoring, not blocking any features

## Dependencies
- None (Vercel deployment already configured)

## Estimated Effort
- 10 minutes
