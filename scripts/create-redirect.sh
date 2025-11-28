#!/bin/bash
# Create a redirect file for Hugo
# Usage: ./create-redirect.sh OLD_URL NEW_URL [TITLE]

set -e

OLD_URL="$1"
NEW_URL="$2"
TITLE="${3:-Redirect from $OLD_URL}"

if [ -z "$OLD_URL" ] || [ -z "$NEW_URL" ]; then
    echo "Usage: ./create-redirect.sh OLD_URL NEW_URL [TITLE]"
    echo ""
    echo "Examples:"
    echo "  ./create-redirect.sh /about-us / 'About Us'"
    echo "  ./create-redirect.sh /blog /updates/ 'Blog'"
    echo "  ./create-redirect.sh /old-page /new-page"
    exit 1
fi

# Remove leading slash for filename
FILENAME=$(echo "$OLD_URL" | sed 's|^/||' | sed 's|/$||' | sed 's|/|-|g')

# Create redirects directory if it doesn't exist
mkdir -p content/redirects

# Create redirect file
FILEPATH="content/redirects/${FILENAME}.md"

if [ -f "$FILEPATH" ]; then
    echo "❌ Error: Redirect file already exists: $FILEPATH"
    exit 1
fi

cat > "$FILEPATH" << EOF
---
title: "Redirect: $TITLE"
type: redirect
redirect: $NEW_URL
url: $OLD_URL
---

Redirects $OLD_URL to $NEW_URL
EOF

echo "✅ Created redirect: $FILEPATH"
echo ""
echo "   From: $OLD_URL"
echo "   To:   $NEW_URL"
echo ""
echo "Test locally:"
echo "   hugo server"
echo "   Visit: http://localhost:1313$OLD_URL"
echo ""
echo "To deploy:"
echo "   git add $FILEPATH"
echo "   git commit -m 'Add redirect: $OLD_URL → $NEW_URL'"
echo "   git push origin main"
