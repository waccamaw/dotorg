# Deployment Guide

This document describes how to deploy changes to the Waccamaw.org website. The site uses an automated deployment workflow with manual steps for infrastructure changes.

## Table of Contents

- [Overview](#overview)
- [Deployment Workflow](#deployment-workflow)
- [Content Deployment](#content-deployment)
- [Template Deployment](#template-deployment)
- [Infrastructure Deployment](#infrastructure-deployment)
- [404 Pages & Redirects](#404-pages--redirects)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring & Verification](#monitoring--verification)
- [Troubleshooting](#troubleshooting)

## Overview

### Deployment Architecture

```
Developer (VS Code)
    |
    | git push
    ▼
GitHub Repository (main branch)
    |
    | Webhook trigger
    ▼
Micro.blog Platform
    |
    | Pull from GitHub
    | Run Hugo build
    ▼
Static Site Generated
    |
    | Deploy to CDN
    ▼
Micro.blog CDN (waccamaw.micro.blog)
    |
    | Proxied via Cloudflare Workers
    ▼
Production (waccamaw.org/updates/)
```

### Deployment Types

1. **Content Deployment** - Blog posts, tribal info, photos (automatic)
2. **Template Deployment** - Layout/design changes (automatic with review)
3. **Infrastructure Deployment** - DNS, routing, Workers (manual)

## Deployment Workflow

### Standard Workflow (Content & Templates)

```bash
# 1. Create feature branch
git checkout -b feature/your-change

# 2. Make changes and test locally
just serve

# 3. Commit changes
git add .
git commit -m "Descriptive commit message"

# 4. Push to GitHub
git push origin feature/your-change

# 5. Create Pull Request
# - Include screenshots (desktop + mobile)
# - Complete PR template checklist
# - Request review

# 6. After approval, merge to main
# - Merging triggers automatic deployment
# - Changes go live within 5-10 minutes
```

### Emergency Hotfix Workflow

For critical bugs requiring immediate fixes:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Make minimal fix
# Edit only what's necessary

# 3. Test locally
just serve

# 4. Commit and push
git add .
git commit -m "Hotfix: [description]"
git push origin hotfix/critical-bug

# 5. Create PR with "HOTFIX" label
# 6. Fast-track review and merge
# 7. Verify deployment immediately
```

## Content Deployment

### Adding Blog Posts

**File Location**: `content/YYYY/MM/DD/post-title.md`

```bash
# Example: Adding November 18, 2025 meeting notes

# 1. Create directory structure (if needed)
mkdir -p content/2025/11/18

# 2. Create markdown file
# Use Copilot: "Create blog post for November meeting"
```

**Front Matter Template**:
```yaml
---
title: "November 2025 Tribal Meeting"
date: 2025-11-18T18:00:00-05:00
categories:
  - meetings
---

Your content here...
```

**Deployment Process**:
1. Commit to feature branch
2. Push to GitHub
3. Create PR with screenshots
4. After merge, auto-deploys in ~5 minutes

**Verification**:
- Check https://waccamaw.org/updates/
- Verify post appears in feed
- Test on mobile
- Confirm RSS feed updated

### Updating Tribal Information

**Files**:
- `content/about.md`
- `content/meetings.md`
- `content/photos.md`
- `content/style-guide.md`

**Process**: Same as blog posts (above)

### Adding Photos

**Steps**:

1. **Optimize images** first:
   ```bash
   # Resize to reasonable dimensions (e.g., 1200px wide)
   # Compress for web (70-80% quality)
   # Use descriptive filenames
   ```

2. **Add to repository**:
   ```bash
   cp photo.jpg static/uploads/2025-11-18-meeting.jpg
   ```

3. **Reference in markdown**:
   ```markdown
   ![November Meeting Group Photo](/uploads/2025-11-18-meeting.jpg)
   ```

4. **Deploy**: Standard workflow (commit, PR, merge)

**Image Guidelines**:
- Max width: 1200-1600px
- Format: JPEG for photos, PNG for graphics
- File size: < 500KB per image
- Naming: `YYYY-MM-DD-description.jpg`

## Template Deployment

### Automated Template Deployment

**Overview**: Template and layout changes are automatically deployed to Micro.blog using GitHub Actions with email-based authentication.

**Triggers**: Changes to the following files automatically trigger deployment:
- `layouts/**/*.html`
- `static/**/*`
- `config.json`

**How It Works**:
1. Push template changes to `main` branch
2. GitHub Action authenticates to Micro.blog via email (using cached session cookie)
3. Triggers theme reload from GitHub
4. Rebuilds site and monitors completion
5. Changes live in ~1-2 minutes

**GitHub Secrets & Variables Required**:

Secrets (encrypted):
- `GMAIL_APP_PASSWORD` - Gmail app password for authentication

Variables (configuration):
- `GMAIL_EMAIL` - Gmail address for receiving sign-in emails
- `MICROBLOG_EMAIL` - Micro.blog account email
- `MICROBLOG_SITE_ID` - Micro.blog site ID (from URL)
- `MICROBLOG_THEME_ID` - Theme ID (from theme URL)

**Setup Instructions**:

1. **Get Gmail App Password**:
   - Enable 2-factor auth at https://myaccount.google.com/security
   - Create app password at https://myaccount.google.com/apppasswords
   - Name it "Waccamaw Micro.blog Deploy"

2. **Find Micro.blog IDs**:
   - Site ID: Visit https://micro.blog/account, inspect site settings URL
   - Theme ID: Go to Design → Edit Custom Themes, check theme URL

3. **Configure GitHub Secrets**:
   - Go to repo Settings → Secrets and variables → Actions
   - Add secret `GMAIL_APP_PASSWORD`
   - Add variables: `GMAIL_EMAIL`, `MICROBLOG_EMAIL`, `MICROBLOG_SITE_ID`, `MICROBLOG_THEME_ID`

4. **Manual Deployment** (if needed):
   - Go to Actions tab → Deploy to Micro.blog
   - Click "Run workflow" button

**Monitoring Deployments**:
- Check Actions tab for workflow status
- View deployment summary in workflow run
- Verify changes at https://waccamaw.micro.blog/

For deployment script details, see [.github/deploy/README.md](.github/deploy/README.md).

### Modifying Layouts

**Files**: `layouts/**/*.html`

**Process**:

1. **Identify file to edit**:
   ```
   layouts/
   ├── _default/baseof.html      # Base template
   ├── _default/single.html       # Single post
   ├── _default/list.html         # List pages
   ├── partials/header.html       # Header
   ├── partials/footer.html       # Footer
   └── ...
   ```

2. **Make changes locally**:
   ```bash
   just serve
   # Test at http://localhost:1313/
   ```

3. **Preserve microformats**:
   - Check for `h-entry`, `h-feed`, `p-name`, `dt-published`
   - Don't remove these classes!

4. **Test responsive design**:
   - Desktop: 1920x1080
   - Tablet: 820x1180
   - Mobile: 390x844

5. **Deploy**: Standard workflow with **extra testing** (auto-deploys via GitHub Actions)

**Template Deployment Checklist**:
- [ ] Tested locally with `just serve`
- [ ] No Hugo build errors
- [ ] Microformats preserved
- [ ] Responsive on all screen sizes
- [ ] No console errors
- [ ] RSS/JSON feeds still valid
- [ ] Screenshots included in PR
- [ ] Extra review requested

### Modifying Styles

**File**: `static/theme.css`

**Process**:

1. **Edit CSS**:
   ```css
   /* Use mobile-first approach */
   .element {
     /* Mobile styles */
   }
   
   @media (min-width: 768px) {
     .element {
       /* Tablet styles */
     }
   }
   
   @media (min-width: 1024px) {
     .element {
       /* Desktop styles */
     }
   }
   ```

2. **Test on multiple screen sizes**

3. **Deploy**: Standard workflow

**CSS Guidelines**:
- Mobile-first approach
- Use existing class names when possible
- Don't add framework dependencies (Bootstrap, Tailwind, etc.)
- Keep specificity low
- Comment complex rules

## Infrastructure Deployment

### Cloudflare Workers Changes

**When Needed**:
- Adding new platform to architecture
- Changing routing logic
- Modifying cache rules
- Updating security headers

**Process**:

1. **Access Cloudflare Dashboard**:
   - Login to Cloudflare
   - Select `waccamaw.org` domain
   - Navigate to Workers & Pages

2. **Edit Worker Script**:
   ```javascript
   // workers/router.js
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })
   
   async function handleRequest(request) {
     // Your routing logic
   }
   ```

3. **Test in Preview**:
   ```bash
   # Use wrangler CLI
   wrangler dev
   ```

4. **Deploy to Production**:
   - Click "Save and Deploy" in Cloudflare dashboard
   - Or use CLI: `wrangler publish`

5. **Verify routing**:
   ```bash
   curl -I https://waccamaw.org/updates/
   curl -I https://waccamaw.org/home/
   ```

**Rollback**: Cloudflare keeps previous versions - click "Rollback" if issues occur

### DNS Changes

**When Needed**:
- Adding subdomains
- Changing origin servers
- Updating member portal (future)

**Process**:

1. **Access Cloudflare DNS**:
   - Cloudflare dashboard → waccamaw.org → DNS

2. **Add/Edit Records**:
   ```
   Type: A or CNAME
   Name: subdomain or @
   Content: IP or hostname
   Proxy: ON (orange cloud)
   ```

3. **Verify propagation**:
   ```bash
   dig waccamaw.org
   dig updates.waccamaw.org
   ```

4. **Test SSL**:
   ```bash
   curl -I https://waccamaw.org
   # Should return 200 OK with valid SSL
   ```

**DNS Propagation**: Can take up to 24 hours (usually < 1 hour)

### Micro.blog Configuration

**When Needed**:
- Changing custom domain
- Updating GitHub sync settings
- Modifying build settings

**Process**:

1. **Access Micro.blog Dashboard**:
   - Login at micro.blog
   - Select waccamaw blog

2. **GitHub Sync**:
   - Settings → GitHub
   - Repository: `waccamaw/dotorg`
   - Branch: `main`
   - Webhook should be configured

3. **Custom Domain**:
   - Settings → Custom Domain
   - Domain: `waccamaw.micro.blog`
   - (Proxied via Cloudflare Workers to waccamaw.org/updates/)

4. **Build Settings**:
   - Hugo version: Latest stable
   - Build command: Auto (Hugo default)

**Manual Rebuild**:
- Settings → Advanced → "Rebuild site"

## Rollback Procedures

### Content Rollback

**Revert a merged PR**:

```bash
# 1. Find the commit hash of the merge
git log

# 2. Create revert commit
git revert <commit-hash>

# 3. Push to main
git push origin main

# 4. Auto-deploys in ~5 minutes
```

### Template Rollback

**Revert to previous version**:

```bash
# 1. Identify the good commit
git log layouts/

# 2. Revert specific file
git checkout <good-commit-hash> layouts/path/to/file.html

# 3. Commit and push
git add layouts/path/to/file.html
git commit -m "Rollback: Revert template changes"
git push origin main
```

### Infrastructure Rollback

**Cloudflare Workers**:
- Dashboard → Workers → Select worker
- Click "Rollback" next to previous version

**DNS**:
- Edit record back to previous value
- Save (immediate, but propagation takes time)

## 404 Pages & Redirects

### Overview

The site includes a styled 404 page and redirect system to handle:
- Broken links from Wix migration
- Old URLs that were changed
- Typos in URLs
- Deleted content

### 404 Page

**Location**: `layouts/404.html` and `content/404.md`

**Features**:
- Branded styling matching site theme
- Helpful navigation links
- Site search via Google
- Migration notice for Wix users
- Contact information for reporting issues

**Testing 404 Page**:
```bash
# Local testing
hugo server
# Visit: http://localhost:1313/does-not-exist

# Production testing
curl -I https://waccamaw.org/does-not-exist
# Should return HTTP 404
```

### Creating Redirects

Hugo supports redirects using the `redirect` layout. Already configured at `layouts/redirect/single.html`.

**Step 1: Create redirect file**

Create a file in `content/redirects/` (or anywhere in `content/`):

```bash
# Example: content/redirects/old-about.md
```

**Step 2: Add front matter**

```yaml
---
title: "Redirect: Old About Page"
type: redirect
redirect: /  # Destination URL
url: /about-us  # Old URL to redirect FROM
---
```

**Step 3: Test locally**

```bash
hugo server
# Visit: http://localhost:1313/about-us
# Should redirect to destination
```

**Step 4: Deploy**

```bash
git add content/redirects/old-about.md
git commit -m "Add redirect: /about-us → /"
git push origin main
```

### Common Redirect Examples

See `content/redirects/README.md` for detailed examples.

**Example redirects already created**:
- `/about-us` → `/`
- `/contact` → `/`
- `/blog` → `/updates/`
- `/events` → `/updates/`
- `/gallery` → `/photos/`
- `/news` → `/updates/`

### Finding URLs to Redirect

**Method 1: Monitor 404 errors**
- Check web server logs (if available)
- Use Google Search Console
- Review analytics for 404 pages

**Method 2: Wix sitemap**
If old Wix site is accessible:
1. Visit `/sitemap.xml`
2. Note all page URLs
3. Create redirects for important pages

**Method 3: Web Archive**
1. Visit https://web.archive.org/
2. Enter old domain: `waccamaw.org`
3. Browse snapshots
4. Note navigation menu URLs

**Method 4: Google Search**
```
site:waccamaw.org
```
Review all indexed pages, create redirects for old URLs.

### Redirect Priority

**High Priority** (create first):
1. Main navigation pages (about, contact, etc.)
2. Most-visited blog posts
3. Pages linked from social media
4. Pages with external backlinks

**Medium Priority**:
1. Category/tag pages
2. Archive pages
3. Secondary content pages

**Low Priority**:
1. Test pages
2. Rarely-visited content
3. Duplicate URLs

### Monitoring Redirects

**Check redirect effectiveness**:

```bash
# Test specific redirect
curl -I https://waccamaw.org/old-url

# Should return:
# HTTP/1.1 301 Moved Permanently (or 302 Found)
# Location: https://waccamaw.org/new-url
```

**Analytics**:
- Monitor 404 rate over time
- Create redirects for frequently-requested 404s
- Review monthly and add new redirects as needed

### Bulk Redirects

For many redirects, create multiple files:

```bash
# Create redirect files programmatically
cd content/redirects/

# Example: Loop through old URLs
for url in about-us contact events gallery news; do
  cat > "${url}.md" << EOF
---
title: "Redirect: ${url}"
type: redirect
redirect: /updates/
url: /${url}
---
EOF
done
```

### Redirect Maintenance

**Monthly Review**:
1. Check Google Search Console for 404 errors
2. Create redirects for top 10 404s
3. Update redirect documentation
4. Remove redirects for URLs no longer requested (after 6 months)

**Annual Audit**:
1. Review all redirects
2. Update destinations if content moved
3. Archive old redirects (move to `content/redirects/archived/`)
4. Document redirect history

### Troubleshooting Redirects

**Redirect not working**:
1. Check front matter syntax
2. Verify `type: redirect` is set
3. Ensure `url:` matches old URL exactly
4. Test locally with `hugo server`
5. Check Hugo build output for errors

**Redirect loops**:
1. Ensure destination URL is different from source URL
2. Check for circular redirects (A→B→A)
3. Use absolute URLs when possible

**404 still showing**:
1. Clear browser cache
2. Wait 5-10 minutes for deployment
3. Check that file was committed and pushed
4. Verify Micro.blog pulled latest changes

## Monitoring & Verification

### Automated Checks

**After Every Deployment**:

1. **Site Accessibility**:
   ```bash
   curl -I https://waccamaw.org/updates/
   # Should return 200 OK
   ```

2. **RSS Feed**:
   ```bash
   curl https://waccamaw.org/updates/feed.xml
   # Should return valid XML
   ```

3. **SSL Certificate**:
   ```bash
   openssl s_client -connect waccamaw.org:443 -servername waccamaw.org
   # Should show valid certificate
   ```

### Manual Verification

**Post-Deployment Checklist**:

- [ ] Homepage loads correctly
- [ ] New content visible
- [ ] No broken links
- [ ] Images display properly
- [ ] Mobile view works
- [ ] RSS feed updates
- [ ] No console errors
- [ ] Microformats intact (use validator)

### Monitoring Tools

**Available Metrics**:

1. **Cloudflare Analytics**:
   - Page views
   - Bandwidth
   - Cache hit ratio
   - Security threats blocked

2. **Micro.blog Stats**:
   - Post views
   - Feed subscribers
   - Build status

3. **Hugo Build Logs**:
   - Access via Micro.blog dashboard
   - Check for build errors/warnings

### Performance Monitoring

**Target Metrics**:
- Page load time: < 2 seconds
- Time to First Byte: < 500ms
- Cache hit ratio: > 85%
- Uptime: 99.9%

**Check Performance**:
```bash
# Use curl to measure TTFB
curl -w "@curl-format.txt" -o /dev/null -s https://waccamaw.org/updates/

# curl-format.txt:
time_namelookup: %{time_namelookup}\n
time_connect: %{time_connect}\n
time_appconnect: %{time_appconnect}\n
time_pretransfer: %{time_pretransfer}\n
time_redirect: %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
time_total: %{time_total}\n
```

## Troubleshooting

### Deployment Not Showing

**Problem**: Changes merged but not visible on site

**Solutions**:

1. **Check GitHub webhook**:
   - GitHub repo → Settings → Webhooks
   - Verify Micro.blog webhook is active
   - Check recent deliveries for errors

2. **Manual trigger**:
   - Micro.blog dashboard → Settings → "Rebuild site"

3. **Clear Cloudflare cache**:
   - Cloudflare dashboard → Caching → "Purge Everything"

4. **Check build status**:
   - Micro.blog dashboard → look for build errors

### Build Failures

**Problem**: Hugo build fails

**Solutions**:

1. **Check Hugo errors**:
   ```bash
   # Run locally
   hugo
   # Look for syntax errors in templates or content
   ```

2. **Validate front matter**:
   ```bash
   # Check YAML syntax
   # Ensure dates are ISO 8601 format
   ```

3. **Check Micro.blog logs**:
   - Dashboard shows build output
   - Look for specific error messages

### Routing Issues

**Problem**: Wrong platform serving content

**Solutions**:

1. **Check Cloudflare Worker**:
   - Verify route pattern: `waccamaw.org/*`
   - Check worker script logic
   - Review worker logs

2. **Test routing**:
   ```bash
   curl -I https://waccamaw.org/updates/
   # Check X-Served-By or similar headers
   ```

3. **Clear Cloudflare cache**:
   - May be serving stale routing

### SSL Issues

**Problem**: SSL certificate errors

**Solutions**:

1. **Check Cloudflare SSL mode**:
   - Should be "Full (strict)"
   - SSL/TLS → Overview

2. **Verify origin SSL**:
   - Micro.blog has valid certificate
   - Test: `curl -I https://waccamaw.micro.blog`

3. **Check Cloudflare proxy**:
   - DNS records should have orange cloud (proxied)

## Deployment Schedule

### Regular Deployments

- **Content**: As needed (usually 1-4 times per month)
- **Templates**: Quarterly or as needed
- **Infrastructure**: Rarely (plan ahead)

### Recommended Timing

- **Best time**: Weekday mornings (9am-11am EST)
- **Avoid**: Friday afternoons, holidays
- **Major changes**: Schedule maintenance window

### Deployment Communication

**Before Major Changes**:
1. Create GitHub issue announcing planned changes
2. Tag `@waccamaw` tribal members
3. Set deployment date/time
4. Prepare rollback plan

**After Deployment**:
1. Comment on related issue: "Deployed ✅"
2. Verify all checklist items
3. Monitor for 24 hours
4. Close issue if successful

## Emergency Contacts

### Infrastructure Issues

- **Cloudflare**: Support via dashboard (for paid plans)
- **Micro.blog**: help@micro.blog
- **DNS/Routing**: Tribal technology team

### Repository Access

- **GitHub**: Repository administrators
- **Tribal Leadership**: WaccamawChief@gmail.com

## Related Documentation

- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - AI agent guidelines

---

**Last Updated**: November 18, 2025

**Document Owner**: Tribal Technology Team

**Review Schedule**: After each infrastructure change
