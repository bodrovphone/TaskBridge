# Performance Optimization Summary

## Issue Discovered
Scrolling performance degradation causing "blinking" effect across all pages.

## Root Causes Identified

### 1. ✅ FIXED: Excessive Framer Motion `whileHover` Animations
**Problem**: Every card component using `motion.div` with `whileHover` props triggered expensive layout recalculations during scroll.

**Files Fixed**:
- ✅ `src/features/professionals/components/professional-card.tsx`

**Changes Made**:
```tsx
// BEFORE (slow)
<motion.div whileHover={{ y: -8, scale: 1.02 }}>

// AFTER (fast)
<div className="hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300 will-change-transform">
```

### 2. ✅ FIXED: Nested Motion Components
**Problem**: Double animations causing layout thrashing
- Parent motion with `whileHover`
- Child motion with different `whileHover`

**Solution**: Replaced nested motion with CSS-only transforms

### 3. ✅ FIXED: Category Chip Animations
**Problem**: `motion.div` with `initial`/`animate` props on every chip

**Solution**: Used Tailwind's `animate-in` utilities with delays:
```tsx
<div className="animate-in fade-in zoom-in duration-300"
     style={{ animationDelay: `${index * 0.1}s` }}>
```

### 4. ⚠️ TO INVESTIGATE: Video Background
**User Report**: "Blinking appears on pages without video too"

**Potential Issues**:
- Video opacity transitions during scroll
- Background gradients causing repaints
- AnimatePresence wrapper overhead

**Next Steps**:
- Test video component in isolation
- Check for layout shifts in video container
- Consider lazy-loading video only when in viewport

---

## Optimization Techniques Applied

### CSS Transforms (GPU Accelerated)
```css
/* Use these instead of Framer Motion for list items */
.card {
  transition: transform 0.3s ease-out;
  will-change: transform;
}
.card:hover {
  transform: translateY(-8px) scale(1.02);
}
```

### Layout Containment
```css
/* Prevent reflow cascades */
.card {
  contain: layout style paint;
}
```

### Tailwind Utilities Used
- `hover:-translate-y-2` - Vertical lift on hover
- `hover:scale-[1.02]` - Subtle scale effect
- `transition-transform` - Smooth transform transitions
- `will-change-transform` - GPU acceleration hint
- `animate-in fade-in zoom-in` - Entry animations

---

## Performance Best Practices Going Forward

### ✅ DO Use Framer Motion For:
1. **Page transitions** - Only happen once
2. **Modal/Dialog animations** - Removed from DOM when closed
3. **One-time entrance animations** - Initial page load
4. **Complex orchestrated sequences** - Worth the cost

### ❌ DON'T Use Framer Motion For:
1. **Card hover effects** in lists - Use CSS transforms
2. **Button hover states** - Use CSS `:hover`
3. **Scroll-triggered animations** - Use IntersectionObserver + CSS
4. **List item animations** during scroll - Too expensive

### Performance Checklist for New Components

#### Before Adding Animation:
- [ ] Is this element in a scrollable list? → Use CSS
- [ ] Does this animate on hover? → Use CSS
- [ ] Is this a one-time entrance? → Framer Motion OK
- [ ] Will there be 10+ instances on screen? → Use CSS

#### CSS Animation Pattern:
```tsx
// Fast pattern for list items
<div className="group hover:-translate-y-2 transition-transform duration-300">
  <div className="group-hover:scale-110 transition-transform">
    {/* Nested animations use group-hover */}
  </div>
</div>
```

#### GPU Acceleration Hints:
```tsx
// Add to elements that animate frequently
className="will-change-transform"

// Or in CSS
.animated-element {
  will-change: transform;
  transform: translateZ(0); /* Force GPU layer */
}
```

---

## Remaining Optimizations TODO

### High Priority
- [ ] Investigate video background component performance
- [ ] Add `contain: layout` to all card components
- [ ] Optimize remaining motion components (see grep results)
- [ ] Test on low-end devices

### Medium Priority
- [ ] Lazy load images with `loading="lazy"` (already done in TaskCard)
- [ ] Add IntersectionObserver for entrance animations
- [ ] Debounce any scroll event listeners
- [ ] Reduce JavaScript execution during scroll

### Low Priority
- [ ] Consider removing video background on mobile entirely
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize bundle size (code splitting)

---

## Components Still Using Framer Motion

Run this to find them:
```bash
grep -r "motion\." src/ --include="*.tsx" | wc -l
```

**Files to audit**:
- `src/features/professionals/components/professionals-page.tsx` - Has many motion components
- `src/components/common/category-search.tsx` - Motion animations
- `src/features/browse-tasks/components/sections/*.tsx` - Various motion uses
- `src/components/ui/video-background.tsx` - Video with motion.video
- `src/components/ui/sorting-picker.tsx` - Dropdown animations
- And more (see grep results in debugging guide)

---

## Expected Performance After All Fixes

### Metrics to Test:
1. **FPS during scroll**: Should be solid 60 FPS (or 120 on high-refresh)
2. **Paint flashing**: Minimal green flashes in DevTools
3. **Layout shifts**: Zero CLS (Cumulative Layout Shift)
4. **Lighthouse Performance**: >90 score

### User Experience:
- ✅ Butter-smooth scrolling on all pages
- ✅ Responsive hover effects with no lag
- ✅ Animations feel intentional, not janky
- ✅ Works well on mid-range devices

---

## Testing Protocol

### After Each Optimization:
1. Clear browser cache
2. Test on staging: https://task-bridge-chi.vercel.app/en
3. Open DevTools Performance tab
4. Record 5 seconds of scrolling
5. Check for:
   - Long tasks (>50ms)
   - Paint operations frequency
   - FPS drops
6. Enable Paint Flashing and scroll
7. Verify smooth experience

### Cross-Browser Testing:
- Chrome (primary)
- Safari (WebKit can behave differently)
- Firefox (different rendering engine)
- Mobile Safari (iOS performance)
- Chrome Mobile (Android performance)

---

## Notes

- Motion animations are beautiful but expensive
- CSS transforms are 10-100x faster than Framer Motion for simple effects
- Always profile before and after changes
- "Will-change" should be used sparingly - only on elements that actually animate
- Keep Framer Motion import for special cases, just use it wisely
