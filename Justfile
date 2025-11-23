# Load environment variables from .env file
set dotenv-load

# Default recipe (list available recipes)
default:
    @just --list

# Install and configure git from .env variables
git-setup:
    #!/usr/bin/env bash
    set -euo pipefail
    
    if [ -z "${GIT_USER_NAME:-}" ] || [ -z "${GIT_USER_EMAIL:-}" ]; then
        echo "Error: GIT_USER_NAME and GIT_USER_EMAIL must be set in .env file"
        exit 1
    fi
    
    echo "Configuring git..."
    git config --global user.name "${GIT_USER_NAME}"
    git config --global user.email "${GIT_USER_EMAIL}"
    
    echo "Git configuration complete:"
    echo "  Name: $(git config --global user.name)"
    echo "  Email: $(git config --global user.email)"

install: git-setup
    @echo "Installation complete."

# Build the site (useful when server is already running with --watch)
build:
    hugo

serve: 
    hugo server --watch --bind="0.0.0.0" --port="1313" --baseURL="http://localhost:1313/"

# Validate meeting markdown files for Micro.blog compatibility
validate-meetings:
    #!/usr/bin/env bash
    set -euo pipefail
    python3 scripts/validate-meetings.py

# Export cleaned content for Micro.blog import
export-content: validate-meetings
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