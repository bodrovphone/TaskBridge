#!/usr/bin/env node
/**
 * Critical CSS Extraction Script
 *
 * This script processes the Next.js build output to inline critical CSS
 * for above-the-fold content, significantly improving LCP and FCP.
 *
 * Usage: node scripts/critical-css.js
 * Or add to package.json: "postbuild": "node scripts/critical-css.js"
 */

const Critters = require('critters');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BUILD_DIR = path.join(process.cwd(), '.next');
const SERVER_DIR = path.join(BUILD_DIR, 'server', 'app');

async function processCriticalCSS() {
  console.log('🎨 Starting critical CSS extraction...\n');

  // Initialize Critters
  const critters = new Critters({
    // Inline critical CSS
    inlineThreshold: 0,
    // Don't remove the original link tags, just add preload
    pruneSource: false,
    // Reduce unused CSS
    reduceInlineStyles: true,
    // Merge inlined styles
    mergeStylesheets: true,
    // Add preload hints for external CSS
    preload: 'swap',
    // Include keyframes in critical CSS
    keyframes: 'critical',
    // Compress the inlined CSS
    compress: true,
    // Log what's happening
    logLevel: 'info',
  });

  // Find all HTML files in the build output
  const htmlFiles = glob.sync('**/*.html', {
    cwd: SERVER_DIR,
    absolute: true,
  });

  if (htmlFiles.length === 0) {
    console.log('⚠️  No HTML files found. Make sure to run "npm run build" first.\n');
    console.log('Note: Next.js App Router generates .rsc files, not .html files.');
    console.log('Critical CSS extraction works best with static export.\n');
    return;
  }

  console.log(`📄 Found ${htmlFiles.length} HTML files to process\n`);

  let processed = 0;
  let failed = 0;

  for (const htmlFile of htmlFiles) {
    try {
      const html = fs.readFileSync(htmlFile, 'utf-8');
      const result = await critters.process(html);
      fs.writeFileSync(htmlFile, result);
      processed++;
      console.log(`✅ ${path.relative(SERVER_DIR, htmlFile)}`);
    } catch (error) {
      failed++;
      console.error(`❌ ${path.relative(SERVER_DIR, htmlFile)}: ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processed}`);
  console.log(`   Failed: ${failed}`);
  console.log('\n✨ Critical CSS extraction complete!\n');
}

// Alternative approach: Process CSS files directly to create a critical CSS file
async function extractCriticalStyles() {
  console.log('🎨 Extracting critical styles for manual inlining...\n');

  const CSS_DIR = path.join(BUILD_DIR, 'static', 'css');

  if (!fs.existsSync(CSS_DIR)) {
    console.log('⚠️  No CSS directory found. Run "npm run build" first.\n');
    return;
  }

  const cssFiles = glob.sync('*.css', { cwd: CSS_DIR, absolute: true });

  if (cssFiles.length === 0) {
    console.log('⚠️  No CSS files found.\n');
    return;
  }

  // Critical selectors for above-the-fold content
  // These are the minimum styles needed for initial render
  const criticalSelectors = [
    // Layout
    'html', 'body', '.min-h-screen', '.flex', '.flex-col', '.flex-1',
    '.overflow-x-hidden', '.w-full', '.max-w-full', '.relative', '.absolute',
    '.fixed', '.inset-0', '.z-10', '.z-20',

    // Grid
    '.grid', '.gap-', '.lg\\:grid-cols-',

    // Spacing
    '.px-4', '.py-', '.pt-', '.pb-', '.p-', '.mx-auto', '.space-y-',

    // Typography
    '.text-', '.font-', '.leading-', '.tracking-',

    // Colors & Backgrounds
    '.bg-', '.text-slate-', '.text-gray-', '.text-white',

    // Borders & Shadows
    '.border', '.rounded-', '.shadow-',

    // Buttons
    '.btn', 'button', '[type="button"]',

    // Header
    '.navbar', 'header', 'nav',

    // Hero
    '.hero', 'h1', '.h-20',

    // Images
    'img', '.object-cover', '.object-center',

    // Visibility
    '.hidden', '.lg\\:hidden', '.lg\\:block', '.sr-only',
  ];

  let totalCss = '';
  let criticalCss = '';

  for (const cssFile of cssFiles) {
    const css = fs.readFileSync(cssFile, 'utf-8');
    totalCss += css;
  }

  console.log(`📦 Total CSS size: ${(totalCss.length / 1024).toFixed(1)}KB`);

  // Simple extraction based on selectors
  // Note: For production, use a proper CSS AST parser
  const lines = totalCss.split('\n');
  let inRule = false;
  let currentRule = '';
  let braceCount = 0;

  for (const line of lines) {
    if (!inRule) {
      // Check if this line starts a rule we care about
      const isCritical = criticalSelectors.some(sel => {
        const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^[.#]?${escaped}`, 'i').test(line.trim());
      });

      if (isCritical || line.includes(':root') || line.includes('@keyframes')) {
        inRule = true;
        currentRule = line;
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount === 0 && line.includes('}')) {
          criticalCss += currentRule + '\n';
          inRule = false;
          currentRule = '';
        }
      }
    } else {
      currentRule += '\n' + line;
      braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

      if (braceCount <= 0) {
        criticalCss += currentRule + '\n';
        inRule = false;
        currentRule = '';
        braceCount = 0;
      }
    }
  }

  // Write critical CSS to a file
  const criticalPath = path.join(process.cwd(), 'public', 'critical.css');
  fs.writeFileSync(criticalPath, criticalCss);

  console.log(`✨ Critical CSS extracted: ${(criticalCss.length / 1024).toFixed(1)}KB`);
  console.log(`📄 Saved to: ${criticalPath}`);
  console.log('\n💡 To use: Add <style> tag with critical.css content in _document.tsx or layout.tsx');
}

// Run the script
(async () => {
  const args = process.argv.slice(2);

  if (args.includes('--extract')) {
    await extractCriticalStyles();
  } else {
    await processCriticalCSS();
  }
})();
