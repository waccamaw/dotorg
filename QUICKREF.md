# Quick Reference Card

Fast reference for common tasks and commands.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/waccamaw/dotorg.git
cd dotorg

# Set up environment
cp .env.example .env
# Edit .env with your details

# Configure git
just git-setup

# Start local server
just serve

# Visit: http://localhost:1313/
```

## 📝 Common Tasks

### Add Blog Post

```bash
# Create post file
# Path: content/YYYY/MM/DD/post-name.md

# Front matter:
---
title: "Post Title"
date: 2025-11-18T10:30:00-05:00
categories:
  - meetings
---

Your content...
```

### Create Feature Branch

```bash
git checkout -b feature/description
# Or: fix/bug-name
# Or: content/post-name
# Or: docs/update-name
```

### Test Changes Locally

```bash
just serve
# Visit http://localhost:1313/

# Or manually:
hugo server --watch --bind="0.0.0.0" --port="1313"
```

### Take Required Screenshots

**Desktop**: 1920x1080 or 1440x900
- Mac: `Cmd + Shift + 4`
- Windows: `Win + Shift + S`

**Mobile**: Use Chrome DevTools
- Open DevTools: `F12`
- Toggle device toolbar
- Select iPhone 12 Pro (390x844)
- Take screenshot

### Commit and Push

```bash
git add .
git commit -m "Descriptive message"
git push origin your-branch-name
```

### Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill out template:
   - Description
   - Desktop screenshot
   - Mobile screenshot
   - Testing checklist
4. Submit

## 🎯 Issue Templates

### Bug Report
`.github/ISSUE_TEMPLATE/bug_report.md`
- For things that don't work correctly

### Feature Request
`.github/ISSUE_TEMPLATE/feature_request.md`
- For new functionality ideas

### Content Update
`.github/ISSUE_TEMPLATE/content_update.md`
- For blog posts, tribal info, photos

### Documentation
`.github/ISSUE_TEMPLATE/documentation.md`
- For improving docs

## 🤖 Ask Copilot

### Common Questions

```
"How do I add a blog post about the November meeting?"

"Create a photo gallery page for the powwow"

"Fix the mobile menu layout on small screens"

"Update the about page with new officer information"

"Explain what this Hugo template does"

"Where should I put tribal meeting notes?"
```

## 📂 File Locations

### Content
```
content/
├── about.md              # About the tribe
├── meetings.md           # Meeting info
├── photos.md             # Photo gallery
└── YYYY/MM/DD/          # Blog posts
    └── post-name.md
```

### Templates
```
layouts/
├── _default/
│   ├── baseof.html      # Base template
│   ├── single.html      # Single post
│   └── list.html        # List pages
└── partials/
    ├── header.html      # Header
    ├── footer.html      # Footer
    └── head.html        # HTML <head>
```

### Styles
```
static/
├── theme.css            # Main stylesheet
├── uploads/             # User-uploaded images
└── logos/               # Tribal logos
```

### Config
```
config.json              # Hugo configuration
                         # ⚠️ Don't edit [PLACEHOLDERS]
```

## 🔍 Testing Checklist

### Before Every PR

- [ ] Tested locally with `just serve`
- [ ] Desktop screenshot (1920x1080)
- [ ] Mobile screenshot (390x844)
- [ ] No console errors
- [ ] Links work
- [ ] Images load
- [ ] Mobile responsive

### For Template Changes (Additional)

- [ ] Microformats preserved (h-entry, h-feed, etc.)
- [ ] Semantic HTML maintained
- [ ] RSS/JSON feeds still valid
- [ ] No Hugo build errors

## 🌐 Architecture Quick Ref

### URL Structure
```
waccamaw.org/
├── home/      → Framer (marketing)
├── updates/   → Micro.blog (this repo)
└── members/   → Future (member portal)
```

### This Repository Scope
- **Only** handles `/updates/` content
- Blog posts, news, meetings, photos
- Don't add content for `/home/` or `/members/`

## 📋 PR Requirements

Every PR **MUST** have:

✅ Desktop screenshot (1920x1080)
✅ Mobile screenshot (390x844)
✅ Clear description
✅ Link to issue
✅ Testing checklist completed

## 🔧 Available Commands (Just)

```bash
just              # List all commands
just install      # First-time setup
just git-setup    # Configure git
just serve        # Start Hugo server
```

## 🚨 Don'ts

❌ Never modify `config.json` placeholders
❌ Never commit to `main` directly
❌ Never break microformats
❌ Never skip mobile testing
❌ Never forget screenshots in PR
❌ Never add large unoptimized images

## ✅ Do's

✅ Always work in feature branch
✅ Always test locally
✅ Always include screenshots
✅ Always link to issues
✅ Always update docs if needed
✅ Always ask Copilot when unsure

## 📊 Standard Screen Sizes

| Device | Resolution | Use For |
|--------|------------|---------|
| iPhone 12 Pro | 390x844 | Mobile screenshot |
| iPad | 820x1180 | Tablet testing |
| Desktop HD | 1920x1080 | Desktop screenshot |
| Desktop | 1440x900 | Alternative desktop |

## 🎨 Microformats Reference

**Key classes to preserve:**

```html
<article class="h-entry">
  <h1 class="p-name">Title</h1>
  <time class="dt-published" datetime="2025-11-18T10:30:00-05:00">
    Nov 18, 2025
  </time>
  <div class="e-content">Content...</div>
  <a class="u-url" href="/permalink/">Link</a>
</article>
```

Classes:
- `h-entry` - Blog post
- `h-feed` - Post collection
- `p-name` - Title
- `dt-published` - Date
- `e-content` - Content
- `u-url` - Permalink

## 📅 Date Format

Always use **ISO 8601**:

```
2025-11-18T10:30:00-05:00
│   │ │  │ │ │ │  │└─ Timezone offset
│   │ │  │ │ │ │  └─── Seconds
│   │ │  │ │ │ └────── Minutes
│   │ │  │ │ └──────── Hours (24h)
│   │ │  │ └────────── Day
│   │ │  └──────────── Month
│   └─────────────────── Year
```

## 🔗 Documentation Links

- [README.md](./README.md) - Overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [DOCS.md](./DOCS.md) - Documentation index
- [DIAGRAMS.md](./DIAGRAMS.md) - Visual diagrams

## 📞 Getting Help

1. Ask Copilot
2. Check docs
3. Create issue
4. Contact: WaccamawChief@gmail.com

## 🎓 Workflow Summary

```
1. Create issue
2. Create branch
3. Ask Copilot
4. Make changes
5. Test locally
6. Take screenshots
7. Commit & push
8. Create PR
9. Review
10. Merge
11. Auto-deploy
```

---

**Print this or keep it handy!**

**Last Updated**: November 18, 2025
