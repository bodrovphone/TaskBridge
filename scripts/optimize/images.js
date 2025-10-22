const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminAvif = require('imagemin-avif');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const chalk = require('chalk');

/**
 * Get file size in KB
 * @param {string} filePath - Path to file
 * @returns {number} File size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

/**
 * Optimize a single image file
 * @param {string} inputPath - Input image path
 * @param {Object} config - Configuration object
 * @param {boolean} dryRun - If true, only simulate without writing files
 * @returns {Object} Optimization results
 */
async function optimizeImage(inputPath, config, dryRun = false) {
  const startTime = Date.now();
  const originalSize = getFileSizeKB(inputPath);
  const results = {
    original: inputPath,
    originalSize,
    optimizedSize: 0,
    totalVariantsSize: 0,  // Total size of all variants
    savings: 0,
    savingsPercent: 0,
    outputs: [],
    error: null,
  };

  try {
    // Ensure output directory exists
    if (!dryRun && !fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);
    const inputDir = path.dirname(inputPath);

    // Determine output directory (preserve original if config says so)
    const outputDir = config.preserveOriginal ? config.outputDir : inputDir;

    // Read image metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Process each size variant
    for (const size of config.sizes) {
      // Only resize if image is larger than target size
      if (metadata.width <= size) {
        continue;
      }

      const resized = sharp(inputPath).resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });

      // Generate each format
      for (const format of config.formats) {
        const outputFilename = `${basename}-${size}w.${format}`;
        const outputPath = path.join(outputDir, outputFilename);

        if (!dryRun) {
          // Use Sharp for WebP and AVIF
          if (format === 'webp') {
            await resized
              .clone()
              .webp({ quality: config.quality })
              .toFile(outputPath);
          } else if (format === 'avif') {
            await resized
              .clone()
              .avif({ quality: config.quality })
              .toFile(outputPath);
          } else if (format === 'jpeg' || format === 'jpg') {
            await resized
              .clone()
              .jpeg({ quality: config.quality, mozjpeg: true })
              .toFile(outputPath);
          } else if (format === 'png') {
            await resized
              .clone()
              .png({ quality: config.quality, compressionLevel: 9 })
              .toFile(outputPath);
          }

          const optimizedSize = getFileSizeKB(outputPath);
          results.outputs.push({
            path: outputPath,
            size: optimizedSize,
            format,
            width: size,
          });
          results.totalVariantsSize += optimizedSize;
        } else {
          // Dry run - just log what would be created
          results.outputs.push({
            path: outputPath,
            size: 0,
            format,
            width: size,
          });
        }
      }
    }

    // Also create optimized version at original size
    for (const format of config.formats) {
      const outputFilename = `${basename}.${format}`;
      const outputPath = path.join(outputDir, outputFilename);

      if (!dryRun) {
        const img = sharp(inputPath);

        if (format === 'webp') {
          await img.webp({ quality: config.quality }).toFile(outputPath);
        } else if (format === 'avif') {
          await img.avif({ quality: config.quality }).toFile(outputPath);
        } else if (format === 'jpeg' || format === 'jpg') {
          await img.jpeg({ quality: config.quality, mozjpeg: true }).toFile(outputPath);
        } else if (format === 'png') {
          await img.png({ quality: config.quality, compressionLevel: 9 }).toFile(outputPath);
        }

        const optimizedSize = getFileSizeKB(outputPath);
        results.outputs.push({
          path: outputPath,
          size: optimizedSize,
          format,
          width: metadata.width,
        });
        results.totalVariantsSize += optimizedSize;

        // Use first format at original size as the primary comparison
        if (results.optimizedSize === 0) {
          results.optimizedSize = optimizedSize;
        }
      } else {
        results.outputs.push({
          path: outputPath,
          size: 0,
          format,
          width: metadata.width,
        });
      }
    }

    if (!dryRun) {
      results.savings = originalSize - results.optimizedSize;
      results.savingsPercent = Math.round((results.savings / originalSize) * 100);
    }

    const duration = Date.now() - startTime;
    results.duration = duration;

  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Optimize multiple images
 * @param {string[]} files - Array of input file paths
 * @param {Object} config - Configuration object
 * @param {boolean} dryRun - If true, only simulate without writing files
 * @param {Function} onProgress - Progress callback
 * @returns {Object} Summary of all optimizations
 */
async function optimizeImages(files, config, dryRun = false, onProgress = null) {
  const summary = {
    total: files.length,
    successful: 0,
    failed: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    totalVariantsSize: 0,
    totalVariantsCount: 0,
    totalSavings: 0,
    totalSavingsPercent: 0,
    results: [],
    errors: [],
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress(i + 1, files.length, file);
    }

    const result = await optimizeImage(file, config, dryRun);
    summary.results.push(result);

    if (result.error) {
      summary.failed++;
      summary.errors.push({ file, error: result.error });
    } else {
      summary.successful++;
      summary.totalOriginalSize += result.originalSize;
      summary.totalOptimizedSize += result.optimizedSize;
      summary.totalVariantsSize += result.totalVariantsSize;
      summary.totalVariantsCount += result.outputs.length;
    }
  }

  if (!dryRun && summary.totalOriginalSize > 0) {
    summary.totalSavings = summary.totalOriginalSize - summary.totalOptimizedSize;
    summary.totalSavingsPercent = Math.round(
      (summary.totalSavings / summary.totalOriginalSize) * 100
    );
  }

  return summary;
}

/**
 * Print optimization summary
 * @param {Object} summary - Summary object from optimizeImages
 * @param {boolean} dryRun - Whether this was a dry run
 */
function printSummary(summary, dryRun = false) {
  console.log('\n' + chalk.bold.underline('Optimization Summary'));
  console.log(chalk.cyan(`Total files: ${summary.total}`));
  console.log(chalk.green(`✓ Successful: ${summary.successful}`));

  if (summary.failed > 0) {
    console.log(chalk.red(`✗ Failed: ${summary.failed}`));
  }

  if (!dryRun && summary.successful > 0) {
    console.log(chalk.cyan(`Original size: ${summary.totalOriginalSize} KB`));
    console.log(chalk.cyan(`Primary format size: ${summary.totalOptimizedSize} KB`));

    const savingsColor = summary.totalSavings > 0 ? chalk.green.bold : chalk.yellow;
    const savingsSign = summary.totalSavings > 0 ? '✓' : '→';
    console.log(
      savingsColor(
        `${savingsSign} Saved: ${summary.totalSavings} KB (${summary.totalSavingsPercent}%)`
      )
    );

    // Show info about responsive variants
    console.log(chalk.dim(`\nGenerated ${summary.totalVariantsCount} responsive variants (${summary.totalVariantsSize} KB total)`));
    console.log(chalk.dim(`Multiple formats and sizes created for optimal web performance`));
  }

  if (summary.errors.length > 0) {
    console.log('\n' + chalk.bold.red('Errors:'));
    summary.errors.forEach(({ file, error }) => {
      console.log(chalk.red(`  ✗ ${file}: ${error}`));
    });
  }

  if (dryRun) {
    console.log('\n' + chalk.yellow('⚠ Dry run - no files were modified'));
  }
}

module.exports = {
  optimizeImage,
  optimizeImages,
  printSummary,
};
