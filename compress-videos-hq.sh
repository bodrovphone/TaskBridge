#!/bin/bash

# High-Quality Video Compression Script
# Better balance between quality and file size

echo "🎬 High-Quality Video Compression"
echo "=================================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found!"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Set directories
INPUT_DIR="public/assets"
OUTPUT_DIR="public/assets/optimized"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to get file size in MB
get_size() {
    stat -f%z "$1" | awk '{print $1/1024/1024}'
}

echo ""
echo "📁 Input directory: $INPUT_DIR"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Compress hero_video_1.mp4 with BETTER QUALITY
if [ -f "$INPUT_DIR/hero_video_1.mp4" ]; then
    echo "🎥 Processing: hero_video_1.mp4 (High Quality)"
    ORIGINAL_SIZE=$(get_size "$INPUT_DIR/hero_video_1.mp4")
    printf "   Original size: %.2f MB\n" "$ORIGINAL_SIZE"

    # Better settings: 1080p, CRF 23 (high quality)
    ffmpeg -i "$INPUT_DIR/hero_video_1.mp4" \
        -vf scale=1920:1080 \
        -c:v libx264 \
        -crf 23 \
        -preset slow \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        "$OUTPUT_DIR/hero_video_1_hq.mp4" \
        -y -loglevel error

    if [ $? -eq 0 ]; then
        COMPRESSED_SIZE=$(get_size "$OUTPUT_DIR/hero_video_1_hq.mp4")
        printf "   ✅ Compressed size: %.2f MB\n" "$COMPRESSED_SIZE"
        REDUCTION=$(echo "scale=1; ($ORIGINAL_SIZE - $COMPRESSED_SIZE) / $ORIGINAL_SIZE * 100" | bc)
        printf "   📉 Reduced by: ${REDUCTION}%%\n"
    else
        echo "   ❌ Compression failed"
    fi
    echo ""
fi

# Compress hero_video_2.mp4 with BETTER QUALITY
if [ -f "$INPUT_DIR/hero_video_2.mp4" ]; then
    echo "🎥 Processing: hero_video_2.mp4 (High Quality)"
    ORIGINAL_SIZE=$(get_size "$INPUT_DIR/hero_video_2.mp4")
    printf "   Original size: %.2f MB\n" "$ORIGINAL_SIZE"

    # Better settings: 1080p, CRF 23 (high quality)
    ffmpeg -i "$INPUT_DIR/hero_video_2.mp4" \
        -vf scale=1920:1080 \
        -c:v libx264 \
        -crf 23 \
        -preset slow \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        "$OUTPUT_DIR/hero_video_2_hq.mp4" \
        -y -loglevel error

    if [ $? -eq 0 ]; then
        COMPRESSED_SIZE=$(get_size "$OUTPUT_DIR/hero_video_2_hq.mp4")
        printf "   ✅ Compressed size: %.2f MB\n" "$COMPRESSED_SIZE"
        REDUCTION=$(echo "scale=1; ($ORIGINAL_SIZE - $COMPRESSED_SIZE) / $ORIGINAL_SIZE * 100" | bc)
        printf "   📉 Reduced by: ${REDUCTION}%%\n"
    else
        echo "   ❌ Compression failed"
    fi
    echo ""
fi

echo "=================================="
echo "✅ High-quality compression complete!"
echo ""
echo "💡 Settings used:"
echo "   - Resolution: 1080p (1920x1080)"
echo "   - Quality: CRF 23 (high quality)"
echo "   - Target: 40-60% reduction with minimal quality loss"
echo ""
echo "📝 Next steps:"
echo "1. Test videos in browser"
echo "2. Compare quality with originals"
echo "3. If satisfied, use these versions"
