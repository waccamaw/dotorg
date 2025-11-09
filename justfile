# Justfile for Waccamaw Indian People website
# Automates Hugo builds and Playwright screenshot generation

# Default recipe shows available commands
default:
    @just --list

# Install all dependencies
install:
    @echo "Installing dependencies..."
    npm install
    npx playwright install --with-deps chromium
    @echo "Installing Hugo..."
    @if ! command -v hugo &> /dev/null; then \
        echo "Hugo not found, installing..."; \
        wget -q https://github.com/gohugoio/hugo/releases/download/v0.121.0/hugo_0.121.0_Linux-64bit.tar.gz; \
        tar -xzf hugo_0.121.0_Linux-64bit.tar.gz; \
        sudo mv hugo /usr/local/bin/ || mv hugo ~/bin/; \
        rm hugo_0.121.0_Linux-64bit.tar.gz; \
    fi
    hugo version

# Create sample content for testing
create-content:
    @echo "Creating sample content..."
    mkdir -p content/posts
    
    @echo '---\ntitle: "Welcome to the Waccamaw Indian People"\ndate: 2025-11-08T12:00:00-05:00\n---\n\nWelcome to the official website of the Waccamaw Indian People of Aynor, South Carolina. We are a state-recognized Native American tribe with deep ancestral roots in the coastal regions of South Carolina.\n\n## Our Heritage\n\nOur ancestors, the Waccamaw, were river dwellers along the Waccamaw River from Lake Waccamaw (NC) to Winyah Bay (SC). Historical records from 1715 documented four Waccamaw villages with 610 inhabitants.\n\n## Our Community Today\n\nIn 1992, we organized as a nonprofit to preserve our culture and advocate for tribal interests. Today, our tribal headquarters is located on 20 acres of ancestral land at 591 Bluewater Road, Aynor, SC.\n\n## Our Mission\n\nWe are dedicated to:\n- Preserving our cultural heritage and traditions\n- Supporting tribal members and families\n- Educating the public about our history\n- Building a sustainable future for our people\n- Maintaining our ancestral connection to the land' > content/_index.md
    
    @echo '---\ntitle: "About the Waccamaw Indian People"\n---\n\n## Who We Are\n\nThe Waccamaw Indian People are a state-recognized Native American tribe based in Aynor, South Carolina. We became one of the first tribes in South Carolina to gain state recognition and are officially recognized by the South Carolina Commission for Minority Affairs.\n\n## Our History\n\nOur ancestors, the Waccamaw, were river dwellers along the Waccamaw River from Lake Waccamaw (NC) to Winyah Bay (SC). Historical records from 1715 documented four Waccamaw villages with 610 inhabitants.\n\nMembers of the Waccamaw Indian People trace their ancestry to the Dimery Settlement in Dog Bluff, Horry County, established in the early 1800s by Native families with roots extending back centuries.\n\nThe ancient Waccamaw were highly skilled agriculturalists who domesticated animals and cultivated crops like corn, beans, squash, and tobacco. We are believed to be among the first indigenous people encountered by European explorers in the Carolinas.\n\n## Our Organization\n\nIn 1992, we organized as a nonprofit to preserve our culture and advocate for tribal interests. Our tribal headquarters is located on 20 acres of ancestral land in the Dog Bluff community at:\n\n**591 Bluewater Road**  \n**Aynor, SC 29511**\n\n## Our Mission\n\nWe are dedicated to:\n- Preserving our cultural heritage and traditions\n- Supporting our tribal members\n- Educating the public about our history\n- Building a sustainable future for our people\n- Maintaining our ancestral connection to the land\n\n## Contact Us\n\n**Email:** waccamawchief@gmail.com  \n**Website:** waccamaw.org\n\nFor more information about the Waccamaw Indian People, please visit our tribal grounds or reach out through our contact information above.' > content/about.md
    
    @echo '---\ntitle: "Native Heritage Interpretive Trail Now Open"\ndate: 2025-11-05T10:00:00-05:00\ncategories: ["News", "Culture"]\n---\n\nWe are proud to announce the opening of our Native Heritage Interpretive Trail on our tribal grounds in Aynor. This trail highlights over 10,000 years of Waccamaw presence in the region.\n\nThe interpretive trail features:\n- Historical markers detailing our ancestral heritage\n- Educational signage about traditional practices\n- Native plant identification\n- Archaeological and cultural significance of the land\n\nDeveloped in collaboration with local educational institutions, this trail serves as an important educational resource for visitors and community members alike. The trail is open to the public and provides a meaningful way to connect with our history and culture.\n\nWe invite everyone to visit our tribal grounds at 591 Bluewater Road, Aynor, SC to walk the trail and learn about the Waccamaw Indian People'\''s enduring connection to this land.' > content/posts/heritage-trail.md
    
    @echo '---\ntitle: "Annual Pauwau Celebration 2025"\ndate: 2025-11-01T14:30:00-05:00\ncategories: ["Events", "Community"]\n---\n\nOur annual Pauwau celebration was a tremendous success! Thank you to everyone who attended and participated in this celebration of our culture and heritage.\n\nThe event featured traditional dancing, storytelling, indigenous arts and crafts, and honored our veterans. It was wonderful to see so many families come together to honor our ancestors and celebrate our living culture.\n\nThe Pauwau is held annually in Aynor and brings together community members and visitors to experience authentic Waccamaw traditions. Through these gatherings, we keep our culture alive and share our heritage with future generations.\n\nSpecial thanks to all the dancers, artists, storytellers, and volunteers who made this event possible. We look forward to next year'\''s celebration!' > content/posts/pauwau-2025.md
    
    @echo "Content created successfully!"

# Create temporary config for building
create-test-config:
    @echo "Creating test configuration..."
    @cp config.json config.json.bak
    @cat > config.json << 'EOF'
{
  "title": "Waccamaw Indian People",
  "author": {
    "name": "Waccamaw Indian People",
    "avatar": "https://micro.blog/waccamaw/avatar.jpg",
    "username": "waccamaw",
    "activitypub": {
      "username": "waccamaw",
      "url": "https://micro.blog/waccamaw"
    }
  },
  "baseURL": "http://localhost:1313/",
  "mediaTypes": {
    "application/json": {
      "suffixes": [ "json" ]
    }
  },
  "outputFormats": {
    "RSS": {
      "baseName": "feed"
    },
    "JSON": {
      "baseName": "feed"
    }
  },
  "outputs": {
    "home": [ "HTML", "RSS", "JSON" ],
    "page": [ "HTML" ],
    "section": [ "HTML" ],
    "taxonomy": [ "HTML", "RSS", "JSON" ],
    "term": [ "HTML", "RSS", "JSON" ]
  },
  "taxonomies": {
    "category": "categories"
  },
  "rssLimit": 25,
  "uglyURLs": false,
  "enableRobotsTXT": true,
  "languageCode": "en",
  "defaultContentLanguage": "en",
  "paginate": 25,
  "pluralizeListTitles": false,
  "params": {
    "description": "Official website of the Waccamaw Indian People of Aynor, SC - Preserving our heritage, building our future.",
    "about_me": "The Waccamaw Indian People are a state-recognized Native American tribe with deep ancestral roots in the coastal regions of South Carolina."
  }
}
EOF

# Restore original config
restore-config:
    @echo "Restoring original configuration..."
    @if [ -f config.json.bak ]; then \
        mv config.json.bak config.json; \
    fi

# Build Hugo site
build: create-content create-test-config
    @echo "Building Hugo site..."
    hugo --buildDrafts
    @just restore-config

# Start Hugo server in background
serve: create-content create-test-config
    @echo "Starting Hugo server..."
    hugo server --bind 0.0.0.0 --port 1313 --buildDrafts &
    @sleep 5
    @echo "Hugo server running at http://localhost:1313"

# Stop Hugo server
stop-serve:
    @echo "Stopping Hugo server..."
    @pkill -f "hugo server" || true
    @just restore-config

# Run Playwright tests to generate screenshots
screenshots: serve
    @echo "Generating screenshots with Playwright..."
    npx playwright test --config=.github/playwright.config.js
    @just stop-serve
    @echo "Screenshots generated in screenshots/ directory"

# Clean generated files
clean:
    @echo "Cleaning generated files..."
    rm -rf public resources screenshots .hugo_build.lock
    rm -rf content
    @just restore-config

# Run full screenshot generation flow (used by pre-commit)
test-all: clean install build screenshots
    @echo "All tests passed! Screenshots generated successfully."
    @echo "Screenshot files:"
    @ls -lh screenshots/

# Verify all pages are accessible
verify-pages:
    @echo "Verifying all configured pages..."
    @node .github/scripts/verify-pages.js

# Pre-commit hook - ensures screenshots are generated before commit
pre-commit: test-all
    @echo "Pre-commit checks passed!"
    @echo ""
    @echo "Screenshots have been generated. Please review them in the screenshots/ directory."
    @echo "If everything looks good, add the screenshots to your commit:"
    @echo "  git add screenshots/"

# Quick check - just run the screenshot generation without full rebuild
quick-screenshots:
    @echo "Running quick screenshot generation..."
    @if ! pgrep -f "hugo server" > /dev/null; then \
        just serve; \
    fi
    npx playwright test --config=.github/playwright.config.js
    @echo "Screenshots updated!"
