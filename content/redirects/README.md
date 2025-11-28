# Wix Redirect Examples

This directory contains redirect files for common Wix URL patterns.

## How Redirects Work

Hugo supports redirects using the `redirect` layout. Each redirect file:

1. Lives in `content/redirects/` (or anywhere in `content/`)
2. Has `type: redirect` in front matter
3. Specifies the `redirect:` destination URL
4. Has a `url:` matching the old Wix URL

## Creating a New Redirect

### Example: Redirect old Wix "about" page

**File:** `content/redirects/about-us.md`

```yaml
---
title: "Redirect: About Us"
type: redirect
redirect: /updates/about/
url: /about-us
---
```

This redirects `waccamaw.org/about-us` → `waccamaw.org/updates/about/`

## Common Wix URL Patterns

Wix typically uses these URL formats:

### 1. Static Pages
- `/about-us` → redirect to `/updates/about/` or appropriate page
- `/contact` → redirect to contact info or email
- `/events` → redirect to `/updates/` (filtered by events category)
- `/gallery` → redirect to `/photos/`

### 2. Blog Posts
Wix blog URLs often look like:
- `/post/post-title` → redirect to `/updates/YYYY-MM-DD-post-title/`
- `/blog/post-title` → redirect to `/updates/`

### 3. Dynamic Pages
- `/shop` → redirect to appropriate page
- `/members` → redirect to `/members/`

## Finding Old URLs

### Method 1: Check Old Wix Site (if still accessible)
1. Visit old Wix site
2. Note all navigation menu URLs
3. Check sitemap.xml if available

### Method 2: Google Search Console
1. Check "Coverage" report for 404 errors
2. Note which old URLs are being requested
3. Create redirects for high-traffic pages

### Method 3: Analytics
If you have analytics from old Wix site:
1. Export most-visited pages
2. Create redirects for top 20-30 pages

### Method 4: Web Archive
1. Check https://web.archive.org/
2. Enter your old Wix domain
3. Browse snapshots to find URLs

## Redirect Strategy

### Priority 1: High-Traffic Pages
Create redirects for:
- Homepage variants (`/home`, `/index`)
- Main navigation pages
- Most-visited blog posts

### Priority 2: External Links
Pages linked from:
- Social media profiles
- Email signatures
- Printed materials
- Other websites

### Priority 3: SEO Pages
Pages that rank well in Google:
- Check Google Search Console
- Focus on pages with backlinks

## Testing Redirects

### Local Testing
```bash
# Start Hugo server
hugo server

# Test redirect in browser
# Visit: http://localhost:1313/old-url
# Should redirect to new URL
```

### Production Testing
After deploying:
```bash
# Use curl to test
curl -I https://waccamaw.org/old-url

# Should return:
# HTTP/1.1 302 Found
# Location: https://waccamaw.org/new-url
```

## Maintenance

1. **Monitor 404s**: Check analytics for 404 errors monthly
2. **Create redirects**: Add new redirect files as needed
3. **Update docs**: Keep this README current
4. **Review annually**: Remove redirects for URLs no longer requested

## Questions?

If you're unsure where a Wix URL should redirect to:
1. Try to find similar content on new site
2. Redirect to most logical section (/updates/, /meetings/, etc.)
3. When in doubt, redirect to homepage with helpful 404 page
