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

serve: 
    hugo server --watch --bind="0.0.0.0" --port="1313" --baseURL="http://localhost:1313/"

# Export cleaned content for Micro.blog import
export-content:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "📦 Creating content export for Micro.blog import..."
    
    # Create temporary directory for export
    EXPORT_DIR=$(mktemp -d)
    EXPORT_FILE="content-export-$(date +%Y%m%d-%H%M%S).zip"
    
    # Copy content directory structure
    echo "📋 Copying content files..."
    
    # Copy cleaned meetings from content/meetings/
    if [ -d "content/meetings" ]; then
        mkdir -p "$EXPORT_DIR/content/meetings"
        cp -r content/meetings/* "$EXPORT_DIR/content/meetings/" 2>/dev/null || true
        MEETING_COUNT=$(find content/meetings -name '*.md' | wc -l)
        echo "  ✓ Copied $MEETING_COUNT meeting files"
    fi
    
    # Copy updates from content/updates/ if it exists
    if [ -d "content/updates" ]; then
        mkdir -p "$EXPORT_DIR/content/updates"
        cp -r content/updates/* "$EXPORT_DIR/content/updates/" 2>/dev/null || true
        UPDATE_COUNT=$(find content/updates -name '*.md' 2>/dev/null | wc -l)
        echo "  ✓ Copied $UPDATE_COUNT update files"
    fi
    
    # Copy replies from content/replies/ if it exists
    if [ -d "content/replies" ]; then
        mkdir -p "$EXPORT_DIR/content/replies"
        cp -r content/replies/* "$EXPORT_DIR/content/replies/" 2>/dev/null || true
        REPLY_COUNT=$(find content/replies -name '*.md' 2>/dev/null | wc -l)
        echo "  ✓ Copied $REPLY_COUNT reply files"
    fi
    
    # Copy static pages (about, meetings, photos, etc.)
    for file in content/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$EXPORT_DIR/content/"
            echo "  ✓ Copied $(basename $file)"
        fi
    done
    
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