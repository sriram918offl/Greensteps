#!/usr/bin/env bash
#
# Extract a hero video into WebP frames for the scroll-frame animation.
# Run from the project root: bash scripts/extract-frames.sh
#
# Source:  public/videos/hero.mp4
# Output:  public/frames/frame_001.webp ... frame_NNN.webp
#
# Constants here MUST match those in src/app/page.tsx
# (FRAME_COUNT, FRAME_WIDTH, FRAME_HEIGHT).

set -euo pipefail

SRC="public/videos/hero.mp4"
OUT_DIR="public/frames"
FPS=18           # output fps — controls frame density vs. file count
WIDTH=992        # match source width to avoid upscale blur
QUALITY=85       # libwebp quality 0..100 — 85 = high quality (recommended)

if [ ! -f "$SRC" ]; then
  echo "❌ $SRC not found. Drop your hero video there first."
  exit 1
fi
if ! command -v ffmpeg >/dev/null; then
  echo "❌ ffmpeg is required. Install: https://ffmpeg.org/"
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR"/*.webp

ffmpeg -y -i "$SRC" \
  -vf "fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
  -c:v libwebp -q:v ${QUALITY} -preset default -an \
  "$OUT_DIR/frame_%03d.webp"

COUNT=$(find "$OUT_DIR" -name "frame_*.webp" -type f | wc -l)
SIZE=$(du -sh "$OUT_DIR" | cut -f1)
echo ""
echo "✅ Wrote $COUNT frames to $OUT_DIR ($SIZE total)."
echo "   Update FRAME_COUNT in src/app/page.tsx if it differs from $COUNT."
