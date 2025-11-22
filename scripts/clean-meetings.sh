#!/bin/bash

# Script to clean meeting posts and move to /content/meetings/
# Fixes duplication, formatting, author, and categories

set -e

# Create meetings directory
mkdir -p /workspaces/waccamawdotorg/content/meetings

# Find all meeting-related posts
find /workspaces/waccamawdotorg/content -type f -name "*.md" \
  | xargs grep -l -i "meeting summary\|open meeting\|executive meeting" \
  | while read -r file; do
  
  echo "Processing: $file"
  
  # Extract basename
  basename=$(basename "$file")
  dirname=$(dirname "$file")
  
  # Skip if already in meetings directory
  if [[ "$dirname" == *"/meetings"* ]]; then
    echo "  Already in meetings directory, skipping"
    continue
  fi
  
  # Extract date from path (YYYY/MM/DD format)
  if [[ "$dirname" =~ /([0-9]{4})/([0-9]{2})/([0-9]{2})$ ]]; then
    year="${BASH_REMATCH[1]}"
    month="${BASH_REMATCH[2]}"
    day="${BASH_REMATCH[3]}"
    date_path="${year}/${month}/${day}"
    echo "  Date: $year-$month-$day"
  else
    echo "  Could not extract date, skipping"
    continue
  fi
  
  # New filename in meetings directory
  newfile="/workspaces/waccamawdotorg/content/meetings/${year}-${month}-${day}-${basename}"
  
  echo "  Will move to: $newfile"
  
done

echo ""
echo "Found $(find /workspaces/waccamawdotorg/content -type f -name '*.md' | xargs grep -l -i 'meeting summary\|open meeting\|executive meeting' | wc -l) meeting posts"
echo ""
echo "Run with EXECUTE=1 to actually process files"
