#!/bin/bash
#
# find-emojis.sh - Scan files in a directory for emoji characters
#
# Usage: ./find-emojis.sh [directory]
# If no directory is provided, uses the current directory.
#

# Directory to scan (default to current directory)
SCAN_DIR="${1:-.}"

# Check if directory exists
if [ ! -d "$SCAN_DIR" ]; then
    echo "Error: Directory '$SCAN_DIR' does not exist."
    exit 1
fi

echo "Scanning for emojis in: $SCAN_DIR"
echo "========================================"
echo ""

# Find all files (excluding common binary/non-text files and this script itself)
# and search for emoji characters using UTF-8 byte patterns
# Common emoji ranges in UTF-8
find "$SCAN_DIR" -type f \
    -not -name "find-emojis.sh" \
    -not -name "*.png" \
    -not -name "*.jpg" \
    -not -name "*.jpeg" \
    -not -name "*.gif" \
    -not -name "*.ico" \
    -not -name "*.svg" \
    -not -name "*.pdf" \
    -not -name "*.zip" \
    -not -name "*.tar" \
    -not -name "*.gz" \
    -not -name "*.node" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -exec grep -nH -E -- '[😀-🙏🙱-🙿🚀-🗿🛰️-🗾🎀-🎟️🎠-🎿🏀-🏿🐀-🦿🧀-🧿🨀-🯿🥀-🫎🫐-🫿🬀-🮤🭀-🮿]' {} \; 2>/dev/null | \
    while IFS=: read -r file line content; do
        echo "📄 $file:$line"
        echo "   $content"
        echo ""
    done

echo "========================================"
echo "Scan complete!"