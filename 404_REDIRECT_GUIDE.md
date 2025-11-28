# 404 & Redirect Management Guide

## Quick Start

### For Broken Links from Wix Migration

If visitors are getting 404 errors from old Wix URLs:

1. **Find the old URL** - Note what URL is broken (e.g., `/about-us`)
2. **Determine destination** - Where should it redirect? (e.g., `/`)
3. **Create redirect** - Use the script:

```bash
./scripts/create-redirect.sh /about-us / "About Us"
```

4. **Test locally**:
```bash
# Hugo is already running on http://localhost:1313
# Just visit: http://localhost:1313/about-us
```

5. **Deploy**:
```bash
git add content/redirects/
git commit -m "Add redirect for /about-us"
git push origin main
```

Done! Redirect will be live in 5-10 minutes.

## What We've Set Up

### 1. Styled 404 Page ✅

**Location**: `layouts/404.html`

**Features**:
- Professional, branded design
- Helpful navigation links to all main sections
- Google site search integration
- Special notice about Wix migration
- Contact information for reporting issues
- Mobile responsive

**Preview**: Visit any non-existent URL to see it:
- Local: http://localhost:1313/test-404
- Production: https://waccamaw.org/test-404 (after deployment)

### 2. Redirect System ✅

**How it works**:
- Hugo's `redirect` layout creates meta refresh redirects
- Each redirect is a simple markdown file
- Front matter specifies old URL → new URL
- Automatic deployment with git push

**Example redirect file**:
```yaml
---
title: "Redirect: About Us"
type: redirect
redirect: /
url: /about-us
---
```

### 3. Common Wix Redirects ✅

Pre-created redirects for common Wix patterns:
- `/about-us` → `/`
- `/contact` → `/`
- `/blog` → `/updates/`
- `/events` → `/updates/`
- `/gallery` → `/photos/`
- `/news` → `/updates/`

**Location**: `content/redirects/`

### 4. Helper Script ✅

**Location**: `scripts/create-redirect.sh`

**Usage**:
```bash
./scripts/create-redirect.sh OLD_URL NEW_URL [TITLE]
```

**Examples**:
```bash
# Redirect old about page
./scripts/create-redirect.sh /about-us / "About Us"

# Redirect old blog
./scripts/create-redirect.sh /blog /updates/

# Redirect specific post
./scripts/create-redirect.sh /post/tribal-meeting /updates/2025-03-15-tribal-meeting/
```

## Finding URLs That Need Redirects

### Method 1: Check Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property: `waccamaw.org`
3. Go to **Coverage** → **Excluded**
4. Filter by **404 errors**
5. Create redirects for high-traffic 404s

### Method 2: Check Old Wix Site

If old Wix site is still accessible:

1. Visit old site
2. Note all navigation menu URLs
3. Browse all pages and note URLs
4. Check `/sitemap.xml` if available

### Method 3: Use Web Archive

1. Visit https://web.archive.org/
2. Enter: `waccamaw.org`
3. Browse snapshots from before migration
4. Click through navigation and note URLs

### Method 4: Monitor Analytics

If you have Google Analytics:

1. Check "Behavior" → "Site Content" → "All Pages"
2. Filter for 404 pages
3. Note most-visited 404 URLs
4. Create redirects for top 10-20

### Method 5: Ask Users

Add this to emails, social media, etc.:

> "We recently migrated our website. If you find a broken link, please let us know at WaccamawChief@gmail.com"

## Creating Redirects

### Option 1: Use the Helper Script (Easiest)

```bash
# Navigate to repository
cd /workspaces/waccamawdotorg

# Create redirect
./scripts/create-redirect.sh /old-url /new-url "Title"

# Test
# Visit: http://localhost:1313/old-url

# Deploy
git add content/redirects/
git commit -m "Add redirect: /old-url → /new-url"
git push origin main
```

### Option 2: Create File Manually

1. **Create file** in `content/redirects/`:
   ```bash
   touch content/redirects/my-redirect.md
   ```

2. **Add front matter**:
   ```yaml
   ---
   title: "Redirect: My Page"
   type: redirect
   redirect: /new-location/
   url: /old-location
   ---
   
   Redirect description (optional)
   ```

3. **Test, commit, push** (same as above)

### Option 3: Bulk Create Multiple Redirects

Create a script or use bash loop:

```bash
# Create multiple redirects at once
declare -A redirects=(
    ["/about-us"]="/"
    ["/contact"]="/"
    ["/blog"]="/updates/"
    ["/events"]="/updates/"
)

for old_url in "${!redirects[@]}"; do
    new_url="${redirects[$old_url]}"
    ./scripts/create-redirect.sh "$old_url" "$new_url"
done
```

## Testing Redirects

### Local Testing

```bash
# Hugo is already running on port 1313
# Just visit the old URL in your browser:
http://localhost:1313/old-url

# Should automatically redirect to new URL
```

### Command Line Testing

```bash
# Test with curl (shows redirect headers)
curl -I http://localhost:1313/old-url

# Should show:
# HTTP/1.1 302 Found (or 301 Moved Permanently)
# Location: /new-url
```

### Production Testing

After deployment (wait 5-10 minutes):

```bash
# Test live redirect
curl -I https://waccamaw.org/old-url

# Or visit in browser
https://waccamaw.org/old-url
```

## Redirect Strategies

### Strategy 1: Start with High-Traffic Pages

1. Identify top 10-20 most-visited pages from old site
2. Create redirects for those first
3. Monitor 404 errors for next batch

### Strategy 2: Navigation First

1. Create redirects for all old navigation menu items
2. Then work on sub-pages
3. Then blog posts/content

### Strategy 3: External Links First

1. Check social media profiles for linked pages
2. Check email signatures
3. Check other websites linking to you
4. Create redirects for those pages first

### Strategy 4: SEO Priority

1. Use Google Search Console to find pages with backlinks
2. Create redirects for high-value SEO pages
3. Preserve search rankings

## Monitoring & Maintenance

### Weekly (First Month After Migration)

1. Check Google Search Console for new 404s
2. Create redirects for top 5-10 404s
3. Review analytics for broken links

### Monthly (Ongoing)

1. Review 404 error reports
2. Create redirects as needed
3. Update documentation

### Quarterly

1. Audit all redirects
2. Remove redirects no longer needed (URLs not requested in 3 months)
3. Update redirect destinations if content moved

## Common Redirect Patterns

### Pattern 1: Simple Page Rename

```yaml
---
type: redirect
redirect: /new-name/
url: /old-name
---
```

### Pattern 2: Section Reorganization

```yaml
# Old: /articles/post-name
# New: /updates/post-name
---
type: redirect
redirect: /updates/post-name/
url: /articles/post-name
---
```

### Pattern 3: Deleted Content

```yaml
# Redirect to relevant section or homepage
---
type: redirect
redirect: /updates/
url: /deleted-page
---
```

### Pattern 4: Consolidated Pages

```yaml
# Multiple old pages → one new page
# Create separate redirect for each old URL
---
type: redirect
redirect: /combined-page/
url: /old-page-1
---
```

## Troubleshooting

### Redirect Not Working

**Check 1: Front Matter**
```yaml
# Make sure you have:
type: redirect        # Required
redirect: /new-url    # Required (destination)
url: /old-url         # Required (source)
```

**Check 2: URL Format**
- URLs should start with `/`
- No trailing slash for source URL (usually)
- Trailing slash OK for destination

**Check 3: Deployment**
```bash
# Make sure changes are committed and pushed
git status
git log

# Check Micro.blog pulled changes
# Wait 5-10 minutes after push
```

**Check 4: Cache**
- Clear browser cache
- Try incognito/private window
- Use curl to bypass cache

### 404 Page Not Showing

**Check 1: File Exists**
```bash
ls layouts/404.html
ls content/404.md
```

**Check 2: Hugo Build**
```bash
# Check for build errors
hugo

# Look for errors in output
```

**Check 3: Test Locally**
```bash
# Visit non-existent page
http://localhost:1313/this-does-not-exist
```

### Redirect Loop

**Problem**: Page redirects to itself or creates circular redirect

**Solution**:
1. Check redirect destination is different from source
2. Check for chain: A→B→C→A
3. Use absolute URLs instead of relative

**Example**:
```yaml
# BAD - redirects to itself
url: /page
redirect: /page

# GOOD - redirects elsewhere
url: /old-page
redirect: /new-page
```

## Best Practices

### Do's ✅

- Create redirects for all old navigation pages
- Test locally before deploying
- Monitor 404 errors regularly
- Document why redirect was created
- Use descriptive titles in front matter
- Keep redirect files organized in `content/redirects/`

### Don'ts ❌

- Don't create redirect loops
- Don't redirect to 404 pages
- Don't leave high-traffic 404s unfixed
- Don't delete old redirects without checking if still needed
- Don't use relative URLs in redirects (use absolute: `/page/`)

## Quick Reference

### Create Redirect (Script)
```bash
./scripts/create-redirect.sh /old /new "Title"
```

### Create Redirect (Manual)
```yaml
---
title: "Redirect: Title"
type: redirect
redirect: /new-url
url: /old-url
---
```

### Test Locally
```bash
# Visit: http://localhost:1313/old-url
```

### Deploy
```bash
git add content/redirects/
git commit -m "Add redirect"
git push origin main
```

### Test Production
```bash
curl -I https://waccamaw.org/old-url
```

## Documentation

- **Full Details**: See `DEPLOYMENT.md` - "404 Pages & Redirects" section
- **Examples**: See `content/redirects/README.md`
- **Architecture**: See `ARCHITECTURE.md` for routing details

## Getting Help

### Questions About Redirects?

1. Check this guide first
2. Check `content/redirects/README.md`
3. Review example redirects in `content/redirects/`
4. Ask in GitHub Copilot Chat
5. Create GitHub issue with `question` label

### Reporting Issues

If 404 page or redirects aren't working:

1. Create GitHub issue with `bug` label
2. Include:
   - Old URL
   - Expected destination
   - What actually happens
   - Browser/device info
   - Screenshots if possible

---

**Created**: November 28, 2025
**Last Updated**: November 28, 2025
**Maintainer**: Tribal Technology Team
