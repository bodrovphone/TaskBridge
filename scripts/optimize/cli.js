#!/usr/bin/env node

const { Command } = require('commander');
const glob = require('glob');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { loadConfig, validateConfig } = require('./config');
const imageOptimizer = require('./images');
const videoOptimizer = require('./videos');

const program = new Command();

// CLI metadata
program
  .name('media-optimizer')
  .description('CLI tool to optimize images and videos for web performance')
  .version('1.0.0');

/**
 * Find files matching pattern
 * @param {string} pattern - Glob pattern
 * @returns {string[]} Array of file paths
 */
function findFiles(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

/**
 * Filter files by extension
 * @param {string[]} files - Array of file paths
 * @param {string[]} extensions - Allowed extensions (e.g., ['.jpg', '.png'])
 * @returns {string[]} Filtered files
 */
function filterByExtension(files, extensions) {
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return extensions.includes(ext);
  });
}

// Images command
program
  .command('images')
  .description('Optimize images (JPEG, PNG, WebP, AVIF)')
  .option('-i, --input <pattern>', 'Input file pattern (e.g., "public/**/*.jpg")', 'public/**/*')
  .option('-o, --output <dir>', 'Output directory for optimized images')
  .option('-q, --quality <number>', 'Image quality (1-100)', '85')
  .option('-f, --formats <formats>', 'Output formats (comma-separated)', 'webp,avif')
  .option('-c, --config <path>', 'Path to custom config file')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n📸 Image Optimization Tool\n'));

    // Load and validate configuration
    let config = loadConfig(options.config);
    config = validateConfig(config);

    // Override config with CLI options
    if (options.output) {
      config.images.outputDir = options.output;
    }
    if (options.quality) {
      config.images.quality = parseInt(options.quality);
    }
    if (options.formats) {
      config.images.formats = options.formats.split(',').map(f => f.trim());
    }

    // Find image files
    const spinner = ora('Finding image files...').start();
    try {
      const allFiles = await findFiles(options.input);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
      const imageFiles = filterByExtension(allFiles, imageExtensions);

      if (imageFiles.length === 0) {
        spinner.fail('No image files found matching pattern: ' + options.input);
        process.exit(1);
      }

      spinner.succeed(`Found ${imageFiles.length} image(s)`);

      if (options.dryRun) {
        console.log(chalk.yellow('\n⚠ DRY RUN MODE - No files will be modified\n'));
      }

      // Show configuration
      console.log(chalk.dim('Configuration:'));
      console.log(chalk.dim(`  Quality: ${config.images.quality}`));
      console.log(chalk.dim(`  Formats: ${config.images.formats.join(', ')}`));
      console.log(chalk.dim(`  Sizes: ${config.images.sizes.join(', ')}px`));
      console.log(chalk.dim(`  Output: ${config.images.outputDir}\n`));

      // Optimize images
      const progressSpinner = ora('Optimizing images...').start();
      let currentFile = '';

      const summary = await imageOptimizer.optimizeImages(
        imageFiles,
        config.images,
        options.dryRun,
        (current, total, file) => {
          currentFile = path.basename(file);
          progressSpinner.text = `Optimizing images... [${current}/${total}] ${currentFile}`;
        }
      );

      progressSpinner.succeed('Image optimization complete');

      // Print summary
      imageOptimizer.printSummary(summary, options.dryRun);

    } catch (error) {
      spinner.fail('Error during optimization');
      console.error(chalk.red('\n✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Videos command
program
  .command('videos')
  .description('Optimize videos (MP4, WebM)')
  .option('-i, --input <pattern>', 'Input file pattern (e.g., "public/**/*.mp4")', 'public/**/*')
  .option('-o, --output <dir>', 'Output directory for optimized videos')
  .option('-f, --formats <formats>', 'Output formats (comma-separated)', 'mp4,webm')
  .option('-r, --resolution <number>', 'Max resolution width', '1920')
  .option('-b, --bitrate <bitrate>', 'Target bitrate (e.g., "1M", "2M")', '1M')
  .option('-c, --config <path>', 'Path to custom config file')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .option('--no-thumbnails', 'Skip thumbnail generation', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🎬 Video Optimization Tool\n'));

    // Load and validate configuration
    let config = loadConfig(options.config);
    config = validateConfig(config);

    // Override config with CLI options
    if (options.output) {
      config.videos.outputDir = options.output;
    }
    if (options.formats) {
      config.videos.formats = options.formats.split(',').map(f => f.trim());
    }
    if (options.resolution) {
      config.videos.maxResolution = parseInt(options.resolution);
    }
    if (options.bitrate) {
      config.videos.bitrate = options.bitrate;
    }
    if (options.thumbnails === false) {
      config.videos.generateThumbnails = false;
    }

    // Find video files
    const spinner = ora('Finding video files...').start();
    try {
      const allFiles = await findFiles(options.input);
      const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
      const videoFiles = filterByExtension(allFiles, videoExtensions);

      if (videoFiles.length === 0) {
        spinner.fail('No video files found matching pattern: ' + options.input);
        process.exit(1);
      }

      spinner.succeed(`Found ${videoFiles.length} video(s)`);

      if (options.dryRun) {
        console.log(chalk.yellow('\n⚠ DRY RUN MODE - No files will be modified\n'));
      }

      // Show configuration
      console.log(chalk.dim('Configuration:'));
      console.log(chalk.dim(`  Formats: ${config.videos.formats.join(', ')}`));
      console.log(chalk.dim(`  Max Resolution: ${config.videos.maxResolution}px`));
      console.log(chalk.dim(`  Bitrate: ${config.videos.bitrate}`));
      console.log(chalk.dim(`  Output: ${config.videos.outputDir}\n`));

      // Optimize videos
      const progressSpinner = ora('Optimizing videos...').start();
      let currentFile = '';

      const summary = await videoOptimizer.optimizeVideos(
        videoFiles,
        config.videos,
        options.dryRun,
        (current, total, file) => {
          currentFile = path.basename(file);
          progressSpinner.text = `Optimizing videos... [${current}/${total}] ${currentFile}`;
        }
      );

      progressSpinner.succeed('Video optimization complete');

      // Print summary
      videoOptimizer.printSummary(summary, options.dryRun);

    } catch (error) {
      spinner.fail('Error during optimization');
      console.error(chalk.red('\n✗ Error:'), error.message);
      process.exit(1);
    }
  });

// All media command (images + videos)
program
  .command('all')
  .description('Optimize all media (images and videos)')
  .option('-i, --input <pattern>', 'Input file pattern', 'public/**/*')
  .option('-c, --config <path>', 'Path to custom config file')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🎨 Media Optimization Tool\n'));

    // Load and validate configuration
    let config = loadConfig(options.config);
    config = validateConfig(config);

    // Find all media files
    const spinner = ora('Finding media files...').start();
    try {
      const allFiles = await findFiles(options.input);

      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
      const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];

      const imageFiles = filterByExtension(allFiles, imageExtensions);
      const videoFiles = filterByExtension(allFiles, videoExtensions);

      if (imageFiles.length === 0 && videoFiles.length === 0) {
        spinner.fail('No media files found matching pattern: ' + options.input);
        process.exit(1);
      }

      spinner.succeed(
        `Found ${imageFiles.length} image(s) and ${videoFiles.length} video(s)`
      );

      if (options.dryRun) {
        console.log(chalk.yellow('\n⚠ DRY RUN MODE - No files will be modified\n'));
      }

      // Optimize images
      if (imageFiles.length > 0) {
        console.log(chalk.bold('\n📸 Optimizing Images\n'));
        const progressSpinner = ora('Optimizing images...').start();

        const imageSummary = await imageOptimizer.optimizeImages(
          imageFiles,
          config.images,
          options.dryRun,
          (current, total, file) => {
            progressSpinner.text = `Optimizing images... [${current}/${total}] ${path.basename(file)}`;
          }
        );

        progressSpinner.succeed('Image optimization complete');
        imageOptimizer.printSummary(imageSummary, options.dryRun);
      }

      // Optimize videos
      if (videoFiles.length > 0) {
        console.log(chalk.bold('\n🎬 Optimizing Videos\n'));
        const progressSpinner = ora('Optimizing videos...').start();

        const videoSummary = await videoOptimizer.optimizeVideos(
          videoFiles,
          config.videos,
          options.dryRun,
          (current, total, file) => {
            progressSpinner.text = `Optimizing videos... [${current}/${total}] ${path.basename(file)}`;
          }
        );

        progressSpinner.succeed('Video optimization complete');
        videoOptimizer.printSummary(videoSummary, options.dryRun);
      }

      console.log(chalk.bold.green('\n✓ All media optimization complete!\n'));

    } catch (error) {
      spinner.fail('Error during optimization');
      console.error(chalk.red('\n✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
