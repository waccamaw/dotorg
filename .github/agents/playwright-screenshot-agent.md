# Playwright Screenshot Agent

## Purpose
This agent ensures that all new pages added to the site are automatically included in Playwright screenshot generation and that screenshots are generated before commits.

## Required Tools

Before making any changes, ensure these tools are installed:
- **Just**: Command runner (install: `curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin`)
- **Hugo**: Static site generator (installed via `just install`)
- **Node.js**: JavaScript runtime
- **Playwright**: Browser automation (installed via `just install`)

## Instructions for AI Agents

When creating or modifying Hugo page templates, you MUST:

1. **Update the pages configuration**: Add the new page to `.github/agents/pages-config.json`
   - Include the page name, path, description, and appropriate waitForSelector
   - Follow the naming conventions specified in the config file

2. **Run the screenshot generation**: Execute `just test-all`
   - This builds the Hugo site
   - Creates sample content
   - Starts the server
   - Generates screenshots for all viewports
   - Validates all pages are accessible

3. **Verify screenshots**: Check that screenshots were generated successfully
   - Review screenshots in the `screenshots/` directory
   - Ensure all three viewports (desktop, tablet, mobile) are present
   - Verify the page content looks correct

4. **Add screenshots to commit**: Include generated screenshots in your changes
   - `git add screenshots/`
   - Screenshots should be committed with page changes

## Justfile Commands

Available commands for screenshot management:

- `just install` - Install all dependencies (Hugo, Playwright, npm packages)
- `just build` - Build the Hugo site with sample content
- `just serve` - Start Hugo development server
- `just screenshots` - Generate screenshots (server must be running)
- `just test-all` - Complete flow: install, build, serve, screenshot, cleanup
- `just clean` - Remove generated files and screenshots
- `just verify-pages` - Check that all configured pages are accessible
- `just pre-commit` - Pre-commit check (same as test-all)
- `just quick-screenshots` - Generate screenshots without full rebuild

## Pre-commit Hook

The repository includes a pre-commit hook that:
1. Automatically runs `just test-all` before each commit
2. Blocks commits if screenshot generation fails
3. Ensures all pages are working before changes are committed

### Installing the Hook

```bash
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Configuration File Location
`.github/agents/pages-config.json`

## Workflow File Location  
`.github/workflows/playwright-screenshots.yml`

## Example: Adding a New Page

If you create a new page template at `layouts/members/single.html`:

1. **Add content sample** in the Justfile `create-content` recipe:
```bash
@echo '---\ntitle: "Members Page"\n---\n\nMembers content here.' > content/members.md
```

2. **Add to pages-config.json**:
```json
{
  "name": "members",
  "path": "/members/",
  "description": "Members page with login and services",
  "waitForSelector": ".members-content"
}
```

3. **Ensure your template includes the selector**:
```html
<div class="members-content">
  <!-- page content -->
</div>
```

4. **Run screenshot generation**:
```bash
just test-all
```

5. **Verify and commit**:
```bash
git add .github/agents/pages-config.json
git add layouts/members/single.html
git add screenshots/members-*.png
git commit -m "Add members page with screenshots"
```

## Enforcement Rules

- **REQUIRED**: Every new page type must have an entry in pages-config.json
- **REQUIRED**: Every page must have a waitForSelector that exists in the rendered HTML
- **REQUIRED**: Run `just test-all` before committing page changes
- **REQUIRED**: Include generated screenshots in commits when pages change
- **RECOMMENDED**: Install the pre-commit hook to automate these checks
- **RECOMMENDED**: Mark pages as "optional": true if they might not exist in all environments

## Screenshot Output

Screenshots are generated in three sizes:
- **Desktop**: 1920x1080
- **Tablet**: 1024x1366 (iPad Pro)
- **Mobile**: 390x844 (iPhone 13 Pro)

All screenshots are saved to the `screenshots/` directory with the naming convention:
- `{page-name}-desktop.png`
- `{page-name}-tablet.png`
- `{page-name}-mobile.png`

## Validation

The screenshot generation includes validation that checks:
- All configured pages return HTTP 200
- All waitForSelector elements can be found
- Screenshots are generated successfully for all viewports
- Content renders without JavaScript errors

Failed validations will block the screenshot generation and provide error details.

## CI/CD Integration

The GitHub Actions workflow automatically:
1. Runs on every push and pull request
2. Uses `just test-all` to generate screenshots
3. Uploads screenshots as artifacts (30-day retention)
4. Posts screenshots as PR comments for review
5. Updates existing PR comments on new pushes

## Troubleshooting

### "just: command not found"
Install Just: `curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin`

### "No tests found"
Ensure paths in `.github/playwright.config.js` use `path.join(__dirname, 'tests')`

### "Page not accessible"
1. Check that content exists for the page
2. Verify the Hugo template exists
3. Ensure the path in pages-config.json matches the page URL

### Screenshots look wrong
1. Check that waitForSelector exists on the page
2. Verify CSS is loading correctly
3. Review console errors in Playwright output
4. Check viewport sizes in playwright.config.js

## Updating This Agent

If you modify the screenshot generation workflow or add new requirements:
1. Update this agent file with the new requirements
2. Update the pages-config.json schema if needed  
3. Update the Playwright test file if the logic changes
4. Update the Justfile with new commands as needed
5. Document the changes in the workflow file comments
6. Update .github/README.md with any user-facing changes

