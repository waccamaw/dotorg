# Micro.blog Platform Quirks & Solutions

This document captures platform-specific behaviors and solutions for Micro.blog hosting.

## Issue: 404 on Section Index Pages

**Date Discovered:** November 22, 2025  
**Severity:** High (breaks navigation)  
**Status:** Resolved

### Problem

A section page that works locally at `http://localhost:1313/updates/` returns 404 on Micro.blog at `https://waccamaw.micro.blog/updates/`.

### Root Cause

**Missing tracked files in git due to `.gitignore`** - The `content/` directory is in `.gitignore`, which means most content files are NOT tracked by git. Micro.blog syncs from GitHub, so it only gets the files that are explicitly tracked (added with `git add -f`).

For a section to work on Micro.blog, you need **BOTH** files tracked in git:

```
content/
├── section.md          # ✅ Must be tracked in git (git add -f)
└── section/            
    ├── _index.md       # ✅ Must be tracked in git (git add -f)
    └── post-1.md       # Can be untracked (managed by Micro.blog)
```

**Why this matters:**
- Local Hugo builds use ALL files in `content/` (even untracked ones)
- Micro.blog only gets files tracked in git
- If either `.md` or `_index.md` is missing from git, the section 404s on Micro.blog
- But it works locally because the files exist on disk

### Symptoms

- ✅ Page works locally: `http://localhost:1313/updates/`
- ❌ Page 404s on Micro.blog: `https://waccamaw.micro.blog/updates/`
- ✅ Other similar pages work fine on both platforms
- ✅ Individual posts in the section work fine

### Solution

**Ensure BOTH section files are tracked in git** (even though `content/` is in `.gitignore`):

```bash
# For a section with posts:
git add -f content/section.md
git add -f content/section/_index.md
git commit -m "Add section files for Micro.blog"
git push
```

**The pattern that works:**

```
content/
├── meetings.md         # ✅ Tracked in git (defines section)
├── meetings/           
│   └── [posts]         # Untracked (managed by Micro.blog)
├── updates.md          # ✅ Tracked in git (defines section)  
└── updates/
    ├── _index.md       # ✅ Tracked in git (section index page)
    └── [posts]         # Untracked (managed by Micro.blog)
```

### How to Fix Existing Issues

1. **Check what content files are tracked in git:**
   ```bash
   git ls-files content/
   ```

2. **For sections that 404 on Micro.blog but work locally:**
   ```bash
   # Check if BOTH files exist locally
   ls -la content/section.md
   ls -la content/section/_index.md
   
   # Add both to git (force because content/ is ignored)
   git add -f content/section.md
   git add -f content/section/_index.md
   
   # Commit and push
   git commit -m "Add section files for Micro.blog sync"
   git push
   ```

3. **Wait for Micro.blog to rebuild** (usually 1-2 minutes after push)

4. **Test the URL:** `https://waccamaw.micro.blog/section/`

### Prevention

**Critical understanding: `content/` is in `.gitignore`**

Most content is managed directly on Micro.blog and NOT synced via GitHub. Only structural files need to be tracked in git.

**Before creating a new section:**

1. **Create the section files:**
   ```bash
   # Create the section definition file
   cat > content/newsection.md << 'EOF'
   ---
   title: "New Section"
   date: 2025-11-22T12:00:00-05:00
   menu: "main"
   layout: "newsection"
   ---
   
   Description of the section.
   EOF
   
   # Create the section index
   mkdir -p content/newsection
   cat > content/newsection/_index.md << 'EOF'
   ---
   title: "New Section"
   date: 2025-11-22T12:00:00-05:00
   ---
   
   Section description.
   EOF
   ```

2. **Force-add both files to git:**
   ```bash
   git add -f content/newsection.md
   git add -f content/newsection/_index.md
   ```

3. **Commit and push:**
   ```bash
   git commit -m "Add new section structure"
   git push
   ```

4. **Verify locally AND on Micro.blog:**
   - Local: `http://localhost:1313/newsection/`
   - Production: `https://waccamaw.micro.blog/newsection/`

**What to track vs. what to ignore:**

✅ **Track in git** (git add -f):
- `content/section.md` - Section definition files
- `content/section/_index.md` - Section index pages
- Any standalone pages needed for site structure

❌ **Don't track** (let Micro.blog manage):
- Individual blog posts in date folders
- Meeting notes
- Photo posts
- Any content created through Micro.blog web interface

### Hugo Best Practices for Micro.blog

1. **Section Structure**: Sections need BOTH `.md` and `_index.md` files tracked in git
2. **Gitignore Awareness**: Remember `content/` is ignored - use `git add -f` for structural files
3. **Local vs Production**: Local Hugo sees all files; Micro.blog only sees tracked files
4. **Testing**: Always test on Micro.blog after pushing structural changes
5. **Content Management**: Let Micro.blog manage individual posts (don't track them in git)
6. **Verify Tracking**: Use `git ls-files content/` to see what Micro.blog will receive

### Related Files

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture Docs**: `ARCHITECTURE.md`

### Examples in This Repository

✅ **Correct Structure (Working):**

```
content/
├── meetings.md           # ✅ Tracked in git
├── meetings/             # Directory exists
│   ├── [150+ posts]     # ❌ NOT tracked (managed by Micro.blog)
│   └── [No _index.md]   # Not needed for this section
│
├── updates.md            # ✅ Tracked in git  
└── updates/              # Directory exists
    ├── _index.md         # ✅ Tracked in git
    └── [posts]           # ❌ NOT tracked (managed by Micro.blog)
```

**Key insight:** Both `meetings.md` and `updates.md` are tracked in git. The `updates/_index.md` is also tracked. Individual posts are NOT tracked.

**Git tracking status:**
```bash
$ git ls-files content/
content/meetings.md
content/members.md
content/style-guide.md
content/updates.md
content/updates/_index.md
```

❌ **What Was Broken:**

```
# Before fix - updates.md was deleted
content/
├── updates/
│   └── _index.md        # ✅ Tracked in git
└── [no updates.md]      # ❌ MISSING - caused 404 on Micro.blog
```

**Result:** Worked locally (file exists on disk) but 404 on Micro.blog (file not in git)

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
