# Media Optimization CLI

TaskBridge includes a powerful CLI tool for optimizing images and videos to improve web performance and reduce load times.

## Features

### Image Optimization
- Converts JPEG/PNG to modern formats (WebP, AVIF)
- Generates responsive image variants (320px, 640px, 1024px, 1920px)
- Configurable quality settings (default: 85%)
- Removes EXIF metadata for privacy
- Batch processing with progress indicators

### Video Optimization (requires FFmpeg)
- Converts to web-optimized MP4 and WebM
- Automatic resolution adjustment
- Generates video thumbnails
- Configurable bitrate and quality

## Installation Requirements

### macOS (recommended for local use)
```bash
# Install FFmpeg for video optimization (optional)
brew install ffmpeg
```

### Linux
```bash
# Debian/Ubuntu
sudo apt-get install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

## Quick Start

```bash
npm run optimize:images  # Optimize images (JPEG, PNG → WebP, AVIF)
npm run optimize:videos  # Optimize videos (MP4, WebM) - requires FFmpeg
npm run optimize:media   # Optimize all media (images + videos)
```

## Basic Usage

### Optimize Images

```bash
# Optimize all images in a directory
npm run optimize:images -- --input "public/images/**/*.{jpg,png}"

# With custom output directory
npm run optimize:images -- --input "public/images/*.jpg" --output "public/optimized"

# With custom quality (1-100)
npm run optimize:images -- --input "public/images/*.png" --quality 90

# Dry run (preview without modifying files)
npm run optimize:images -- --input "public/images/**/*" --dry-run
```

### Optimize Videos

```bash
# Optimize all videos in a directory
npm run optimize:videos -- --input "public/videos/**/*.mp4"

# With custom settings
npm run optimize:videos -- --input "public/videos/*.mp4" --resolution 1920 --bitrate "2M"

# Skip thumbnail generation
npm run optimize:videos -- --input "public/videos/*.mp4" --no-thumbnails
```

### Optimize All Media

```bash
# Optimize both images and videos
npm run optimize:media -- --input "public/**/*"

# Dry run
npm run optimize:media -- --dry-run
```

## Configuration

Create a `.mediarc` file in the project root for custom settings:

```json
{
  "images": {
    "quality": 85,
    "formats": ["webp", "avif"],
    "sizes": [320, 640, 1024, 1920],
    "outputDir": "public/optimized/images",
    "preserveOriginal": true,
    "removeMetadata": true
  },
  "videos": {
    "formats": ["mp4", "webm"],
    "maxResolution": 1920,
    "bitrate": "1M",
    "outputDir": "public/optimized/videos",
    "generateThumbnails": true
  }
}
```

See `.mediarc.example` for a complete configuration template.

## CLI Options

### Images Command

```bash
node scripts/optimize/cli.js images [options]

Options:
  -i, --input <pattern>      Input file pattern (default: "public/images/**/*")
  -o, --output <dir>         Output directory
  -q, --quality <number>     Image quality 1-100 (default: 85)
  -f, --formats <formats>    Output formats, comma-separated (default: "webp,avif")
  -c, --config <path>        Path to custom config file
  --dry-run                  Preview changes without modifying files
```

### Videos Command

```bash
node scripts/optimize/cli.js videos [options]

Options:
  -i, --input <pattern>      Input file pattern (default: "public/videos/**/*")
  -o, --output <dir>         Output directory
  -f, --formats <formats>    Output formats, comma-separated (default: "mp4,webm")
  -r, --resolution <number>  Max resolution width (default: 1920)
  -b, --bitrate <bitrate>    Target bitrate, e.g. "1M", "2M" (default: "1M")
  -c, --config <path>        Path to custom config file
  --dry-run                  Preview changes without modifying files
  --no-thumbnails            Skip thumbnail generation
```

## Performance Targets

| Media Type | Size Reduction | Quality |
|------------|---------------|---------|
| Images | 50-70% | No visible loss |
| Videos | 30-50% | Acceptable quality |
| Processing | 100+ images | Under 2 minutes |

## Workflow Integration

### Before Committing Media

```bash
# Check what would be optimized
npm run optimize:media -- --dry-run

# Optimize all new media
npm run optimize:media
```

### Regular Maintenance

```bash
# Optimize images added in last commit
git diff --name-only HEAD~1 | grep -E '\.(jpg|png)$' | xargs -I {} npm run optimize:images -- --input {}
```

## Troubleshooting

### "FFmpeg is not installed"
- Video optimization requires FFmpeg
- Install with `brew install ffmpeg` (macOS) or your package manager
- Image optimization works without FFmpeg

### "No files found"
- Check your glob pattern syntax
- Use quotes around patterns: `"public/**/*.jpg"`
- Verify files exist in the specified directory

### Large output size
- The tool generates multiple formats and sizes
- This is expected - responsive variants improve performance
- Use `--formats webp` to generate only WebP
- Use config file to adjust sizes array
