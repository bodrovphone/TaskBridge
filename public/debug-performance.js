/**
 * Performance Debugging Utilities
 *
 * Copy/paste functions from this file into browser console to debug performance issues
 */

// 1. Disable all animations temporarily
function disableAllAnimations() {
  const style = document.createElement('style');
  style.id = 'debug-disable-animations';
  style.textContent = `
    * {
      animation: none !important;
      transition: none !important;
    }
    [data-framer-motion] {
      transform: none !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ All animations disabled. Scroll to test.');
  console.log('To re-enable: enableAllAnimations()');
}

// 2. Re-enable animations
function enableAllAnimations() {
  const style = document.getElementById('debug-disable-animations');
  if (style) {
    style.remove();
    console.log('✅ Animations re-enabled');
  }
}

// 3. Measure FPS during scroll
function measureScrollFPS(duration = 5000) {
  let frames = 0;
  let lastTime = performance.now();
  let minFPS = Infinity;
  let maxFPS = 0;
  const fpsHistory = [];

  console.log(`📊 Measuring FPS for ${duration/1000} seconds. Start scrolling now!`);

  const measureFrame = () => {
    const currentTime = performance.now();
    const delta = currentTime - lastTime;
    const fps = 1000 / delta;

    frames++;
    fpsHistory.push(fps);
    minFPS = Math.min(minFPS, fps);
    maxFPS = Math.max(maxFPS, fps);
    lastTime = currentTime;

    if (currentTime < startTime + duration) {
      requestAnimationFrame(measureFrame);
    } else {
      const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
      console.log('📊 FPS Results:');
      console.log(`  Average: ${avgFPS.toFixed(2)} FPS`);
      console.log(`  Min: ${minFPS.toFixed(2)} FPS`);
      console.log(`  Max: ${maxFPS.toFixed(2)} FPS`);
      console.log(`  Total Frames: ${frames}`);

      if (avgFPS < 30) {
        console.warn('⚠️ Poor performance detected! Average FPS below 30');
      } else if (avgFPS < 50) {
        console.warn('⚠️ Moderate performance issues. Target is 60 FPS');
      } else {
        console.log('✅ Good performance!');
      }
    }
  };

  const startTime = performance.now();
  requestAnimationFrame(measureFrame);
}

// 4. Highlight elements causing reflows
function highlightReflowElements() {
  const style = document.createElement('style');
  style.id = 'debug-highlight-reflows';
  style.textContent = `
    [data-framer-motion] {
      outline: 2px solid red !important;
      outline-offset: 2px;
    }
    [style*="transform"] {
      outline: 2px solid orange !important;
      outline-offset: 2px;
    }
    [style*="will-change"] {
      outline: 2px solid green !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Highlighting elements:');
  console.log('  🔴 Red outline = Framer Motion elements');
  console.log('  🟠 Orange outline = Inline transforms');
  console.log('  🟢 Green outline = Will-change optimized');
  console.log('To remove: clearHighlights()');
}

// 5. Clear highlights
function clearHighlights() {
  const style = document.getElementById('debug-highlight-reflows');
  if (style) {
    style.remove();
    console.log('✅ Highlights cleared');
  }
}

// 6. Count motion components
function countMotionComponents() {
  const motionElements = document.querySelectorAll('[data-framer-motion]');
  const transformElements = document.querySelectorAll('[style*="transform"]');
  const willChangeElements = document.querySelectorAll('[style*="will-change"]');

  console.log('📊 Motion Components Count:');
  console.log(`  Framer Motion elements: ${motionElements.length}`);
  console.log(`  Elements with transforms: ${transformElements.length}`);
  console.log(`  Elements with will-change: ${willChangeElements.length}`);

  if (motionElements.length > 20) {
    console.warn('⚠️ High number of Framer Motion elements may cause performance issues');
  }

  return {
    motion: motionElements.length,
    transform: transformElements.length,
    willChange: willChangeElements.length
  };
}

// 7. Monitor paint operations
function monitorPaintOps() {
  if (!window.PerformanceObserver) {
    console.error('❌ PerformanceObserver not supported in this browser');
    return;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'paint') {
        console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      }
    }
  });

  observer.observe({ entryTypes: ['paint'] });
  console.log('👀 Monitoring paint operations...');
  console.log('Scroll the page to see paint events in console');
}

// 8. Test scroll jank
function testScrollJank() {
  let scrollCount = 0;
  let jankCount = 0;
  let lastScrollTime = performance.now();

  const handleScroll = () => {
    const currentTime = performance.now();
    const delta = currentTime - lastScrollTime;

    scrollCount++;

    // If more than 50ms between scroll events, it's janky
    if (delta > 50) {
      jankCount++;
      console.warn(`⚠️ Jank detected! ${delta.toFixed(2)}ms between scroll events`);
    }

    lastScrollTime = currentTime;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  console.log('📊 Scroll jank test active. Scroll for 5 seconds...');

  setTimeout(() => {
    window.removeEventListener('scroll', handleScroll);
    const jankPercentage = (jankCount / scrollCount * 100).toFixed(2);

    console.log('📊 Scroll Jank Results:');
    console.log(`  Total scroll events: ${scrollCount}`);
    console.log(`  Janky events: ${jankCount} (${jankPercentage}%)`);

    if (jankPercentage > 20) {
      console.error('❌ High jank rate! Performance issues detected');
    } else if (jankPercentage > 5) {
      console.warn('⚠️ Moderate jank detected');
    } else {
      console.log('✅ Smooth scrolling!');
    }
  }, 5000);
}

// 9. Quick diagnostic
function quickDiagnostic() {
  console.log('🔍 Running quick performance diagnostic...\n');

  // Count components
  const counts = countMotionComponents();

  // Check for heavy elements
  const images = document.querySelectorAll('img');
  const videos = document.querySelectorAll('video');

  console.log(`\n📷 Media Elements:`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Videos: ${videos.length}`);

  // Check for lazy loading
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  console.log(`  Lazy-loaded images: ${lazyImages.length}/${images.length}`);

  // Recommendations
  console.log('\n💡 Recommendations:');

  if (counts.motion > 20) {
    console.warn('  ⚠️ Consider reducing Framer Motion usage');
  }

  if (lazyImages.length < images.length * 0.5) {
    console.warn('  ⚠️ Consider adding loading="lazy" to more images');
  }

  if (videos.length > 0) {
    console.warn('  ⚠️ Videos detected - check if they\'re optimized');
  }

  console.log('\n📚 Available commands:');
  console.log('  disableAllAnimations() - Test without animations');
  console.log('  measureScrollFPS() - Measure scroll performance');
  console.log('  highlightReflowElements() - Show problematic elements');
  console.log('  testScrollJank() - Detect scroll jank');
}

// Auto-run quick diagnostic when loaded
console.log('🚀 Performance debugging tools loaded!');
console.log('Run quickDiagnostic() to start');

// Export for console access
window.debugPerf = {
  disableAllAnimations,
  enableAllAnimations,
  measureScrollFPS,
  highlightReflowElements,
  clearHighlights,
  countMotionComponents,
  monitorPaintOps,
  testScrollJank,
  quickDiagnostic
};

console.log('Access via: window.debugPerf.quickDiagnostic()');
