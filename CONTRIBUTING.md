# Contributing to Waccamaw.org

Thank you for your interest in contributing to the Waccamaw Indian People's website! This guide will help you make contributions using GitHub Copilot, even if you're new to web development.

## Table of Contents

- [Getting Started](#getting-started)
- [GitHub Copilot Workflow](#github-copilot-workflow)
- [Making Changes](#making-changes)
- [Pull Request Requirements](#pull-request-requirements)
- [Code Standards](#code-standards)
- [Getting Help](#getting-help)

## Getting Started

### Prerequisites

1. **GitHub Account** - [Sign up at GitHub](https://github.com/signup)
2. **GitHub Copilot Access** - Available free for students, teachers, and open source maintainers
3. **VS Code** - [Download Visual Studio Code](https://code.visualstudio.com/)
4. **Git** - Usually pre-installed on Mac/Linux, [download for Windows](https://git-scm.com/)

### First-Time Setup

1. **Fork the repository** on GitHub (click "Fork" button)
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/dotorg.git
   cd dotorg
   ```
3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your name and email
   ```
4. **Configure Git**:
   ```bash
   just git-setup
   ```

## GitHub Copilot Workflow

We use **GitHub Copilot** to assist with development. This makes contributing easier, especially for those new to Hugo or web development.

### Step 1: Create an Issue

Before making changes, create a GitHub Issue describing what you want to do:

1. Go to **Issues** tab on GitHub
2. Click **New Issue**
3. Choose a template:
   - **Bug Report** - Something isn't working
   - **Feature Request** - New functionality
   - **Content Update** - Blog posts, tribal info
   - **Documentation** - Improve docs

4. **Assign to Copilot** - Add label `copilot-assist` to get AI suggestions

### Step 2: Create a Branch

Always work in a feature branch, never directly on `main`:

```bash
git checkout -b feature/your-feature-name
# Examples:
# git checkout -b feature/add-meeting-notes
# git checkout -b fix/mobile-menu-bug
# git checkout -b content/november-meeting
```

### Step 3: Use Copilot for Development

#### Ask Copilot for Help

Open Copilot Chat in VS Code (`Ctrl+Shift+I` or `Cmd+Shift+I`) and ask:

- "How do I add a new blog post about our tribal meeting?"
- "Help me create a photo gallery page"
- "Fix the mobile menu layout issue"
- "Explain what this Hugo template does"

#### Let Copilot Write Code

1. Copilot will suggest changes based on context
2. Review the suggestions carefully
3. Accept changes that make sense
4. Test locally with `just serve`

#### Example Copilot Conversations

**Adding a blog post:**
```
You: "I need to add a blog post about our November meeting"
Copilot: "I'll create a new markdown file in the correct location..."
[Copilot creates content/2025/11/18/november-meeting.md]
```

**Fixing a layout issue:**
```
You: "The mobile menu is overlapping the logo on iPhone"
Copilot: "I'll check the CSS and template files..."
[Copilot analyzes layouts/partials/header.html and suggests fixes]
```

### Step 4: Test Your Changes

1. **Start local server**:
   ```bash
   just serve
   ```

2. **Test on desktop**:
   - Open http://localhost:1313/
   - Navigate to changed pages
   - Verify everything looks correct

3. **Test on mobile**:
   - Open Chrome DevTools (`F12`)
   - Click device toolbar icon
   - Test iPhone, iPad, Android sizes
   - **Take screenshots** (required for PR)

4. **Check different browsers**:
   - Chrome
   - Firefox  
   - Safari (if on Mac)

### Step 5: Take Screenshots

**REQUIRED**: Every PR must include screenshots showing your changes.

#### Desktop Screenshots

1. Open your browser to the changed page
2. Make window full-size (1920x1080 or similar)
3. Take screenshot (`Cmd+Shift+4` on Mac, `Win+Shift+S` on Windows)
4. Save as `desktop-screenshot.png`

#### Mobile Screenshots

1. Open Chrome DevTools (`F12`)
2. Toggle device toolbar
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Screenshot the preview
5. Save as `mobile-screenshot.png`

### Step 6: Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add November 2025 tribal meeting notes"
# Or: "Fix mobile menu overlap on iPhone"
# Or: "Update about page with 2025 officer information"
```

### Step 7: Push and Create Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub:
   - Go to the repository on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template (see below)
   - **Upload your screenshots**
   - Submit!

## Pull Request Requirements

Every pull request **MUST** include:

### ✅ Required Checklist

- [ ] Desktop screenshot attached
- [ ] Mobile screenshot attached
- [ ] Description of changes
- [ ] Link to related issue
- [ ] Tested locally with `just serve`
- [ ] No broken links or images
- [ ] Follows Hugo template conventions
- [ ] Microformats preserved (if editing templates)
- [ ] Responsive on mobile and desktop

### Screenshots

**How to attach screenshots:**

1. Drag and drop images into the PR description
2. Or click "Attach files by dragging & dropping..."
3. Name them clearly: `desktop-homepage.png`, `mobile-menu.png`

**What to capture:**

- **Desktop**: Full browser window at 1920x1080 or 1440x900
- **Mobile**: iPhone 12 Pro (390x844) or similar
- Show the **specific changes** you made
- Capture **before and after** if fixing a bug

### Description Template

The PR template will guide you, but here's what to include:

```markdown
## Description
Brief explanation of what changed and why.

## Related Issue
Fixes #123

## Changes Made
- Added new blog post for November meeting
- Updated meeting archive page
- Fixed broken image link

## Testing
- [x] Tested on desktop Chrome
- [x] Tested on mobile (iPhone 12 Pro simulation)
- [x] All links work
- [x] Images load correctly
- [x] No console errors

## Screenshots

### Desktop
![Desktop view](desktop-screenshot.png)

### Mobile  
![Mobile view](mobile-screenshot.png)
```

## Code Standards

### Hugo Templates

- Use **tabs for indentation** (not spaces)
- Preserve existing **microformats** (h-entry, h-feed, p-name, etc.)
- Follow **Go template syntax**
- Keep templates **semantic and accessible**

### Content Files

- Use **Markdown** for all content
- Include **front matter** (title, date, categories)
- Use **ISO date format**: `2025-11-18T10:30:00-05:00`
- Store in correct **date hierarchy**: `content/YYYY/MM/DD/filename.md`

### CSS

- Keep styles in `static/theme.css`
- Use **mobile-first** approach
- Test on multiple screen sizes
- Avoid inline styles unless necessary

### Configuration

- **Never** modify placeholder values like `[USERNAME]` in config.json
- Preserve existing **output formats** and **taxonomies**
- Document any configuration changes

## Common Tasks

### Add a Blog Post

Ask Copilot:
```
"Create a new blog post for November 18, 2025 tribal meeting"
```

Copilot will create:
```
content/2025/11/18/tribal-meeting-november.md
```

With proper front matter:
```yaml
---
title: "November 2025 Tribal Meeting"
date: 2025-11-18T18:00:00-05:00
categories:
  - meetings
---

Meeting content here...
```

### Add Photos

1. Place images in `static/uploads/`
2. Reference in markdown: `![Description](/uploads/photo.jpg)`
3. Or ask Copilot to create a photo gallery page

### Update Tribal Information

1. Edit relevant markdown file in `content/`
2. Common files:
   - `content/about.md` - About the tribe
   - `content/meetings.md` - Meeting information
3. Ask Copilot if unsure which file to edit

### Modify Layout/Design

**⚠️ Advanced**: Template changes require Hugo knowledge.

1. Ask Copilot: "Explain what this template does"
2. Make changes in `layouts/`
3. **Test thoroughly** on mobile and desktop
4. Ensure **microformats** are preserved

## Architecture Awareness

When making changes, understand our **multi-platform architecture**:

### Routing Structure

```
waccamaw.org/
├── home/      → Framer (marketing site)
├── updates/   → Micro.blog (this repo)
└── members/   → Future microservice
```

**Cloudflare Workers** handles routing between platforms.

### What This Means

- This repo only handles `/updates` content
- Don't add content meant for `/home` or `/members`
- If unsure, **ask in the issue** before starting

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Getting Help

### Ask Copilot

Copilot Chat in VS Code is your first resource:
- "How do I...?"
- "What does this code do?"
- "Fix this error: [paste error]"

### Ask the Community

- **Create an issue** for questions
- **Comment on your PR** if stuck
- **Tag reviewers** for help

### Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Micro.blog Help](https://help.micro.blog/)
- [Markdown Guide](https://www.markdownguide.org/)
- [VS Code + Copilot Guide](https://code.visualstudio.com/docs/copilot/overview)

## Review Process

After submitting your PR:

1. **Automated checks** run (if configured)
2. **Maintainers review** your changes
3. **Copilot may suggest** improvements
4. **Address feedback** if requested
5. **PR merged** when approved! 🎉

## Best Practices

### Do's ✅

- **Always** work in a feature branch
- **Always** include screenshots
- **Test** on mobile and desktop
- **Ask Copilot** when unsure
- **Link** to related issues
- **Keep commits** small and focused
- **Update documentation** if needed

### Don'ts ❌

- **Don't** commit to `main` directly
- **Don't** submit PRs without screenshots
- **Don't** modify `config.json` placeholders
- **Don't** break microformats in templates
- **Don't** add large images without optimization
- **Don't** skip testing on mobile

## Examples

### Example 1: Adding Meeting Notes

```bash
# 1. Create issue: "Add October 2025 meeting notes"
# 2. Create branch
git checkout -b content/october-meeting

# 3. Ask Copilot to create the file
# Copilot creates: content/2025/10/15/monthly-meeting.md

# 4. Test locally
just serve

# 5. Take screenshots (desktop + mobile)

# 6. Commit and push
git add .
git commit -m "Add October 2025 tribal meeting notes"
git push origin content/october-meeting

# 7. Create PR with screenshots
```

### Example 2: Fixing Mobile Bug

```bash
# 1. Create issue: "Mobile menu overlaps logo on iPhone"
# 2. Create branch
git checkout -b fix/mobile-menu-overlap

# 3. Ask Copilot: "Fix mobile menu overlap in header"
# Copilot modifies layouts/partials/header.html

# 4. Test on mobile (Chrome DevTools)

# 5. Take before/after screenshots

# 6. Commit and push
git add layouts/partials/header.html
git commit -m "Fix mobile menu overlap on small screens"
git push origin fix/mobile-menu-overlap

# 7. Create PR with before/after screenshots
```

## Recognition

Contributors will be:
- Listed in repository insights
- Mentioned in release notes
- Acknowledged in tribal communications

Thank you for helping preserve and share Waccamaw heritage online! 🪶

---

**Questions?** Open an issue or ask in your PR comments. We're here to help!
