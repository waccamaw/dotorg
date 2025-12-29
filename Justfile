# Load environment variables from .env file
set dotenv-load

# Default recipe (list available recipes)
default:
    @just --list


install: git-config
    pip3 install --user requests python-dotenv
    @echo "Installation complete."

# Sync meetings to Cloudflare KV (development)
sync-meetings-dev:
    cd apps/meetings-service && just sync-kv-dev

# Sync meetings to Cloudflare KV (production)
sync-meetings-prod:
    cd apps/meetings-service && just sync-kv-prod

# Generate and view meetings index
view-meetings-index:
    cd apps/meetings-service && just generate-index
    @echo ""
    @echo "📋 Full index:"
    @jq '.' apps/meetings-service/meetings-index.json

# Build the site (useful when server is already running with --watch)
build:
    hugo

# Clean stale public folder and start Hugo dev server
serve: 
    @echo "🧹 Cleaning stale public folder..."
    @rm -rf public/
    @echo "✅ Public folder cleaned"
    @echo "🚀 Starting Hugo server..."
    hugo server --disableFastRender --noHTTPCache --watch --bind="0.0.0.0" --port="1313" --baseURL="http://localhost:1313/"

# Validate meeting markdown files for Micro.blog compatibility
validate-meetings:
    #!/usr/bin/env bash
    set -euo pipefail
    python3 scripts/validate-meetings.py

# Export content directory as zip
export-content:
    #!/usr/bin/env bash
    set -euo pipefail
    
    EXPORT_FILE="content-export-$(date +%Y%m%d-%H%M%S).zip"
    
    echo "📦 Creating content export..."
    zip -r "$EXPORT_FILE" content/ -q
    
    echo "✅ Export complete!"
    echo "📦 Archive: $EXPORT_FILE"
    echo "💾 Size: $(du -h $EXPORT_FILE | cut -f1)"

# Export cleaned content for Micro.blog import (deprecated - use export-content instead)
export-content-deprecated: validate-meetings
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "📦 Creating content export for Micro.blog import..."
    
    # Create temporary directory for export
    EXPORT_DIR=$(mktemp -d)
    EXPORT_FILE="content-export-$(date +%Y%m%d-%H%M%S).zip"
    
    # Copy entire content directory structure
    echo "📋 Copying all content files..."
    mkdir -p "$EXPORT_DIR/content"
    cp -r content/* "$EXPORT_DIR/content/" 2>/dev/null || true
    
    # Count files by type
    MEETING_COUNT=$(find "$EXPORT_DIR/content/meetings" -name '*.md' 2>/dev/null | wc -l || echo 0)
    UPDATE_COUNT=$(find "$EXPORT_DIR/content/updates" -name '*.md' 2>/dev/null | wc -l || echo 0)
    REPLY_COUNT=$(find "$EXPORT_DIR/content/replies" -name '*.md' 2>/dev/null | wc -l || echo 0)
    PAGE_COUNT=$(find "$EXPORT_DIR/content" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l || echo 0)
    
    echo "  ✓ Copied $MEETING_COUNT meeting files"
    echo "  ✓ Copied $UPDATE_COUNT update files"
    echo "  ✓ Copied $REPLY_COUNT reply files"
    echo "  ✓ Copied $PAGE_COUNT top-level pages"
    
    # Count total files
    TOTAL_FILES=$(find "$EXPORT_DIR/content" -name '*.md' | wc -l)
    
    # Create zip file
    echo "🗜️  Creating zip archive..."
    cd "$EXPORT_DIR"
    zip -r "$OLDPWD/$EXPORT_FILE" content/ -q
    cd "$OLDPWD"
    
    # Cleanup
    rm -rf "$EXPORT_DIR"
    
    # Show summary
    echo ""
    echo "✅ Export complete!"
    echo "📄 Total files exported: $TOTAL_FILES"
    echo "📦 Archive: $EXPORT_FILE"
    echo "💾 Size: $(du -h $EXPORT_FILE | cut -f1)"
    echo ""
    echo "Next steps:"
    echo "1. Download $EXPORT_FILE"
    echo "2. Go to https://micro.blog/account/import"
    echo "3. Upload the zip file"
    echo "4. Preview and confirm the import"

# Micro.blog Development Tasks

# Authenticate to Micro.blog via email
auth:
    python3 .github/deploy/microblog_auth.py

# Deploy theme changes to Micro.blog
deploy:
    python3 .github/deploy/microblog_deploy.py --all

# Backup content from Micro.blog
backup:
    python3 .github/deploy/microblog_backup.py --all

# Backup and download only (no extraction)
backup-download:
    python3 .github/deploy/microblog_backup.py --export-only

# Extract content from existing backup ZIP
backup-extract ZIP_FILE:
    python3 .github/deploy/microblog_backup.py --extract-only {{ZIP_FILE}}

# Validate session cookie
validate:
    python3 .github/deploy/microblog_deploy.py --validate-only

# Configure git identity from .env file
git-config:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -f .env ]; then
        source .env
        if [ -n "${GIT_USER_NAME:-}" ] && [ -n "${GIT_USER_EMAIL:-}" ]; then
            git config user.name "$GIT_USER_NAME"
            git config user.email "$GIT_USER_EMAIL"
            echo "✅ Git identity configured:"
            echo "   Name:  $(git config user.name)"
            echo "   Email: $(git config user.email)"
        else
            echo "❌ GIT_USER_NAME and GIT_USER_EMAIL must be set in .env file"
            exit 1
        fi
    else
        echo "❌ .env file not found"
        exit 1
    fi

# Show available commands
help:
    just --list

# Logo Generation Recipes

# Generate a colored logo variant with custom hex color
# Usage: just logo-color my-color "#ff5733" 
# Creates: static/logos/classic/colors/my-color.png
logo-color NAME COLOR:
    #!/usr/bin/env bash
    set -euo pipefail
    
    # Validate color format (should start with #)
    if [[ ! "{{COLOR}}" =~ ^#[0-9a-fA-F]{6}$ ]]; then
        echo "❌ Invalid hex color format. Use format: #RRGGBB (e.g., #ff5733)"
        exit 1
    fi
    
    OUTPUT_DIR="static/logos/classic/colors"
    OUTPUT_FILE="${OUTPUT_DIR}/{{NAME}}.png"
    TEMP_TRANS="/tmp/logo-trans-$$.png"
    
    # Ensure output directory exists
    mkdir -p "$OUTPUT_DIR"
    
    echo "🎨 Generating logo in color {{COLOR}}..."
    
    # Step 1: Convert SVG to PNG with white made transparent
    convert static/logos/classic/logo.svg \
        -density 300 \
        -background none \
        -resize 4500x4500 \
        -fuzz 10% \
        -transparent white \
        PNG32:"$TEMP_TRANS"
    
    # Step 2: Replace all non-transparent pixels with target color
    convert "$TEMP_TRANS" \
        \( +clone -alpha opaque -fill '{{COLOR}}' -colorize 100% \) \
        -compose src_in \
        -composite \
        "$OUTPUT_FILE"
    
    # Cleanup
    rm -f "$TEMP_TRANS"
    
    # Verify and report
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    DIMENSIONS=$(identify -format "%wx%h" "$OUTPUT_FILE")
    
    echo "✅ Logo created successfully!"
    echo "   📁 File: $OUTPUT_FILE"
    echo "   📐 Size: $DIMENSIONS (300 DPI)"
    echo "   💾 Disk: $SIZE"
    echo "   🎨 Color: {{COLOR}}"
    echo "   ✨ Transparent background: Yes"

# Generate all standard color variants from style guide
logo-all:
    @echo "🎨 Generating all logo color variants from style guide..."
    @just logo-color primary-color "#0033cc"
    @just logo-color primary-hover "#0028a3"
    @just logo-color text-color "#2a2a2a"
    @just logo-color text-light "#6b6b6b"
    @just logo-color text-white "#ffffff"
    @just logo-color logo-primary "#004384"
    @just logo-color logo-secondary "#002D5A"
    @just logo-color original-blue "#092D70"
    @just logo-color gold "#ffd700"
    @just logo-color cream "#f4e4c1"
    @just logo-color tribal-red "#8b1e1e"
    @echo ""
    @echo "✅ All 11 standard color variants generated!"
    @echo "📁 Location: static/logos/classic/colors/"
