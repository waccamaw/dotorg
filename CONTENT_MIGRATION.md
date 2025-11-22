# Content Migration Guide

## Overview

This guide documents the migration from date-based content organization (`/content/YYYY/MM/DD/`) to section-based organization (`/content/updates/`, `/content/meetings/`).

## New Structure

```
content/
├── updates/              # Blog posts, announcements, events
│   ├── _index.md
│   └── YYYY-MM-DD-title.md
├── meetings/             # Tribal meeting minutes (existing)
│   └── ...
├── about.md             # Static pages
├── photos.md
└── YYYY/MM/DD/          # Legacy posts (to be migrated)
```

## Content Cleanup Checklist

When migrating posts from `/content/YYYY/MM/DD/` to `/content/updates/`, make these changes:

### ✅ Front Matter Updates

**Before (Scraped):**
```yaml
---
layout: post
microblog: true
guid: http://waccamaw.micro.blog/2025/10/05/longhouse-workday.html
post_id: 5645026
custom_summary: false
summary: ""
date: 2025-10-05T11:10:05-0500
lastmod: 2025-11-17T21:35:45-0500
type: post
url: /2025/10/05/longhouse-workday.html
author:
  name: "Doug Hatcher"
  full_name: "Doug Hatcher"
  username: hatcher
authors:
- hatcher
---
```

**After (Cleaned):**
```yaml
---
title: "Longhouse Workday 10/4/2025"
date: 2025-10-05T11:10:05-05:00
categories:
  - community
  - events
tags:
  - longhouse
  - construction
author: "Michelle Hatcher"  # ✅ Fixed to actual author
microblog: false
guid: http://waccamaw.micro.blog/2025/10/05/longhouse-workday.html
post_id: 5645026
photos:
- https://cdn.uploads.micro.blog/272201/2025/290b19f1ca.jpg
---
```

**Key Changes:**
1. ✅ **Fix author** - Change from "Doug Hatcher" to actual author
2. ✅ **Add categories** - Categorize content (community, events, ceremonies, announcements)
3. ✅ **Add tags** - Add relevant tags
4. ✅ **Keep Micro.blog fields** - Keep `microblog`, `guid`, `post_id`, `photos` for compatibility
5. ✅ **Remove unused fields** - Remove `custom_summary`, `lastmod`, `type`, `url`, `authors` array

### ✅ Content Body Cleanup

**Remove these artifacts:**

1. **Reading time**
   ```markdown
   # Title
   
   -
   
   Michelle Hatcher
   - Apr 9, 2024
   - 5 min read  ← REMOVE THIS
   ```

2. **Spacing hyphens**
   ```markdown
   # Title
   
   -  ← REMOVE THIS
   
   Michelle Hatcher
   ```

3. **Author/date in content** (now in front matter)
   ```markdown
   Michelle Hatcher  ← REMOVE (in front matter now)
   - Oct 5          ← REMOVE (in front matter now)
   ```

4. **Inline tag links**
   ```markdown
   Tags:  ← REMOVE (use front matter)
   - [meeting](link)
   - [Native](link)
   ```

5. **Duplicate images** (keep unique images only)
   ```yaml
   photos:
   - https://cdn.uploads.micro.blog/272201/2025/290b19f1ca.jpg
   - https://cdn.uploads.micro.blog/272201/2025/290b19f1ca.jpg  ← REMOVE DUPLICATE
   ```

## Categories Guide

Use these standard categories:

- **meetings** - Tribal meeting minutes
- **community** - Community events and gatherings
- **ceremonies** - Solstice, pow-wows, sacred events
- **announcements** - Important tribal announcements
- **events** - Upcoming or past events
- **photos** - Photo-focused posts
- **news** - Tribal news and updates

## Tags Guide

Tags should be lowercase, descriptive, and specific:

- **Good tags**: `longhouse`, `construction`, `solstice`, `veterans`, `education`
- **Avoid**: `#Waccamaw`, `Native-2`, numbered variants

## Migration Process

### 1. Identify Content Type

- **Meetings** → Keep in `/content/meetings/` (already correct)
- **Updates/Blog** → Move to `/content/updates/`
- **Static Pages** → Keep as-is (`about.md`, `photos.md`, etc.)

### 2. Clean Content

Use the checklist above to:
1. Fix front matter
2. Remove artifacts
3. Add categories/tags
4. Fix author attribution

### 3. Move File

```bash
# Old location
/content/2025/10/05/longhouse-workday.md

# New location
/content/updates/2025-10-05-longhouse-workday.md
```

### 4. Test Locally

```bash
just serve
# Visit http://localhost:1313/updates/
```

## Micro.blog Compatibility

✅ **Safe to change:**
- Author field
- Categories and tags
- Content body (remove artifacts)
- Duplicate photos

⚠️ **Keep these fields:**
- `microblog: true/false`
- `guid:` (post identifier)
- `post_id:` (database ID)
- `photos:` array (for Micro.blog photo handling)
- `photos_with_metadata:` (if exists)

❌ **Don't remove:**
- Micro.blog partials in layouts
- Microformats (h-entry, h-feed, etc.)
- IndieWeb endpoints

## Automation Ideas

### Bulk Author Fix

```bash
# Find all posts with wrong author
grep -r "Doug Hatcher" content/20* | grep "\.md:"

# TODO: Create script to update based on actual content author
```

### Reading Time Removal

```bash
# Find posts with "min read"
grep -r "min read" content/20*

# TODO: Script to remove "- X min read" lines
```

## Future Homepage Design

The current homepage (`/layouts/index.html`) is a placeholder. Future bespoke design should include:

- **Hero section** with tribal imagery/message
- **Featured updates** (3-5 recent/important posts)
- **Quick links** to Members Portal, Meetings, About
- **Community highlights** or photo gallery
- **Welcoming message** about the Waccamaw Indian People

See TODO comments in `/layouts/index.html` for details.

## Questions?

See `.github/copilot-instructions.md` for more details on content standards and contribution workflow.
