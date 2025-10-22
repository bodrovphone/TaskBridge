const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Check if FFmpeg is installed
 * @returns {boolean} True if FFmpeg is available
 */
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

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
 * Get video duration and resolution using ffprobe
 * @param {string} inputPath - Input video path
 * @returns {Object} Video metadata
 */
function getVideoMetadata(inputPath) {
  try {
    const output = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json "${inputPath}"`,
      { encoding: 'utf8' }
    );
    const data = JSON.parse(output);
    const stream = data.streams[0];

    return {
      width: stream.width || 0,
      height: stream.height || 0,
      duration: parseFloat(stream.duration) || 0,
    };
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not read metadata for ${inputPath}`));
    return { width: 0, height: 0, duration: 0 };
  }
}

/**
 * Optimize a single video file
 * @param {string} inputPath - Input video path
 * @param {Object} config - Configuration object
 * @param {boolean} dryRun - If true, only simulate without writing files
 * @returns {Object} Optimization results
 */
async function optimizeVideo(inputPath, config, dryRun = false) {
  const startTime = Date.now();
  const originalSize = getFileSizeKB(inputPath);
  const results = {
    original: inputPath,
    originalSize,
    optimizedSize: 0,
    savings: 0,
    savingsPercent: 0,
    outputs: [],
    error: null,
  };

  try {
    // Get video metadata
    const metadata = getVideoMetadata(inputPath);

    // Ensure output directory exists
    if (!dryRun && !fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);

    // Determine target resolution (don't upscale)
    const targetWidth = Math.min(metadata.width, config.maxResolution);
    const scale = metadata.width > targetWidth
      ? `scale=${targetWidth}:-2`
      : 'scale=-2:-2';

    // Generate each format
    for (const format of config.formats) {
      const outputFilename = `${basename}.${format}`;
      const outputPath = path.join(config.outputDir, outputFilename);

      if (!dryRun) {
        let ffmpegCmd;

        if (format === 'mp4') {
          // H.264 codec for MP4 - widely compatible
          ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "${scale}" -c:v libx264 -preset slow -crf 23 -b:v ${config.bitrate} -c:a aac -b:a 128k -movflags +faststart -y "${outputPath}"`;
        } else if (format === 'webm') {
          // VP9 codec for WebM - modern and efficient
          ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "${scale}" -c:v libvpx-vp9 -b:v ${config.bitrate} -c:a libopus -b:a 128k -y "${outputPath}"`;
        }

        try {
          execSync(ffmpegCmd, { stdio: 'ignore' });
          const optimizedSize = getFileSizeKB(outputPath);
          results.outputs.push({
            path: outputPath,
            size: optimizedSize,
            format,
          });
          results.optimizedSize += optimizedSize;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to encode ${format} for ${inputPath}`));
        }
      } else {
        // Dry run - just log what would be created
        results.outputs.push({
          path: outputPath,
          size: 0,
          format,
        });
      }
    }

    // Generate thumbnail if configured
    if (config.generateThumbnails && !dryRun) {
      const thumbnailPath = path.join(
        config.outputDir,
        `${basename}-thumb.jpg`
      );

      // Extract frame at 10% of video duration or 2 seconds
      const timestamp = Math.min(metadata.duration * 0.1, 2);

      try {
        execSync(
          `ffmpeg -i "${inputPath}" -ss ${timestamp} -vframes 1 -vf "${scale}" -q:v 2 -y "${thumbnailPath}"`,
          { stdio: 'ignore' }
        );

        results.outputs.push({
          path: thumbnailPath,
          size: getFileSizeKB(thumbnailPath),
          format: 'thumbnail',
        });
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Failed to generate thumbnail for ${inputPath}`));
      }
    }

    if (!dryRun && results.optimizedSize > 0) {
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
 * Optimize multiple videos
 * @param {string[]} files - Array of input file paths
 * @param {Object} config - Configuration object
 * @param {boolean} dryRun - If true, only simulate without writing files
 * @param {Function} onProgress - Progress callback
 * @returns {Object} Summary of all optimizations
 */
async function optimizeVideos(files, config, dryRun = false, onProgress = null) {
  // Check if FFmpeg is available
  if (!checkFFmpeg()) {
    console.error(chalk.red('✗ FFmpeg is not installed or not in PATH'));
    console.log(chalk.cyan('\nTo install FFmpeg on macOS:'));
    console.log(chalk.white('  brew install ffmpeg'));
    console.log(chalk.cyan('\nOr download from: https://ffmpeg.org/download.html'));
    process.exit(1);
  }

  const summary = {
    total: files.length,
    successful: 0,
    failed: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
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

    const result = await optimizeVideo(file, config, dryRun);
    summary.results.push(result);

    if (result.error) {
      summary.failed++;
      summary.errors.push({ file, error: result.error });
    } else {
      summary.successful++;
      summary.totalOriginalSize += result.originalSize;
      summary.totalOptimizedSize += result.optimizedSize;
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
 * @param {Object} summary - Summary object from optimizeVideos
 * @param {boolean} dryRun - Whether this was a dry run
 */
function printSummary(summary, dryRun = false) {
  console.log('\n' + chalk.bold.underline('Video Optimization Summary'));
  console.log(chalk.cyan(`Total files: ${summary.total}`));
  console.log(chalk.green(`✓ Successful: ${summary.successful}`));

  if (summary.failed > 0) {
    console.log(chalk.red(`✗ Failed: ${summary.failed}`));
  }

  if (!dryRun && summary.successful > 0) {
    console.log(chalk.cyan(`Original size: ${summary.totalOriginalSize} KB`));
    console.log(chalk.cyan(`Optimized size: ${summary.totalOptimizedSize} KB`));
    console.log(
      chalk.green.bold(
        `✓ Saved: ${summary.totalSavings} KB (${summary.totalSavingsPercent}%)`
      )
    );
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
  checkFFmpeg,
  optimizeVideo,
  optimizeVideos,
  printSummary,
};
