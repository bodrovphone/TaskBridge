/**
 * Convert Trudify Logo SVG to PNG format (all sizes)
 *
 * - Uses 512x512 master SVG for large/medium sizes (good detail)
 * - Uses simplified 16x16 SVG for tiny sizes (readable "T" letter)
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

// Master SVG (highest resolution)
const masterSvg = path.join(logoDir, 'trudify-logo-512.svg');

// All PNG sizes to generate (32x32 is smallest - browsers downscale if needed)
const sizes = [512, 400, 192, 180, 128, 64, 32];

async function convertLogos() {
  console.log('Converting Trudify logo from master SVG to PNG sizes...\n');

  if (!fs.existsSync(masterSvg)) {
    console.error('❌ Master SVG not found:', masterSvg);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(masterSvg);

  for (const size of sizes) {
    const pngPath = path.join(logoDir, `trudify-logo-${size}.png`);

    try {
      await sharp(svgBuffer, { density: 300 })
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(pngPath);

      console.log(`✅ Created trudify-logo-${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to convert ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 Logo conversion complete!');
  console.log('\nAll PNGs generated from: trudify-logo-512.svg');
  console.log('\nUsage guide:');
  console.log('  • 512x512 - App stores, high-res displays');
  console.log('  • 400x400 - Google Developer Platform');
  console.log('  • 192x192 - Web app manifest (PWA)');
  console.log('  • 180x180 - Apple touch icon');
  console.log('  • 128x128 - Medium icons');
  console.log('  • 64x64   - Standard favicon');
  console.log('  • 32x32   - Browser tab favicon (smallest)');
}

convertLogos().catch(console.error);
