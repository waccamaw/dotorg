# Playwright Screenshot Agent

## Purpose
This agent ensures that all new pages added to the site are automatically included in Playwright screenshot generation.

## Instructions for AI Agents

When creating or modifying Hugo page templates, you MUST:

1. **Update the pages configuration**: Add the new page to `.github/agents/pages-config.json`
   - Include the page name, path, description, and appropriate waitForSelector
   - Follow the naming conventions specified in the config file

2. **Verify the page works**: Ensure the page:
   - Has a valid Hugo template in `layouts/`
   - Renders correctly with test content
   - Has appropriate selectors for Playwright to wait for

3. **Test locally**: Before committing:
   - Run `hugo server` locally
   - Verify the page loads at the specified path
   - Ensure the waitForSelector element exists on the page

## Configuration File Location
`.github/agents/pages-config.json`

## Workflow File Location
`.github/workflows/playwright-screenshots.yml`

## Example: Adding a New Page

If you create a new page template at `layouts/members/single.html`:

1. Add to `pages-config.json`:
```json
{
  "name": "members-page",
  "path": "/members/",
  "description": "Members page with login and services",
  "waitForSelector": ".members-content"
}
```

2. Ensure your template includes the selector:
```html
<div class="members-content">
  <!-- page content -->
</div>
```

## Enforcement Rules

- **REQUIRED**: Every new page type must have an entry in pages-config.json
- **REQUIRED**: Every page must have a waitForSelector that exists in the rendered HTML
- **RECOMMENDED**: Test the page locally before committing
- **RECOMMENDED**: Mark pages as "optional": true if they might not exist in all environments

## Screenshot Output

Screenshots will be generated in three sizes:
- **Desktop**: 1920x1080
- **Tablet**: 1024x1366 (iPad Pro)
- **Mobile**: 390x844 (iPhone 13 Pro)

All screenshots are saved to the `screenshots/` directory and uploaded as artifacts.

## Validation

The Playwright test suite includes a validation test that checks:
- All configured pages are accessible
- All pages return successful HTTP responses
- All waitForSelector elements can be found

If a page fails these checks, the workflow will report a warning but continue.

## Updating This Agent

If you modify the screenshot generation workflow or add new requirements:
1. Update this agent file with the new requirements
2. Update the pages-config.json schema if needed
3. Update the Playwright test file if the logic changes
4. Document the changes in the workflow file comments
