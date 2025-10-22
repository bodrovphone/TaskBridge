# Media Optimization CLI Tool

## Task Description

Create an internal command-line interface (CLI) tool to automatically optimize images and videos in the project. This tool should reduce file sizes, convert to modern formats, and ensure consistent quality across all media assets for better performance and faster page loads.

## Requirements

### Image Optimization
- Support common formats: JPEG, PNG, WebP, AVIF, SVG
- Automatic conversion to WebP/AVIF for modern browsers
- Preserve original files (create optimized versions)
- Batch processing for multiple files
- Configurable quality settings (default: 80-85%)
- Automatic resizing to responsive breakpoints (thumbnail, mobile, tablet, desktop)
- Remove EXIF metadata for privacy and size reduction
- Generate multiple size variants for responsive images

### Video Optimization
- Support formats: MP4, WebM, MOV
- Automatic conversion to web-optimized MP4 and WebM
- Compress videos while maintaining quality
- Generate video thumbnails/posters
- Configurable bitrate and resolution settings
- Support for background videos (lower quality, smaller size)

### CLI Interface
- Simple command structure: `npm run optimize:images` and `npm run optimize:videos`
- Progress indicators for batch operations
- Summary report after optimization (files processed, size saved, etc.)
- Dry-run mode to preview changes without modifying files
- Watch mode for automatic optimization during development
- Configuration file support (`.mediarc` or similar)

### Integration
- Add npm scripts to package.json
- Pre-commit hook option for automatic optimization
- CI/CD integration support
- Documentation in README.md

## Acceptance Criteria

- [ ] CLI tool created with basic command structure
- [ ] Image optimization working for JPEG, PNG, WebP
- [ ] Video optimization working for MP4, WebM
- [ ] Batch processing implemented with progress indicators
- [ ] Configuration file support (.mediarc or similar)
- [ ] npm scripts added: `optimize:images`, `optimize:videos`, `optimize:media`
- [ ] Dry-run mode implemented (`--dry-run` flag)
- [ ] Summary report shows: files processed, original size, optimized size, savings percentage
- [ ] Documentation added to README.md with usage examples
- [ ] Error handling for unsupported formats or corrupted files

## Technical Notes

### Recommended Libraries
- **Sharp** - Fast image processing (Node.js)
- **imagemin** - Image optimization with plugins
- **FFmpeg** - Video processing (via fluent-ffmpeg wrapper)
- **Commander.js** or **yargs** - CLI argument parsing
- **ora** - Elegant terminal spinners
- **chalk** - Colorful terminal output
- **glob** - File pattern matching

### File Structure
```
/scripts/
├── optimize/
│   ├── cli.js           # Main CLI entry point
│   ├── images.js        # Image optimization logic
│   ├── videos.js        # Video optimization logic
│   └── config.js        # Configuration loader
└── .mediarc.example     # Example configuration file
```

### Configuration Example
```json
{
  "images": {
    "quality": 85,
    "formats": ["webp", "avif"],
    "sizes": [320, 640, 1024, 1920],
    "outputDir": "public/optimized"
  },
  "videos": {
    "formats": ["mp4", "webm"],
    "maxResolution": 1920,
    "bitrate": "1M",
    "outputDir": "public/videos"
  }
}
```

### Usage Examples
```bash
# Optimize all images in a directory
npm run optimize:images -- --input public/images --output public/optimized

# Optimize videos with custom quality
npm run optimize:videos -- --input public/videos --quality 75

# Dry run to preview changes
npm run optimize:media -- --dry-run

# Watch mode for development
npm run optimize:images -- --watch

# Optimize with custom config
npm run optimize:media -- --config .mediarc.custom.json
```

### Performance Targets
- **Images**: 50-70% size reduction without visible quality loss
- **Videos**: 30-50% size reduction while maintaining acceptable quality
- **Processing speed**: Handle 100+ images in under 2 minutes
- **Memory efficient**: Stream processing for large files

### Future Enhancements (v2)
- Cloud storage integration (S3, Cloudinary)
- Automatic image lazy-loading attribute generation
- Video adaptive bitrate streaming (HLS/DASH)
- AI-powered smart cropping
- Automatic alt text generation for images

## Priority

**Medium-High** - Performance optimization is important for user experience, but existing media should work for MVP. Implement before large-scale content upload.

## Dependencies

- Sharp: `npm install sharp`
- imagemin: `npm install imagemin imagemin-webp imagemin-avif`
- FFmpeg: Requires system installation + `npm install fluent-ffmpeg`
- CLI tools: `npm install commander ora chalk glob`

## Estimated Time

- Initial implementation: 4-6 hours
- Testing and refinement: 2-3 hours
- Documentation: 1 hour
- **Total**: 1-2 days

## Related Tasks

- Image upload optimization in task creation form
- Profile avatar optimization
- Portfolio image optimization
- Task gallery image optimization
