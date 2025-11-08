# Playwright Screenshot Automation

This directory contains the automated screenshot generation system for the Waccamaw Indian People website.

## 📸 What It Does

Automatically generates screenshots of all major pages in:
- **Desktop view** (1920x1080)
- **Tablet view** (1024x1366)
- **Mobile view** (390x844)

Screenshots are generated on:
- Every push to any branch
- Every pull request
- Can be manually triggered

## 📁 File Structure

```
.github/
├── workflows/
│   └── playwright-screenshots.yml   # GitHub Actions workflow
├── tests/
│   └── screenshots.spec.js          # Playwright test file
├── agents/
│   ├── pages-config.json            # Page configuration
│   └── playwright-screenshot-agent.md  # Agent instructions
└── playwright.config.js             # Playwright configuration
```

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

### Page Configuration Options

- `name` (required): Unique identifier for the page (used in screenshot filename)
- `path` (required): URL path relative to site root
- `description` (required): Human-readable description
- `waitForSelector` (optional): CSS selector to wait for before screenshot
- `optional` (optional): Set to `true` for pages that might not exist

## 🎯 Viewing Screenshots

### In Pull Requests
Screenshots are automatically posted as a comment on PRs with side-by-side comparisons.

### In GitHub Actions
1. Go to the Actions tab
2. Click on the workflow run
3. Download the `playwright-screenshots-{commit-sha}` artifact

### Local Testing

To test screenshot generation locally:

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Start Hugo server
hugo server --buildDrafts

# Run Playwright tests (in another terminal)
npx playwright test --config=.github/playwright.config.js
```

## 🤖 Agent Enforcement

The `playwright-screenshot-agent.md` file contains instructions for AI agents to:
- Automatically add new pages to the configuration
- Ensure proper selectors are used
- Validate page accessibility

## 📊 Screenshot Naming Convention

Screenshots are named: `{page-name}-{device}.png`

Examples:
- `home-desktop.png`
- `about-tablet.png`
- `archive-mobile.png`

## 🔍 Troubleshooting

### Page not appearing in screenshots
1. Check that the page exists in `pages-config.json`
2. Verify the `path` is correct
3. Ensure `waitForSelector` element exists on the page

### Screenshots failing
1. Check the GitHub Actions logs
2. Verify Hugo builds successfully
3. Test the page locally with Hugo server

### Missing screenshots
1. Check if page is marked as `"optional": true`
2. Verify the page template exists in `layouts/`
3. Ensure the page has content to render

## 📝 Maintenance

- Screenshots are retained for 30 days in GitHub Actions
- Update `pages-config.json` when adding/removing pages
- Review agent instructions when changing workflow behavior
- Keep Playwright and Hugo versions updated in workflow file

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hugo Documentation](https://gohugo.io/documentation/)
