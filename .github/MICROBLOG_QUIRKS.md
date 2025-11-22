# Micro.blog Platform Quirks & Solutions

This document captures platform-specific behaviors and solutions for Micro.blog hosting.

## Issue: 404 on Section Index Pages

**Date Discovered:** November 22, 2025  
**Severity:** High (breaks navigation)  
**Status:** Resolved

### Problem

A section page that works locally at `http://localhost:1313/updates/` returns 404 on Micro.blog at `https://waccamaw.micro.blog/updates/`.

### Root Cause

**Conflicting content files** - Having both a single-page file AND a directory with `_index.md` for the same URL path:

```
content/
├── updates.md          # ❌ Single page file
└── updates/            # ❌ Directory with same name
    ├── _index.md       # ❌ Section index file
    └── post-1.md
```

This creates ambiguity about which file should render at `/updates/`. Hugo may handle this gracefully locally, but **Micro.blog's build process rejects this structure** and returns 404.

### Symptoms

- ✅ Page works locally: `http://localhost:1313/updates/`
- ❌ Page 404s on Micro.blog: `https://waccamaw.micro.blog/updates/`
- ✅ Other similar pages work fine on both platforms
- ✅ Individual posts in the section work fine

### Solution

**Choose ONE structure per URL path:**

#### Option 1: Section with Multiple Posts (Recommended)

Use `_index.md` inside a directory:

```
content/
└── updates/
    ├── _index.md       # ✅ Section index page
    ├── post-1.md       # Individual posts
    └── post-2.md
```

#### Option 2: Single Standalone Page

Use a single `.md` file (no directory):

```
content/
└── about.md            # ✅ Single page at /about/
```

**NEVER mix both approaches for the same URL path.**

### How to Fix Existing Issues

1. **Identify conflicting files:**
   ```bash
   cd content/
   # Find directories
   find . -type d -maxdepth 1 | sed 's|^\./||' | sort > /tmp/dirs.txt
   # Find .md files
   find . -maxdepth 1 -name "*.md" | sed 's|^\./||' | sed 's|\.md$||' | sort > /tmp/files.txt
   # Find conflicts
   comm -12 /tmp/dirs.txt /tmp/files.txt
   ```

2. **Choose the right structure:**
   - If the section has multiple posts → Keep the directory + `_index.md`, delete the `.md` file
   - If it's a single page with no subsections → Keep the `.md` file, delete the directory

3. **Remove the conflicting file:**
   ```bash
   # If keeping directory structure:
   git rm content/section-name.md
   
   # If keeping single page:
   git rm -r content/section-name/
   ```

4. **Update `_index.md` if necessary:**
   - Ensure front matter includes: `title`, `date`, `menu` (if in navigation)
   - Copy content from the deleted file if needed

5. **Test locally:**
   ```bash
   hugo --quiet
   ls -la public/section-name/index.html  # Should exist
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "Fix conflicting content structure for /section-name/"
   git push
   ```

7. **Verify on Micro.blog:**
   - Wait for auto-deploy (usually 1-2 minutes)
   - Check `https://waccamaw.micro.blog/section-name/`
   - Should no longer 404

### Prevention

**Before creating new content:**

1. **Check if the URL path exists:**
   ```bash
   ls -la content/my-new-section*
   ```

2. **Choose the right structure FIRST:**
   - Multiple posts/pages in a section? → Create directory with `_index.md`
   - Single standalone page? → Create single `.md` file

3. **Never create both** a file and directory with the same name

4. **Use consistent patterns:**
   - **Sections with posts**: `content/section-name/_index.md` + post files
   - **Standalone pages**: `content/page-name.md`
   - **Homepage**: `layouts/index.html` (special case)

### Hugo Best Practices for Micro.blog

1. **Section Indexes**: Always use `_index.md` for section list pages
2. **Single Pages**: Use standalone `.md` files only for pages without subsections
3. **URL Conflicts**: Never reuse the same URL path for different content types
4. **Menu Integration**: Add `menu: "main"` to front matter for navigation
5. **Testing**: Always rebuild locally with `hugo` before pushing to catch issues

### Related Files

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture Docs**: `ARCHITECTURE.md`

### Examples in This Repository

✅ **Correct Structures:**

```
content/
├── about.md              # Single page (no subsections)
├── meetings/             # Section with many posts
│   ├── [_index.md would go here if needed]
│   ├── 2024-01-12-meeting.md
│   └── 2024-02-09-meeting.md
└── updates/              # Section with posts
    ├── _index.md         # ✅ Section index
    └── 2025-10-05-announcement.md
```

❌ **Incorrect Structure (FIXED):**

```
content/
├── updates.md            # ❌ REMOVED - conflicted with directory
└── updates/              # ✅ KEPT - proper section structure
    ├── _index.md
    └── posts...
```

### When to Update This Document

Update this document when you discover:

- New Micro.blog-specific behaviors that differ from local Hugo
- Platform quirks that cause 404s or build failures
- Solutions to issues that weren't documented here
- Changes to Micro.blog's build process or Hugo version

---

**Last Updated:** November 22, 2025  
**Hugo Version:** As configured by Micro.blog  
**Micro.blog Version:** Current production
