# Performance Debugging Guide

## Quick Tests (Do these first!)

### Test 1: Disable Framer Motion Temporarily
**In Chrome DevTools Console:**
```javascript
// Disable all motion animations
const style = document.createElement('style');
style.textContent = '* { animation: none !important; transition: none !important; }';
document.head.appendChild(style);

// Also disable framer-motion transforms
document.querySelectorAll('[data-framer-motion]').forEach(el => {
  el.style.transform = 'none';
  el.style.transition = 'none';
});
```

**Expected Result**: If scrolling becomes smooth → Motion is the problem

---

### Test 2: Paint Flashing
1. DevTools → **⋮** (three dots) → **More tools** → **Rendering**
2. ✅ Enable **Paint flashing**
3. Scroll slowly
4. Look for green rectangles (repaints)

**What green flashes mean**:
- Whole page flashing = Global repaint issue
- Individual cards flashing = Element-specific issue
- Video area flashing = Video rendering problem

---

### Test 3: Layout Shift Regions
1. DevTools → **Rendering** tab
2. ✅ Enable **Layout Shift Regions**
3. Scroll
4. Blue highlights = Elements causing layout shifts

---

### Test 4: FPS Meter
1. DevTools → **Rendering** tab
2. ✅ Enable **Frame Rendering Stats**
3. Scroll and watch FPS counter
4. Should stay at **60 FPS** (or 120 on high-refresh displays)

**If FPS drops below 30**: Serious performance issue

---

## Deep Profiling (After quick tests)

### Performance Recording
1. DevTools → **Performance** tab
2. Click ⚙️ (gear icon) and enable:
   - ✅ Screenshots
   - ✅ Web Vitals
   - ✅ Enable advanced paint instrumentation (slow)
3. Click **Record** (⏺)
4. Scroll for 3-5 seconds
5. Stop recording
6. Analyze:
   - **Red bars** = Long tasks (>50ms)
   - **Purple bars** = Layout shifts
   - **Green bars** = Paint operations
   - **FPS graph** at top should be smooth

---

### Layers Panel (Compositor Issues)
1. DevTools → **⋮** → **More tools** → **Layers**
2. Scroll and watch layer count
3. High layer count (>50) = Performance problem

**Fix**: Reduce `will-change`, `transform`, `position: fixed` usage

---

## Known Issues in Your Codebase

### 🚨 Issue 1: Excessive Motion Animations
**File**: `src/features/professionals/components/professional-card.tsx:26`

```tsx
// PROBLEM: whileHover triggers on scroll
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}  // ❌ Causes layout reflows
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

**Solution**: Use CSS transforms instead:
```tsx
<div className="hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300">
```

---

### 🚨 Issue 2: Nested Motion Components
**File**: Same file, lines 26 + 48

```tsx
<motion.div whileHover={{ y: -8, scale: 1.02 }}>  // Parent
  <motion.div whileHover={{ scale: 1.1 }}>        // Child ❌ Double animation!
```

**Solution**: Remove nested motion, use one level only

---

### 🚨 Issue 3: Video Background Animations
**File**: `src/components/ui/video-background.tsx:67`

```tsx
<motion.video
  initial={{ opacity: 0 }}
  animate={{ opacity: isVideoLoaded ? 1 : 0 }}  // ❌ May conflict with scroll
  transition={{ duration: 1.5 }}
```

**Solution**: Use CSS opacity transition instead

---

## Performance Optimization Checklist

### High Priority
- [ ] Replace Framer Motion `whileHover` with CSS `:hover` transforms
- [ ] Remove nested motion components
- [ ] Use `will-change: transform` only on elements that actually animate
- [ ] Add `contain: layout` to card components
- [ ] Use `transform: translateZ(0)` to force GPU acceleration

### Medium Priority
- [ ] Lazy load images with `loading="lazy"`
- [ ] Debounce scroll event listeners (if any)
- [ ] Use `IntersectionObserver` for scroll-triggered animations
- [ ] Reduce JavaScript execution during scroll

### Low Priority
- [ ] Optimize image sizes
- [ ] Minify CSS animations
- [ ] Consider removing video background on mobile

---

## Expected Results After Fixes

- **FPS**: Solid 60 FPS during scroll
- **Paint flashing**: Minimal green flashes
- **Layout shifts**: Zero blue highlights
- **User experience**: Butter-smooth scrolling

---

## Monitoring Tools

### Lighthouse Performance Score
```bash
# Run in terminal
npx lighthouse https://task-bridge-chi.vercel.app/en --view
```

Look for:
- **Performance Score** > 90
- **Total Blocking Time** < 200ms
- **Cumulative Layout Shift** < 0.1

### Web Vitals
```bash
npm install -D web-vitals
```

Add to app:
```tsx
// src/app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
  })
}
```

---

## Next Steps

1. Run **Quick Tests** above
2. Share results with me
3. I'll create targeted fixes based on findings
