# Playwright Screenshot Automation

This directory contains the automated screenshot generation system for the Waccamaw Indian People website using **Just** for task automation.

## 📸 What It Does

Automatically generates screenshots of all major pages in:
- **Desktop view** (1920x1080)
- **Tablet view** (1024x1366)
- **Mobile view** (390x844)

Screenshots are generated:
- On every push to any branch (via GitHub Actions)
- On every pull request (via GitHub Actions)
- Before every commit (via optional pre-commit hook)
- Manually using `just` commands

## 🚀 Quick Start

### Prerequisites

1. **Install Just** (command runner):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin
```

2. **Install all dependencies**:
```bash
just install
```

### Generate Screenshots

Run the complete screenshot generation flow:
```bash
just test-all
```

This will:
1. Clean previous builds
2. Install dependencies (if needed)
3. Create sample content
4. Build the Hugo site  
5. Start the Hugo server
6. Generate screenshots for all pages
7. Stop the server and clean up

Screenshots will be in the `screenshots/` directory.

## 📋 Available Commands

View all available commands:
```bash
just --list
```

Key commands:

| Command | Description |
|---------|-------------|
| `just install` | Install Hugo, Playwright, and npm dependencies |
| `just build` | Build the Hugo site with sample content |
| `just serve` | Start Hugo development server |
| `just screenshots` | Generate screenshots (server must be running) |
| `just test-all` | Complete flow: build, serve, screenshot, cleanup |
| `just clean` | Remove generated files and screenshots |
| `just verify-pages` | Check that all configured pages are accessible |
| `just pre-commit` | Run pre-commit checks (same as test-all) |
| `just quick-screenshots` | Generate screenshots without full rebuild |

## 🔧 Configuration

### Adding a New Page

Edit `.github/agents/pages-config.json`:

```json
{
  "name": "your-page-name",
  "path": "/your-page/",
  "description": "Description of the page",
  "waitForSelector": ".main-content"
}
```

Then run `just test-all` to generate screenshots for the new page.

### Page Configuration Options

- `name` (required): Unique identifier for the page (used in screenshot filename)
- `path` (required): URL path relative to site root
- `description` (required): Human-readable description
- `waitForSelector` (optional): CSS selector to wait for before screenshot
- `optional` (optional): Set to `true` for pages that might not exist

## 🎯 Viewing Screenshots

### Locally

After running `just test-all`, screenshots are in the `screenshots/` directory:

```bash
ls -la screenshots/
# Output:
# home-desktop.png
# home-tablet.png
# home-mobile.png
# about-desktop.png
# ...
```

### In Pull Requests

Screenshots are automatically posted as a comment on PRs with a table showing all generated files.

### In GitHub Actions

1. Go to the Actions tab
2. Click on the workflow run
3. Download the `playwright-screenshots-{commit-sha}` artifact

## 🪝 Pre-commit Hook (Optional)

Install the pre-commit hook to automatically generate screenshots before commits:

```bash
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

This will run `just test-all` before every commit and block the commit if screenshot generation fails.

To bypass (not recommended):
```bash
git commit --no-verify -m "Your message"
```

## 🤖 Agent Enforcement

The `playwright-screenshot-agent.md` file contains instructions for AI agents to:
- Automatically add new pages to the configuration
- Ensure proper selectors are used
- Validate page accessibility
- Run screenshot generation before commits

## 📊 Screenshot Naming Convention

Screenshots are named: `{page-name}-{device}.png`

Examples:
- `home-desktop.png`
- `about-tablet.png`
- `archive-mobile.png`

## 🔍 Troubleshooting

### Just command not found
```bash
# Install Just
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin
# Add to PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Page not appearing in screenshots
1. Check that the page exists in `pages-config.json`
2. Verify the `path` is correct
3. Ensure `waitForSelector` element exists on the page
4. Run `just serve` and manually visit the page URL

### Screenshots failing
1. Check the terminal output for errors
2. Verify Hugo builds successfully: `just build`
3. Test the page locally: `just serve` then visit http://localhost:1313

### Missing screenshots
1. Check if page is marked as `"optional": true`
2. Verify the page template exists in `layouts/`
3. Ensure the page has content to render
4. Check `just verify-pages` output

## 📝 Development Workflow

1. **Make changes** to layouts or styles
2. **Add new pages** to `pages-config.json` if needed
3. **Run screenshots**: `just test-all`
4. **Review screenshots** in `screenshots/` directory
5. **Commit changes**: `git add . && git commit -m "Your message"`
6. **Push**: `git push` (GitHub Actions will run automatically)

## 🔗 File Structure

```
.github/
├── workflows/
│   └── playwright-screenshots.yml   # GitHub Actions workflow (uses Justfile)
├── tests/
│   └── screenshots.spec.js          # Playwright test file
├── agents/
│   ├── pages-config.json            # Page configuration
│   └── playwright-screenshot-agent.md  # Agent instructions (updated)
├── hooks/
│   ├── pre-commit                   # Pre-commit hook template
│   └── README.md                    # Hook installation guide
├── scripts/
│   └── verify-pages.js              # Page verification script
├── playwright.config.js             # Playwright configuration
└── README.md                        # This file

justfile                              # Task automation (NEW!)
package.json                          # npm dependencies (NEW!)
```

## 🔗 Resources

- [Just Documentation](https://just.systems/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hugo Documentation](https://gohugo.io/documentation/)

