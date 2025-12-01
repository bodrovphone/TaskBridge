/**
 * Convert Trudify Logo SVGs to PNG format
 *
 * Usage:
 *   npm install sharp --save-dev
 *   node scripts/convert-logos-to-png.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoDir = path.join(__dirname, '../public/images/logo');

const sizes = [512, 400, 192, 180, 128, 64, 32, 16];

async function convertLogos() {
  console.log('Converting Trudify logos from SVG to PNG...\n');

  for (const size of sizes) {
    const svgPath = path.join(logoDir, `trudify-logo-${size}.svg`);
    const pngPath = path.join(logoDir, `trudify-logo-${size}.png`);

    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  Skipping ${size}x${size} - SVG not found`);
      continue;
    }

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✅ Created trudify-logo-${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to convert ${size}x${size}:`, error.message);
    }
  }

  // Also create favicon.ico from 32x32
  try {
    const favicon32 = path.join(logoDir, 'trudify-logo-32.png');
    const faviconIco = path.join(__dirname, '../public/favicon.ico');

    if (fs.existsSync(favicon32)) {
      await fs.promises.copyFile(favicon32, faviconIco.replace('.ico', '.png'));
      console.log('\n✅ Created favicon.png (rename to .ico or use as-is)');
    }
  } catch (error) {
    console.error('❌ Failed to create favicon:', error.message);
  }

  console.log('\n🎉 Logo conversion complete!');
  console.log('\nFile locations:');
  console.log('  • public/images/logo/trudify-logo-*.png');
  console.log('\nUsage guide:');
  console.log('  • 512x512 - App stores, high-res displays');
  console.log('  • 400x400 - Google Developer Platform');
  console.log('  • 192x192 - Web app manifest (PWA)');
  console.log('  • 180x180 - Apple touch icon');
  console.log('  • 128x128 - Medium icons');
  console.log('  • 64x64   - Standard favicon');
  console.log('  • 32x32   - Browser tab favicon');
  console.log('  • 16x16   - Smallest favicon');
}

convertLogos().catch(console.error);
