---
name: Template/Code Change
about: Modify Hugo templates, layouts, CSS, or configuration (ADVANCED)
title: "[TEMPLATE] "
labels: ["template", "requires-review"]
assignees: []
---

## ⚠️ WARNING: Advanced Template Change

**This issue is for CODE changes to how the website works, NOT for adding content.**

### Before proceeding, ask yourself:

- ❓ **Are you adding a blog post or updating tribal information?** 
  → Use [Content Update](.github/ISSUE_TEMPLATE/content_update.md) issue instead, or post directly via [Micro.blog interface](.github/MICROBLOG_POSTING_GUIDE.md)

- ❓ **Are you fixing how something looks or works?**
  → Continue with this template (you're in the right place)

---

## 🚨 Template Change Danger Zone - READ CAREFULLY

Changes to `layouts/`, `static/theme.css`, or `config.json` can:

- ❌ **Break Micro.blog sync** (content won't publish)
- ❌ **Break RSS/JSON feeds** (subscribers won't see updates)
- ❌ **Break microformats** (IndieWeb features stop working)
- ❌ **Create infinite loops** (site won't build)
- ❌ **Break mobile display** (tribal members can't view site)

### Required Reading Before Making Changes

- [ ] I have read [`.github/MICROBLOG_QUIRKS.md`](.github/MICROBLOG_QUIRKS.md)
- [ ] I understand this change could break the website
- [ ] I will test on all three required devices (desktop, tablet, mobile)
- [ ] I will preserve microformats (h-entry, h-feed, p-name, dt-published)
- [ ] I will test with 0 posts, 1 post, and 50+ posts

---

## Change Description

<!-- What are you changing and why? -->

## Files to Modify

<!-- Which template/code files will you change? -->

- [ ] `layouts/` (Hugo templates)
- [ ] `static/theme.css` (CSS styles)
- [ ] `config.json` (Hugo configuration)
- [ ] Other code files:

### Specific Files

<!-- List exact files you'll modify -->

- `layouts/path/to/file.html` - Description of change
- `static/theme.css` - Description of change

## Problem This Solves

<!-- What issue does this fix? Link to bug report if applicable -->

Fixes #

## Proposed Solution

<!-- How will you fix it? -->

### Code Changes

```html
<!-- Example of proposed template change -->
```

```css
/* Example of proposed CSS change */
```

## Testing Plan

### Desktop Testing
- [ ] Chrome (1920x1080)
- [ ] Firefox (1920x1080)
- [ ] Safari (1440x900)
- [ ] No console errors
- [ ] No broken images/links
- [ ] Text readable and properly formatted

### Tablet Testing (iPad Pro M4)
- [ ] Safari (1366x1024 landscape)
- [ ] Safari (1024x1366 portrait)
- [ ] Touch targets adequate (44x44px minimum)
- [ ] No horizontal scroll
- [ ] Navigation works on touch

### Mobile Testing (iPhone 17 Pro)
- [ ] Safari (402x874)
- [ ] No horizontal scroll
- [ ] Text readable without zoom
- [ ] Images scale appropriately
- [ ] All interactive elements work

### Template-Specific Testing
- [ ] Hugo builds without errors (`just serve`)
- [ ] Tested with 0 posts (empty blog)
- [ ] Tested with 1 post (single item)
- [ ] Tested with 50+ posts (full blog)
- [ ] RSS feed validates (https://validator.w3.org/feed/)
- [ ] JSON feed validates
- [ ] Microformats preserved (use https://indiewebify.me/)

### Content Loop Testing
- [ ] No infinite loops in `range` statements
- [ ] All loops have proper bounds
- [ ] Recursive partials have exit conditions
- [ ] Template doesn't hang during build

## Microformats Checklist

<!-- CRITICAL: These MUST be preserved in any template change -->

- [ ] `h-entry` class on blog posts
- [ ] `h-feed` class on list pages
- [ ] `p-name` class on titles
- [ ] `dt-published` class on dates
- [ ] `e-content` class on post content
- [ ] `u-url` class on permalinks
- [ ] `p-author` class on author information

## Breaking Change Impact

<!-- Could this change break anything? -->

- [ ] **No breaking changes** - Pure visual/CSS update
- [ ] **Possible breaking change** - Changes template structure
- [ ] **Definite breaking change** - Modifies feeds, microformats, or core layouts

### If Breaking Change, What's the Mitigation?

<!-- How will you ensure nothing breaks? -->

## Deployment Considerations

- [ ] Requires Micro.blog republish
- [ ] Requires manual testing on Micro.blog after deploy
- [ ] May need rollback plan
- [ ] Needs tribal leadership notification

## Screenshots Required

<!-- ALL THREE are MANDATORY for template changes -->

### Desktop View (1920x1080 or 1440x900)

**Before:**

<!-- Drag screenshot showing current state -->

**After:**

<!-- Drag screenshot showing new change -->

### Tablet View (iPad Pro M4 - 1366x1024)

**Before:**

<!-- Drag screenshot showing current state -->

**After:**

<!-- Drag screenshot showing new change -->

### Mobile View (iPhone 17 Pro - 402x874)

**Before:**

<!-- Drag screenshot showing current state -->

**After:**

<!-- Drag screenshot showing new change -->

## Additional Context

<!-- Any other relevant information -->

---

## For Contributors

### ⚠️ This is an ADVANCED issue - Code experience required

**Skills needed:**
- Hugo template syntax (Go HTML)
- CSS (for style changes)
- Understanding of microformats
- Ability to test across multiple devices

**Not sure if you should tackle this?** Ask in the issue comments!

### Quick Guide

1. **Read all warnings above** carefully
2. **Comment** to claim this issue
3. **Create branch**: `template/brief-description`
4. **Test thoroughly** with `just serve`
5. **Take all 6 screenshots** (desktop/tablet/mobile, before/after)
6. **Submit PR** with detailed testing notes

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed steps.

### Tips

- Ask Copilot: "Explain what this template does before I modify it"
- Ask Copilot: "Check if this change preserves microformats"
- Ask Copilot: "Test this template with edge cases"
- **Always** verify feeds still work after template changes
- **Always** test on actual devices (not just DevTools simulation)

---

## Reviewer Checklist

For reviewers approving this PR:

- [ ] All 6 screenshots present (3 before, 3 after)
- [ ] Microformats verified preserved
- [ ] Tested locally with `just serve`
- [ ] No Hugo build errors
- [ ] RSS/JSON feeds validate
- [ ] Mobile responsive maintained
- [ ] Breaking changes documented
- [ ] Rollback plan if needed
