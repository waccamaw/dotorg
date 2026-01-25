# GitHub Copilot Agent Instructions

## CRITICAL RULES - READ FIRST

1. **Hugo server is ALREADY RUNNING on port 1313** - NEVER start additional servers
2. **Microservices auto-start in dev container** - Contact (8788), Members (8787), Meetings services run on attach
3. **Stay focused** - Answer the user's actual question without overcomplicating
4. **Always test template changes** - Use `just serve` to verify any modifications to `layouts/`, `static/theme.css`, or `config.json` before submitting
5. **Prefer Micro.blog for content** - Blog posts, photos, and news should be added via Micro.blog interface (see `.github/MICROBLOG_POSTING_GUIDE.md`) unless structural changes are needed
6. **Microservices use Cloudflare Workers + D1/KV** - Hono framework, deployed via wrangler, secrets in GitHub Actions

---

> **🚨 CRITICAL: Multi-Repository Architecture**
> 
> The `apps/` directory contains **INDEPENDENT GIT REPOSITORIES**, not subdirectories!
> - `apps/contact-service/` → waccamaw/contact-service repo
> - `apps/members-service/` → waccamaw/members-service repo  
> - `apps/meetings-service/` → waccamaw/meetings-service repo
>
> **Implications:**
> - Each service has its own `.git/` directory and GitHub Actions
> - Commits/pushes must happen IN the service directory (not from root)
> - GitHub Issues belong in the SERVICE repo, not main repo
> - Check `git remote -v` to confirm which repo you're in
>
> **See:** [.copilot-context.md](.copilot-context.md) for complete multi-repo documentation

---

## Project Overview

This repository powers the **Waccamaw Indian People's official website** at waccamaw.org/updates/. The Waccamaw are South Carolina's first state-recognized tribe (recognized in 2005), based in the Dog Bluff community near Aynor, SC.

### Multi-Platform Architecture

This repository is **one component** of a larger multi-platform website:

```
waccamaw.org
├── /home/      → Framer (marketing site)          [External]
├── /updates/   → Micro.blog (this repository)     [Hugo static site]
├── /contact/   → Cloudflare Worker (API)          [apps/contact-service]
├── /members/   → Cloudflare Worker (API + SPA)    [apps/members-service]
└── /meetings/  → Sync service (Zoom → Markdown)   [apps/meetings-service]
```

**Cloudflare Workers** handles intelligent routing between platforms. See ARCHITECTURE.md in the repository root for complete details.

### This Repository's Role

- **Main Site** (waccamaw.org/updates/) - Hugo static site deployed to Micro.blog
- **Microservices** (apps/) - Cloudflare Workers for dynamic features
- **Source Control**: GitHub (auto-syncs to Micro.blog for Hugo, manual deploy for Workers)
- **Contributors**: Tribal members and family (varying technical skill)

## Technology Stack

### Hugo Site (Main Website)
- **Static Site Generator**: Hugo (Go-based)
- **Platform**: Micro.blog (micro.blog)
- **Templating**: Go HTML templates
- **Configuration**: JSON (config.json)
- **Routing**: Cloudflare Workers (external to this repo)
- **DNS**: Cloudflare DNS
- **Version Control**: Git/GitHub
- **Deployment**: Auto-deploy from GitHub main branch

### Microservices (apps/ directory)
- **Framework**: Hono (fast, lightweight web framework)
- **Runtime**: Cloudflare Workers (serverless edge computing)
- **Database**: D1 (SQLite) - verification tokens, audit logs, contact submissions
- **Key-Value Store**: KV namespaces - rate limiting, meeting archives
- **Email**: Resend API - verification emails, notifications
- **Integration**: Microsoft Graph API - SharePoint list updates
- **Notifications**: Slack webhooks - real-time alerts
- **Deployment**: Wrangler CLI via GitHub Actions
- **Task Runner**: Just (Justfile for orchestration)

## Repository Structure

```
dotorg/
├── .github/
│   ├── copilot-instructions.md    # This file - agent guidelines
│   ├── pull_request_template.md   # PR template (requires screenshots)
│   └── ISSUE_TEMPLATE/            # Issue templates (bug, feature, content, docs)
│
├── apps/                           # Microservices directory
│   ├── justfile                   # Orchestration for all services
│   ├── post-attach.sh             # Auto-start services on container attach
│   ├── post-create.sh             # Install deps on container creation
│   ├── contact-service/           # Contact form API (port 8788)
│   │   ├── src/index.js          # Hono app entry point
│   │   ├── wrangler.toml         # Cloudflare Workers config
│   │   ├── config.yaml           # Email routing categories
│   │   └── schema.sql            # D1 database schema
│   ├── members-service/           # Member portal API (port 8787)
│   │   ├── src/index.js          # Hono app with email verification
│   │   ├── wrangler.toml         # D1 + KV bindings
│   │   └── src/templates/        # Email templates (synced from static/)
│   └── meetings-service/          # Zoom→Markdown sync
│       ├── sync-zoom-meetings.js # GitHub Actions webhook handler
│       ├── content/meetings/     # Generated markdown files
│       └── lib/                  # Reusable modules
│
├── content/                        # Markdown content files
│   ├── about.md                   # About the Waccamaw People
│   ├── meetings.md                # Meeting information
│   ├── photos.md                  # Photo gallery
│   ├── style-guide.md             # Style guide
│   └── YYYY/MM/DD/                # Blog posts (date hierarchy)
│       └── post-name.md           # Individual blog posts
│
├── layouts/                        # Hugo template files
│   ├── _default/                  # Default layouts
│   │   ├── baseof.html           # Base template
│   │   ├── single.html           # Single post layout
│   │   ├── list.html             # List layout
│   │   └── *.html                # Other layouts
│   ├── partials/                  # Reusable components
│   │   ├── header.html           # Site header
│   │   ├── footer.html           # Site footer
│   │   ├── head.html             # HTML head
│   │   └── *.html                # Other partials
│   └── *.xml/html                # Feed templates (RSS, JSON, Podcast)
│
├── static/                         # Static assets
│   ├── theme.css                  # Site styles
│   ├── members/                   # Member portal SPA
│   │   └── email-templates/      # HTML/TXT email templates
│   └── logos/                     # Tribal logos
│       └── doug-2025/             # Current logo set
│
├── scripts/                        # Python utilities
│   ├── validate-meetings.py      # Meeting markdown validator
│   └── clean-meetings.sh         # Meeting cleanup scripts
│
├── public/                         # Generated site (not committed)
│
├── config.json                     # Hugo/Micro.blog configuration
├── Justfile                        # Task automation (Just commands)
├── README.md                       # Project overview
├── CONTRIBUTING.md                 # Contribution guidelines
├── ARCHITECTURE.md                 # System architecture documentation
├── DEPLOYMENT.md                   # Deployment procedures
└── LICENSE                         # License information
```

## Content vs Code Changes

### ✅ Use Micro.blog Interface (Recommended for Content)

**Non-technical tribal members should post content directly via Micro.blog:**
- Blog posts and news updates
- Photos from events and ceremonies  
- Meeting announcements
- Community stories

**See:** `.github/MICROBLOG_POSTING_GUIDE.md` for detailed instructions.

### 🔧 Use GitHub (For Code/Template Changes)

**Use GitHub pull requests for:**
- Template modifications (`layouts/` directory)
- Style changes (`static/theme.css`)
- Configuration updates (`config.json`)
- Bug fixes
- New features
- Structural content changes (About page, permanent pages)

**Important:** Template changes require:
- Reading `.github/MICROBLOG_QUIRKS.md`
- Testing with `just serve`
- Three screenshots (desktop, tablet, mobile)
- Microformats preservation verification
- Feed validation

## Coding Standards

### Template Files
- Use Hugo's Go template syntax consistently
- Follow existing indentation and spacing patterns (tabs for indentation)
- Include proper HTML semantics and microformats (h-entry, h-feed, p-name, dt-published, etc.)
- Preserve existing template structure and partials
- Keep mobile-responsive design considerations

### Content Files (Markdown)
- Store blog posts in date hierarchy: `content/YYYY/MM/DD/post-name.md`
- Use proper front matter with title, date, categories
- Date format: ISO 8601 (e.g., `2025-11-18T10:30:00-05:00`)
- Use descriptive filenames (lowercase, hyphens)
- **CRITICAL**: Never create both `content/section.md` AND `content/section/_index.md` - see `.github/MICROBLOG_QUIRKS.md`

### CSS Styles
- Main styles in `static/theme.css`
- Inline CSS used sparingly in templates (e.g., photos grid)
- Mobile-first approach
- Maintain existing patterns and naming conventions

### Configuration
- The `config.json` uses placeholder values in brackets (e.g., `[TITLE]`, `[USERNAME]`)
- These placeholders are replaced by Micro.blog when the template is deployed
- **NEVER replace or hardcode these placeholder values**

### Output Formats
The repository supports multiple output formats:
- HTML (standard pages)
- RSS and JSON feeds
- RSD (Really Simple Discovery) for blog clients
- Archive and Photos JSON feeds
- Podcast XML and JSON feeds

## Making Changes

### For Content Updates
1. **Blog posts**: Create in `content/YYYY/MM/DD/post-title.md`
2. **Tribal info**: Edit relevant file in `content/` (about.md, meetings.md, etc.)
3. **Photos**: Add to `static/uploads/`, reference in markdown
4. Always include proper front matter

### For Template Modifications
1. Identify the correct layout file in `layouts/`
2. Maintain consistency with Hugo best practices
3. **Preserve microformats** (h-entry, h-feed, p-name, dt-published)
4. Test with `just serve` locally
5. Ensure mobile responsiveness
6. Document changes in commit message

### For Style Changes
1. Edit `static/theme.css`
2. Use mobile-first approach
3. Test on multiple screen sizes (desktop 1920x1080, tablet 820x1180, mobile 390x844)
4. Maintain existing class names and structure

### Git Workflow
- **Always work in a feature branch** (never commit to `main` directly)
- Branch naming: `feature/`, `fix/`, `content/`, `docs/`
- Keep commits focused and atomic
- Use descriptive commit messages
- Do not commit `.DS_Store` or system files (see `.gitignore`)

## API-Driven Pages Pattern

### Dual-Purpose Static/Dynamic Pages

Some pages serve both as static Hugo pages AND API clients connecting to Cloudflare Workers:
- `/members/` - Member portal (connects to members.waccamaw.org API)
- `/contact/` - Contact form (connects to contact.waccamaw.org API)  
- `/meetings/` - Meeting archives (connects to meetings.waccamaw.org API)

### How It Works Locally and in Production

**The Pattern:**
1. Hugo generates a static HTML shell from `layouts/SECTION/single.html`
2. JavaScript embedded in the page detects the environment (localhost vs production)
3. JavaScript connects to the appropriate API endpoint:
   - **Local**: `http://localhost:878X` (dev container services)
   - **Production**: `https://SECTION.waccamaw.org` (Cloudflare Workers)

**Environment Detection Pattern** (from `static/js/members-config.js`):
```javascript
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8787'
        : 'https://members.waccamaw.org',
}
```

### Creating a New API-Driven Page

**1. Create Hugo Layout** (`layouts/SECTION/single.html`):
```html
{{ define "main" }}
<div id="app">
  <!-- Static page shell -->
  <h1>{{ .Title }}</h1>
  <div id="content">Loading...</div>
</div>

<!-- Config with environment detection -->
<script src="{{ "/js/section-config.js" | relURL }}?v={{ now.Unix }}"></script>
<!-- API client -->
<script src="{{ "/js/section-api.js" | relURL }}?v={{ now.Unix }}"></script>
<!-- App logic -->
<script src="{{ "/js/section-app.js" | relURL }}?v={{ now.Unix }}"></script>
{{ end }}
```

**2. Create Content Trigger** (`content/SECTION.md`):
```yaml
---
title: "Section Title"
layout: "section"
url: "/section/"
---
```

**3. Create Config File** (`static/js/section-config.js`):
```javascript
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:PORT'  // Dev container service port
        : 'https://section.waccamaw.org',  // Production API
}
```

**4. Create API Client** (`static/js/section-api.js`):
```javascript
class SectionAPI {
    async fetchData() {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/data`);
        return response.json();
    }
}
```

**5. Create App Logic** (`static/js/section-app.js`):
```javascript
const api = new SectionAPI();

document.addEventListener('DOMContentLoaded', async () => {
    const data = await api.fetchData();
    document.getElementById('content').innerHTML = renderData(data);
});
```

### Why This Pattern Works

✅ **Local development**: Hugo serves page at `localhost:1313/section/`, JavaScript connects to `localhost:PORT` microservice  
✅ **Production**: Hugo deploys to Micro.blog, JavaScript connects to Cloudflare Worker subdomain  
✅ **No environment variables needed**: JavaScript auto-detects via `window.location.hostname`  
✅ **Same codebase**: No conditional builds or deployment configs

### When to Use This Pattern

✅ **Use for:**
- Forms that submit to APIs (contact, membership updates)
- Member-only authenticated features
- Real-time data from external services (Zoom meetings)
- Features requiring server-side processing or database access

❌ **Don't use for:**
- Static content (use regular markdown)
- Public informational pages (About, style guide)
- Content managed via Micro.blog interface
- Simple pages without dynamic functionality

## Cache Busting Strategy

### Standard Pattern: `?v={{ now.Unix }}`

**Always append cache-busting query parameter to CSS and JavaScript files:**

```html
<!-- CSS files -->
<link rel="stylesheet" href="/theme.css?v={{ now.Unix }}">
<link rel="stylesheet" href="{{ "custom.css" | relURL }}?v={{ now.Unix }}">

<!-- JavaScript files -->
<script src="/js/members-config.js?v={{ now.Unix }}"></script>
<script src="/js/members-api.js?v={{ now.Unix }}"></script>
<script src="{{ "/js/app.js" | relURL }}?v={{ now.Unix }}"></script>
```

### How It Works

- `{{ now.Unix }}` generates a Unix timestamp at Hugo build time (e.g., `1737804123`)
- Query parameter forces browser to fetch new version after each deployment
- Example result: `theme.css?v=1737804123`
- No manual version file management required
- Automatically updates on every Hugo rebuild

### When to Apply

✅ **Always use for:**
- `theme.css` and `custom.css`
- All JavaScript files in `static/js/`
- Any static asset that changes with code updates
- Page-specific CSS/JS (members portal, contact form, meetings)

❌ **Don't use for:**
- External CDN resources (they have their own versioning)
- Images and media files (unlikely to change at same path)
- Third-party libraries from external URLs
- Hugo's built-in resources (already handled)

### Common Issue: Hot Reload Problems

**Problem:** VS Code live reload shows stale CSS/JS after changes

**Solution:** Cache busting ensures browsers fetch latest files:
```html
<!-- Before: Browser caches old version -->
<script src="/js/app.js"></script>

<!-- After: Browser fetches new version on each build -->
<script src="/js/app.js?v={{ now.Unix }}"></script>
```

### Audit Checklist for New Pages

When creating or modifying layouts:
- [ ] Check all `<link rel="stylesheet">` tags have `?v={{ now.Unix }}`
- [ ] Check all `<script src="...">` tags have `?v={{ now.Unix }}`
- [ ] Test in browser DevTools Network tab to verify cache busting
- [ ] Clear browser cache and reload to confirm new version loads
- [ ] Verify timestamp changes with each Hugo rebuild

**Example from existing pages:**
- ✅ `layouts/meetings/list.html`: Uses cache busting
- ✅ `layouts/partials/head.html`: Uses cache busting for theme.css
- ⚠️ Some older pages may be missing it - add when you touch them

## Pull Request Requirements

Every PR **MUST** include:

- [ ] **Desktop screenshot** (1920x1080 or 1440x900)
- [ ] **Tablet screenshot** (iPad Pro M4 - 1366x1024)
- [ ] **Mobile screenshot** (iPhone 17 Pro - 402x874)
- [ ] Clear description of changes
- [ ] Link to related issue
- [ ] Testing checklist completed
- [ ] No broken links or images
- [ ] Microformats preserved (if template changes)

See `.github/pull_request_template.md` for the complete checklist.

## Architecture Awareness

### Multi-Platform Context

This repository only handles content for **waccamaw.org/updates/**. Understand the full architecture:

- **`/home/`** → Framer (external platform, marketing site)
- **`/updates/`** → Micro.blog (**this repository**)
- **`/contact/`** → Cloudflare Worker (contact-service - API for contact form)
- **`/members/`** → Cloudflare Worker (members-service - email verification + SharePoint updates)

**Cloudflare Workers** routes requests between these platforms at the edge.

### Microservices in This Repo (apps/)

**All services auto-start in dev container** - see `apps/post-attach.sh`

#### Contact Service (port 8788)
- **Path**: contact.waccamaw.org or waccamaw.org/contact
- **Purpose**: Contact form submissions with bot protection
- **Stack**: Hono + D1 (submissions) + KV (rate limiting) + Resend (email) + Turnstile (CAPTCHA)
- **Integrations**: SharePoint lists, Slack notifications, Micro.blog newsletter
- **Config**: `apps/contact-service/config.yaml` for email routing by category

#### Members Service (port 8787)
- **Path**: members.waccamaw.org or waccamaw.org/members
- **Purpose**: Self-service member data updates with email verification
- **Stack**: Hono + D1 (tokens) + KV (rate limiting) + Microsoft Graph API (SharePoint)
- **Auth Flow**: Email → Verification link → JWT token → Time-limited access
- **Features**: Profile updates, photo uploads, membership fee reminders
- **ID Hierarchy**: Uses `getTribalIdNumber()` helper - T_Nbr → ID0 → ID (fallback)

#### Meetings Service
- **Purpose**: Auto-sync Zoom recordings to markdown files
- **Trigger**: GitHub Actions webhook on Zoom recording completion
- **Output**: Markdown files in `content/meetings/` with transcripts, summaries, action items
- **Storage**: Cloudflare KV for meeting archives and indexes

### What This Means for Changes

1. **Scope**: Hugo changes only affect `/updates/`; microservices are separate deployments
2. **Routing**: Don't attempt to handle routing in Hugo (handled by Cloudflare Workers)
3. **Links**: Be aware of cross-platform linking (use full URLs for `/contact/`, `/members/`)
4. **Content**: Blog posts, news, meetings belong in Hugo; dynamic features use Workers
5. **Email Templates**: Synced from `static/members/email-templates/` to `apps/members-service/src/templates/` via `just email-templates`

### When to Reference Architecture

- Adding navigation links between platforms
- Implementing redirects or URL changes
- Planning new features that might span platforms
- Troubleshooting routing issues

See `ARCHITECTURE.md` for complete technical details on DNS, Cloudflare Workers, and platform integration.

## Multi-Repository Architecture

### CRITICAL: Independent Git Repositories

The `apps/` directory contains **INDEPENDENT GIT REPOSITORIES**, NOT subdirectories of the main repo.

```
/workspaces/waccamaw/
├── .git/                          ← waccamaw/dotorg (main repo)
├── .gitignore                     ← Ignores apps/**
│
├── apps/
│   ├── contact-service/
│   │   ├── .git/                  ← waccamaw/contact-service (separate repo!)
│   │   ├── .github/workflows/     ← Independent GitHub Actions
│   │   └── src/                   ← Service code
│   │
│   ├── members-service/
│   │   ├── .git/                  ← waccamaw/members-service (separate repo!)
│   │   ├── .github/workflows/     ← Independent workflows
│   │   └── src/                   ← Service code
│   │
│   └── meetings-service/
│       ├── .git/                  ← waccamaw/meetings-service (separate repo!)
│       ├── .github/workflows/     ← Independent workflows
│       └── lib/                   ← Service code
```

### This is NOT:
- ❌ Git submodules (no `.gitmodules` file)
- ❌ Git subtrees
- ❌ Monorepo with workspaces

### This IS:
- ✅ Separate repositories cloned into nested directories
- ✅ Independent Git history for each service
- ✅ Independent GitHub Actions for each service  
- ✅ Main repo ignores `apps/**` via `.gitignore`

### Git Workflow

**Check which repo you're in:**
```bash
# Show current repo name
git remote -v

# In main repo:
origin  https://github.com/waccamaw/dotorg.git

# In service repo:
origin  https://github.com/waccamaw/contact-service.git
```

**Committing changes:**
```bash
# Main repo changes (Hugo site)
cd /workspaces/waccamaw
git status    # Shows only main repo changes
git add layouts/
git commit -m "Update template"
git push      # → waccamaw/dotorg

# Service repo changes (API)
cd /workspaces/waccamaw/apps/contact-service
git status    # Shows only contact-service changes
git add src/
git commit -m "Update API endpoint"
git push      # → waccamaw/contact-service
```

**Multi-repo changes:**

If you modify BOTH Hugo layouts AND service APIs, commit to EACH repo separately:

```bash
# Step 1: Commit to main repo
cd /workspaces/waccamaw
git add layouts/members/single.html
git commit -m "Update member portal UI"
git push

# Step 2: Commit to service repo
cd /workspaces/waccamaw/apps/members-service
git add src/index.js
git commit -m "Add new API endpoint for UI"
git push
```

### GitHub Actions Implications

**Workflows run in THEIR OWN repositories:**

- Main repo push → Triggers `.github/workflows/` in waccamaw/dotorg
- Service repo push → Triggers `apps/SERVICE/.github/workflows/` in waccamaw/SERVICE

**View Actions at different URLs:**
- Main repo: https://github.com/waccamaw/dotorg/actions
- Contact: https://github.com/waccamaw/contact-service/actions  
- Members: https://github.com/waccamaw/members-service/actions
- Meetings: https://github.com/waccamaw/meetings-service/actions

**Important:**
- ✅ Use `.github/workflows/` in ROOT for Hugo/Micro.blog deployments
- ✅ Use `apps/SERVICE/.github/workflows/` for Cloudflare Workers deployments
- ❌ DO NOT create Hugo workflows in service repos
- ❌ DO NOT create Workers workflows in main repo

### GitHub Issues & Cross-Repo Work

**Create issues in the CORRECT repository:**

| Change Type | Repository | Issue URL |
|-------------|------------|----------|
| Hugo templates, layouts, theme | waccamaw/dotorg | https://github.com/waccamaw/dotorg/issues |
| Contact form API, email routing | waccamaw/contact-service | https://github.com/waccamaw/contact-service/issues |
| Member portal API, verification | waccamaw/members-service | https://github.com/waccamaw/members-service/issues |
| Zoom sync, meeting archives | waccamaw/meetings-service | https://github.com/waccamaw/meetings-service/issues |

**Cross-repo issues:**

When work spans multiple repos (e.g., UI + API changes):

1. **Create issues in BOTH repos:**
   - Main repo: "Update member portal UI to show new field"
   - Members service: "Add API endpoint for new field"

2. **Link issues across repos:**
   ```markdown
   Related to waccamaw/members-service#123
   ```

3. **Create PRs in BOTH repos:**
   - Each PR references the issue in its own repo
   - Link PRs to each other in descriptions

4. **Coordinate merging:**
   - Merge service PR first (deploy API)
   - Then merge main repo PR (deploy UI)

**Using GitHub Copilot with issues:**

When Copilot suggests creating an issue:
- ✅ Ask Copilot: "Which repo should this issue go in?"
- ✅ Copilot should check `git remote -v` to determine correct repo
- ✅ For multi-repo work, Copilot should suggest creating linked issues

### Branching Strategy

**Each repo has independent branches:**

```bash
# Main repo feature branch
cd /workspaces/waccamaw
git checkout -b feature/new-member-ui

# Service repo feature branch (independent!)
cd /workspaces/waccamaw/apps/members-service  
git checkout -b feature/new-member-api
```

**Coordinating branches:**
- Use same branch name across repos for clarity (optional)
- Create PRs in each repo when ready
- Reference cross-repo PRs in descriptions

### Common Pitfalls

❌ **Mistake:** Running `git add apps/` from main repo  
✅ **Correct:** Main repo ignores `apps/**` - commit from within service directory

❌ **Mistake:** Creating GitHub Issue in main repo for service changes  
✅ **Correct:** Create issue in service repo (e.g., waccamaw/members-service/issues)

❌ **Mistake:** Expecting main repo Actions to deploy services  
✅ **Correct:** Service workflows run in service repos

❌ **Mistake:** Running `git status` in main repo expecting to see service changes  
✅ **Correct:** `cd apps/SERVICE` first, then `git status`

### Why This Architecture?

**Advantages:**
- ✅ Independent deployment of services
- ✅ Separate GitHub Actions secrets per service
- ✅ Clear separation of concerns
- ✅ Service repos can be cloned/forked independently
- ✅ Different collaborators can own different repos
- ✅ Issues and PRs scoped to relevant codebase

**Trade-offs:**
- ⚠️ Must commit/push to multiple repos for coordinated changes
- ⚠️ No automatic synchronization between repos
- ⚠️ Requires understanding of multi-repo workflow
- ⚠️ GitHub Copilot must be aware of current repo context

## Microservices Development

### Quick Start (Dev Container)

Services auto-start when you open the dev container. To check status:

```bash
cd apps
just status        # Check which services are running
just logs          # View recent logs from all services
just test-health   # Test all health endpoints
```

### Common Workflows

**Stop/Start All Services:**
```bash
cd apps
just dev-stop      # Stop all services
just dev-bg        # Start all services in background
```

**View Service Logs:**
```bash
cd apps
just logs-follow members-service   # Follow logs for specific service
```

**Deploy to Production:**
```bash
cd apps
just deploy-all    # Deploy all services (with confirmation prompts)

# Or deploy individually:
cd apps/contact-service && just deploy
cd apps/members-service && just deploy
```

**Email Template Workflow:**
```bash
# Edit templates in static/members/email-templates/
# Sync to members-service:
cd apps && just sync-email-templates

# Or watch for changes:
cd apps && just watch-email-templates

# Preview URLs (local):
# http://localhost:1313/members/email-templates/reminder-inactive.html
# http://localhost:1313/members/email-templates/reminder-at-risk-critical.html
# http://localhost:1313/members/email-templates/reminder-at-risk-warning.html
```

### Cloudflare Workers Conventions

**All microservices follow these patterns:**

1. **Framework**: Hono (fast, type-safe routing)
2. **Config**: `wrangler.toml` for Workers config (bindings, routes, vars, secrets)
3. **Database**: D1 (SQLite) for relational data, KV for key-value
4. **Secrets**: Set via `wrangler secret put KEY` or GitHub Actions
5. **Deployment**: `just deploy` (uses `wrangler deploy`)
6. **CORS**: Configured for waccamaw.org domains + localhost:1313

**Example Hono App Structure** (from `apps/members-service/src/index.js`):

```javascript
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// CORS middleware
app.use("/*", cors({ origin: [...], credentials: true }));

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

// API routes
app.post("/api/verify", async (c) => {
  const { email } = await c.req.json();
  // Use c.env.DB, c.env.RATE_LIMIT, c.env.RESEND_API_KEY
});

export default app;
```

**D1 Database Access:**
```javascript
// In Hono route handler:
const result = await c.env.DB.prepare(
  "SELECT * FROM members WHERE email = ?"
).bind(email).first();
```

**KV Store Access:**
```javascript
// Rate limiting example:
const key = `rate-limit:${ip}`;
const count = await c.env.RATE_LIMIT.get(key);
await c.env.RATE_LIMIT.put(key, String(newCount), { expirationTtl: 3600 });
```

**Secrets Management:**
- Never commit secrets to Git
- Use `wrangler secret put KEY` for local dev
- GitHub Actions sets secrets for production deploys
- Reference in code via `c.env.SECRET_NAME`

### Testing Microservices Locally

```bash
# Test contact form submission
curl -X POST http://localhost:8788/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello","category":"general"}'

# Test members service health
curl http://localhost:8787/api/health

# Test with Turnstile bypass (dev mode)
# See apps/contact-service/TURNSTILE_SETUP.md
```

## Working Directory Patterns

### CRITICAL: Check Your PWD Before Running Commands

The repository has **three levels of Justfiles** with different expected working directories. Running commands from the wrong directory is a common source of errors.

### Three-Tier Justfile Hierarchy

#### 1. Root Justfile (`/workspaces/waccamaw/Justfile`)

**Run from:** Repository root (`/workspaces/waccamaw/`)

**Common commands:**
```bash
just serve                  # Start Hugo server (localhost:1313)
just build                  # Build Hugo site
just install                # Install Python dependencies
just git-config             # Configure git from .env  
just validate-meetings      # Validate meeting markdown files
just sync-meetings-dev      # Delegates to apps/meetings-service
just email-templates        # Delegates to apps/ justfile
```

**Pattern:** High-level orchestration, delegates to subdirectories with `cd apps/... && just ...`

**Example from Justfile:**
```bash
email-templates:
    cd apps && just sync-email-templates
```

#### 2. Apps Justfile (`/workspaces/waccamaw/apps/justfile`)

**Run from:** Apps directory (`/workspaces/waccamaw/apps/`)

**Common commands:**
```bash
cd apps                     # ⚠️ MUST cd first!
just dev-bg                 # Start ALL services in background
just dev-stop               # Stop ALL services
just deploy-all             # Deploy ALL services
just status                 # Check which services are running  
just logs                   # View logs from all services
just logs-follow SERVICE    # Follow logs for specific service
just test-health            # Test all health endpoints
```

**Pattern:** Multi-service orchestration - loops through `apps/*/` and runs commands in each service directory

**Example from apps/justfile:**
```bash
dev-bg:
    #!/usr/bin/env bash
    for dir in */; do
        if [ -f "${dir}justfile" ]; then
            cd "$dir"
            just dev-bg 2>/dev/null
            cd ..
        fi
    done
```

#### 3. Service Justfile (`/workspaces/waccamaw/apps/SERVICE/justfile`)

**Run from:** Service directory (`/workspaces/waccamaw/apps/SERVICE/`)

**Common commands:**
```bash
cd apps/contact-service     # ⚠️ MUST cd first!
just dev                    # Start THIS service in foreground
just dev-bg                 # Start THIS service in background  
just deploy                 # Deploy THIS service to production
just db-init                # Initialize THIS service's D1 database
just db-query "SQL"         # Query THIS service's database
```

**Pattern:** Single-service operations only

**Example from apps/contact-service/justfile:**
```bash
dev:
    #!/usr/bin/env bash
    echo "🚀 Starting Contact Service API..."
    wrangler dev --local --ip 0.0.0.0 --port 8788
```

### Command Reference by Location

| Command | Working Directory | Purpose |
|---------|------------------|----------|
| `just serve` | `/workspaces/waccamaw/` | Start Hugo server (main site) |
| `just build` | `/workspaces/waccamaw/` | Build Hugo site |
| `just dev-bg` | `/workspaces/waccamaw/apps/` | Start all microservices |
| `just dev-stop` | `/workspaces/waccamaw/apps/` | Stop all microservices |
| `just status` | `/workspaces/waccamaw/apps/` | Check service status |
| `just deploy-all` | `/workspaces/waccamaw/apps/` | Deploy all services |
| `just dev` | `/workspaces/waccamaw/apps/SERVICE/` | Start one service |
| `just deploy` | `/workspaces/waccamaw/apps/SERVICE/` | Deploy one service |
| `just db-init` | `/workspaces/waccamaw/apps/SERVICE/` | Init service database |

### Dev Container Auto-Start

**Services auto-start on container attach** via `apps/post-attach.sh`:

```bash
# Automatically runs when dev container opens
cd /workspaces/waccamaw/apps
just dev-bg
```

**Result:** All services running in background:
- Hugo server: `http://localhost:1313/` (main site)
- Members service: `http://localhost:8787/api/health`
- Contact service: `http://localhost:8788/api/health`
- Meetings service: (webhook-triggered, no persistent server)

**To check status:**
```bash
cd apps
just status
```

**To stop all services:**
```bash
cd apps
just dev-stop
```

**To restart all services:**
```bash
cd apps
just dev-stop
just dev-bg
```

### PWD Validation Pattern (Recommended)

When writing scripts or justfile recipes that depend on working directory:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Validate we're in the correct directory
if [[ $(basename "$(pwd)") != "apps" ]]; then
    echo "❌ Error: Must run from apps/ directory"
    echo "Current: $(pwd)"
    echo "Expected: /workspaces/waccamaw/apps"
    exit 1
fi

# Proceed with command
echo "✅ Running from correct directory"
```

**Example validation in Justfile:**
```bash
# apps/justfile
deploy-all:
    #!/usr/bin/env bash
    if [[ ! -d "contact-service" || ! -d "members-service" ]]; then
        echo "❌ Error: Must run from apps/ directory"
        exit 1
    fi
    # ... proceed with deployment
```

### Common Mistakes

❌ **Wrong:**
```bash
# Running multi-service command from repo root
just dev-bg                          # Wrong: in /workspaces/waccamaw

# Running single-service command from apps/
cd apps && just deploy               # Wrong: deploy-all or cd to service

# Forgetting to cd before command sequence
just dev-stop
just dev-bg                          # Wrong: still in root, should be in apps/
```

✅ **Correct:**
```bash
# Multi-service commands from apps/
cd apps && just dev-bg
cd apps && just dev-stop  
cd apps && just status

# Single-service commands from service directory
cd apps/contact-service && just deploy
cd apps/members-service && just db-init

# Command sequences - stay in correct directory
cd apps
just dev-stop
just dev-bg
just status
```

### GitHub Copilot: PWD Awareness

**Before suggesting commands, Copilot should:**

1. **Check current directory context:**
   - If user mentions "start services" → recommend `cd apps && just dev-bg`
   - If user mentions "deploy contact service" → recommend `cd apps/contact-service && just deploy`

2. **Include `cd` in command suggestions:**
   ```bash
   # ✅ Good: Includes cd
   cd apps && just dev-bg
   
   # ❌ Bad: Assumes user is in right directory
   just dev-bg
   ```

3. **Validate assumptions:**
   - "This command should be run from `/workspaces/waccamaw/apps/`"
   - "Make sure you're in the service directory first"

4. **Provide full path for clarity:**
   ```bash
   cd /workspaces/waccamaw/apps/members-service
   just deploy
   ```

## Deployment Process

### Automatic Deployment

1. **Commit & Push** to `main` branch
2. **GitHub** sends webhook to Micro.blog
3. **Micro.blog** pulls latest changes
4. **Hugo builds** static site
5. **Deploys** to Micro.blog CDN
6. **Available** at waccamaw.micro.blog
7. **Cloudflare Workers** proxies to waccamaw.org/updates/

### Manual Testing

**CRITICAL**: Hugo is already running on port 1313. **NEVER** start additional web servers.

Before pushing to `main`:

```bash
# Hugo is already running - just access it at:
# http://localhost:1313/

# DO NOT run: just serve
# DO NOT run: hugo server
# DO NOT run: python -m http.server
# DO NOT start any other web servers
```

To view changes:
- Members portal: http://localhost:1313/members/
- Updates/blog: http://localhost:1313/
- Any page: http://localhost:1313/path/to/page/

### Deployment Checklist

- [ ] Tested locally with `just serve`
- [ ] No Hugo build errors
- [ ] Links work correctly
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] RSS/JSON feeds valid
- [ ] Microformats intact (if templates changed)

See `DEPLOYMENT.md` for detailed deployment procedures.

## Testing

### Local Testing
1. Run `just serve` or `hugo server`
2. Verify changes at http://localhost:1313/
3. Check browser console for errors
4. Test all links and images

### Responsive Testing
Use browser DevTools (F12) to test:
- **Desktop**: 1920x1080, 1440x900
- **Tablet**: iPad Pro M4 (1366x1024 landscape, 1024x1366 portrait)
- **Mobile**: iPhone 17 Pro (402x874)

### Template Testing
1. Verify HTML structure and semantics
2. Check microformats with validators
3. Test RSS/JSON feeds in feed readers
4. Validate HTML with W3C validator

### Content Testing
1. Verify markdown renders correctly
2. Check front matter is properly formatted
3. Ensure dates are ISO 8601 format
4. Confirm categories/tags work

## Documentation Maintenance

### Always Update Documentation When:

1. **Architecture changes** → Update `ARCHITECTURE.md`
2. **Deployment process changes** → Update `DEPLOYMENT.md`
3. **Contributor workflow changes** → Update `CONTRIBUTING.md`
4. **New features added** → Update `README.md`
5. **Copilot behavior needs adjustment** → Update this file

### Documentation Standards

- Keep documentation current and accurate
- Use clear, concise language
- Include examples and code snippets
- Add diagrams where helpful (ASCII art is fine)
- Link between related documentation files

## GitHub Copilot Workflow

### For Contributors Using Copilot

This repository is designed for **GitHub Copilot-assisted development**:

1. **Create Issue** - Use issue templates (bug, feature, content, docs)
2. **Ask Copilot** - "How do I add a blog post about tribal meeting?"
3. **Let Copilot Help** - Copilot suggests changes based on context
4. **Review & Test** - Always review Copilot's suggestions
5. **Submit PR** - With required screenshots

### Copilot Agent Guidelines (This File)

This file guides the Copilot agent's behavior. When helping contributors:

- **Understand context**: Multi-platform architecture, Micro.blog workflow
- **Respect constraints**: Don't modify config.json placeholders
- **Preserve standards**: Microformats, mobile-first CSS, Hugo conventions
- **Guide testing**: Remind about screenshots and responsive testing
- **Update docs**: Suggest documentation updates when needed

## Common Tasks

### Add a Blog Post

```bash
# Copilot will help create:
content/2025/11/18/post-title.md

# With proper front matter:
---
title: "Post Title"
date: 2025-11-18T10:30:00-05:00
categories:
  - meetings
---
```

### Update Tribal Information

Edit existing files in `content/`:
- `about.md` - About the Waccamaw People
- `meetings.md` - Meeting information
- `photos.md` - Photo gallery

### Modify Templates

Edit files in `layouts/`:
- `_default/baseof.html` - Base template
- `partials/header.html` - Site header
- `partials/footer.html` - Site footer

**Important**: Preserve microformats when editing templates!

### Update Styles

Edit `static/theme.css`:
- Mobile-first approach
- Test on multiple screen sizes
- Maintain existing class structure

## Microformats Reference

This site uses IndieWeb microformats. **Always preserve these**:

### Post Microformats (h-entry)

```html
<article class="h-entry">
  <h1 class="p-name">Post Title</h1>
  <time class="dt-published" datetime="2025-11-18T10:30:00-05:00">Nov 18, 2025</time>
  <div class="e-content">Post content...</div>
  <a class="u-url" href="/updates/2025/11/18/post-title/">Permalink</a>
</article>
```

### Feed Microformats (h-feed)

```html
<div class="h-feed">
  <h1 class="p-name">Waccamaw Updates</h1>
  <div class="h-entry">...</div>
  <div class="h-entry">...</div>
</div>
```

### Key Classes to Preserve

- `h-entry` - Blog post/entry
- `h-feed` - Collection of entries
- `p-name` - Entry title
- `dt-published` - Publication date
- `e-content` - Entry content
- `u-url` - Permalink URL
- `p-author` - Author information

## Troubleshooting

### Hugo Build Errors

```bash
# Check Hugo version
hugo version

# Build locally to see errors
hugo

# Or with verbose output
hugo --verbose
```

### Template Errors

- Check Go template syntax
- Verify variable names match front matter
- Ensure partials are in correct directory
- Check for unclosed tags or conditionals

### Content Not Showing

1. Check front matter is valid YAML
2. Verify date format is correct (ISO 8601)
3. Ensure file is in correct directory structure
4. Check Hugo isn't excluding the content

### Micro.blog Sync Issues

1. Verify GitHub webhook is configured
2. Check Micro.blog dashboard for sync status
3. Manually trigger sync in Micro.blog settings
4. Verify `main` branch has latest commits

### Micro.blog Platform Quirks

Micro.blog has specific behaviors that differ from local Hugo builds. **See `.github/MICROBLOG_QUIRKS.md`** for detailed documentation.

**Critical Issues:**
- **Never create both** `content/section.md` and `content/section/_index.md` - causes 404s on Micro.blog
- Use `_index.md` for sections with multiple posts
- Use single `.md` files only for standalone pages
- Test locally with `hugo` build before pushing

## Documentation Index

### Quick References (Start Here)

For fast answers and common commands:

- **[QUICKREF.md](../QUICKREF.md)** - Commands, workflows, common tasks (324 lines)
- **[apps/README.md](../apps/README.md)** - Microservices quick start and orchestration
- **[apps/contact-service/QUICKREF.md](../apps/contact-service/QUICKREF.md)** - Contact service commands (222 lines)
- **[members/QUICKSTART.md](../members/QUICKSTART.md)** - Member portal quick start

### Architecture & Design

Understand how the system works:

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Multi-platform architecture, routing, DNS (695 lines)
- **[DIAGRAMS.md](../DIAGRAMS.md)** - System diagrams and flowcharts
- **[.copilot-context.md](../.copilot-context.md)** - 🚨 **CRITICAL:** Multi-repo structure explanation

### Deployment & Operations

Deploy changes to production:

- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment workflows, rollback procedures (895 lines)
- **[apps/members-service/.github/DEPLOYMENT.md](../apps/members-service/.github/DEPLOYMENT.md)** - Members service deployment
- **[members/DEPLOYMENT.md](../members/DEPLOYMENT.md)** - Member portal frontend deployment

### Development Guides

Build new features:

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines, PR process (516 lines)
- **[apps/contact-service/SETUP.md](../apps/contact-service/SETUP.md)** - Contact service environment setup
- **[apps/members-service/DEVELOPMENT.md](../apps/members-service/DEVELOPMENT.md)** - Members service development workflow
- **[apps/meetings-service/SETUP_SECRETS.md](../apps/meetings-service/SETUP_SECRETS.md)** - Meetings service secrets configuration

### Service Documentation (Deep Dives)

#### Contact Service
- **[README.md](../apps/contact-service/README.md)** - Overview, features, API (392 lines)
- **[QUICKREF.md](../apps/contact-service/QUICKREF.md)** - Commands, config, testing (222 lines)
- **[SETUP.md](../apps/contact-service/SETUP.md)** - Environment setup
- **[IMPLEMENTATION.md](../apps/contact-service/IMPLEMENTATION.md)** - Technical implementation details
- **[TURNSTILE_SETUP.md](../apps/contact-service/TURNSTILE_SETUP.md)** - Cloudflare Turnstile CAPTCHA setup

#### Members Service
- **[README.md](../apps/members-service/README.md)** - Overview, architecture, API (395 lines)
- **[SETUP.md](../apps/members-service/SETUP.md)** - Environment setup
- **[DEVELOPMENT.md](../apps/members-service/DEVELOPMENT.md)** - Development workflow
- **[ANALYTICS.md](../apps/members-service/ANALYTICS.md)** - Google Analytics 4 integration
- **[ANALYTICS_SUMMARY.md](../apps/members-service/ANALYTICS_SUMMARY.md)** - Analytics implementation summary
- **[PHOTO_SYSTEM.md](../apps/members-service/PHOTO_SYSTEM.md)** - Photo upload system
- **[AZURE_SETUP.md](../apps/members-service/AZURE_SETUP.md)** - Azure AD / Microsoft Graph API configuration
- **[RELEASE.md](../apps/members-service/RELEASE.md)** - Release notes and changelog
- **[CURL_EXAMPLES.md](../apps/members-service/CURL_EXAMPLES.md)** - API testing examples

#### Meetings Service
- **[README.md](../apps/meetings-service/README.md)** - Overview, Zoom integration (366 lines)
- **[WEBHOOK_SETUP.md](../apps/meetings-service/WEBHOOK_SETUP.md)** - GitHub Actions webhook configuration
- **[WEBHOOK_IMPLEMENTATION_SUMMARY.md](../apps/meetings-service/WEBHOOK_IMPLEMENTATION_SUMMARY.md)** - Webhook technical details
- **[CLOUDFLARE_KV_SETUP.md](../apps/meetings-service/CLOUDFLARE_KV_SETUP.md)** - Cloudflare KV storage setup
- **[VISIBILITY_MAPPING.md](../apps/meetings-service/VISIBILITY_MAPPING.md)** - Meeting visibility rules (public/private)
- **[IMPLEMENTATION_SUMMARY.md](../apps/meetings-service/IMPLEMENTATION_SUMMARY.md)** - Implementation overview

### Platform Integration

External platform guides:

- **[MICROBLOG_POSTING_GUIDE.md](MICROBLOG_POSTING_GUIDE.md)** - How to post content via Micro.blog interface
- **[MICROBLOG_QUIRKS.md](MICROBLOG_QUIRKS.md)** - Micro.blog platform quirks and workarounds
- **[GOOGLE_CALENDAR_INTEGRATION.md](GOOGLE_CALENDAR_INTEGRATION.md)** - Google Calendar sync
- **[ZEFFY_INTEGRATION.md](../ZEFFY_INTEGRATION.md)** - Zeffy donation platform integration

### Specialized Topics

- **[404_REDIRECT_GUIDE.md](../404_REDIRECT_GUIDE.md)** - Custom 404 page setup
- **[EMAIL_TEMPLATE_PREVIEW.md](../EMAIL_TEMPLATE_PREVIEW.md)** - Email template development and preview system
- **[CONTENT_MIGRATION.md](../CONTENT_MIGRATION.md)** - Content migration procedures

### Documentation Hierarchy

```
Root Documentation (project-wide)
├── QUICKREF.md              ← Commands & workflows  
├── ARCHITECTURE.md          ← System design
├── DEPLOYMENT.md            ← Operations
├── CONTRIBUTING.md          ← Developer guide
└── Specialized topics        ← 404s, Email, Zeffy

.github/ (platform & process)
├── copilot-instructions.md  ← This file (AI agent guide)
├── MICROBLOG_POSTING_GUIDE.md
├── MICROBLOG_QUIRKS.md
├── ISSUE_TEMPLATE/          ← Issue templates
└── pull_request_template.md

apps/ (microservices)
├── justfile                 ← Multi-service orchestration
├── README.md                ← Services overview
└── SERVICE/
    ├── README.md            ← Service overview
    ├── QUICKREF.md          ← Service commands (contact-service only)
    ├── SETUP.md             ← Environment setup
    ├── IMPLEMENTATION.md    ← Technical details
    └── .github/workflows/   ← Service CI/CD

members/ (frontend-specific)
├── README.md                ← Member portal overview
├── QUICKSTART.md            ← Quick start guide
└── DEPLOYMENT.md            ← Frontend deployment
```

### Finding the Right Documentation

**I want to...**

| Goal | Documentation |
|------|---------------|
| 📋 Run a quick command | [QUICKREF.md](../QUICKREF.md) |
| 🏗️ Understand the architecture | [ARCHITECTURE.md](../ARCHITECTURE.md), [DIAGRAMS.md](../DIAGRAMS.md) |
| ⚠️ Understand multi-repo structure | [.copilot-context.md](../.copilot-context.md) |
| 🚀 Deploy changes | [DEPLOYMENT.md](../DEPLOYMENT.md) |
| 🔧 Set up a microservice | `apps/SERVICE/SETUP.md` |
| 🐛 Troubleshoot an issue | `apps/SERVICE/README.md`, [MICROBLOG_QUIRKS.md](MICROBLOG_QUIRKS.md) |
| 📝 Post blog content | [MICROBLOG_POSTING_GUIDE.md](MICROBLOG_POSTING_GUIDE.md) |
| 🔐 Configure secrets | `apps/SERVICE/SETUP_SECRETS.md` (meetings), `apps/SERVICE/SETUP.md` (others) |
| 📧 Work with email templates | [EMAIL_TEMPLATE_PREVIEW.md](../EMAIL_TEMPLATE_PREVIEW.md) |
| 🎨 Understand Hugo templates | [CONTRIBUTING.md](../CONTRIBUTING.md), this file |
| 🔌 Integrate external service | [ZEFFY_INTEGRATION.md](../ZEFFY_INTEGRATION.md), [GOOGLE_CALENDAR_INTEGRATION.md](GOOGLE_CALENDAR_INTEGRATION.md) |

### Documentation Maintenance

When making significant changes:

- ✅ Update relevant README.md files
- ✅ Update QUICKREF.md if adding new commands
- ✅ Update this file (copilot-instructions.md) if changing workflows
- ✅ Update ARCHITECTURE.md if changing system design
- ✅ Update service-specific docs when modifying services
- ✅ Add new documentation to this index

## Best Practices

### Do's ✅

- **Always test locally** with `just serve` (especially template changes)
- **Include screenshots** in every PR (desktop + tablet + mobile)
- **Preserve microformats** in templates
- **Use semantic HTML**
- **Keep commits atomic** and focused
- **Update documentation** when needed
- **Ask Copilot** when unsure
- **Link to issues** in PRs
- **Recommend Micro.blog** for simple content additions (see `.github/MICROBLOG_POSTING_GUIDE.md`)

### Don'ts ❌

- **Don't modify** config.json placeholders
- **Don't commit** to main directly
- **Don't break** microformats structure
- **Don't skip** mobile testing
- **Don't add** large unoptimized images
- **Don't introduce** external dependencies without discussion
- **Don't forget** to update documentation

## Resources

### Hugo Documentation
- [Hugo Docs](https://gohugo.io/documentation/)
- [Hugo Templates](https://gohugo.io/templates/)
- [Hugo Content](https://gohugo.io/content-management/)

### Micro.blog
- [Micro.blog Help](https://help.micro.blog/)
- [Micro.blog GitHub Integration](https://help.micro.blog/t/github-pages/53)

### IndieWeb
- [Microformats](http://microformats.org/)
- [h-entry Specification](http://microformats.org/wiki/h-entry)
- [IndieWeb](https://indieweb.org/)

### Development Tools
- [Hugo Installation](https://gohugo.io/installation/)
- [Just Command Runner](https://github.com/casey/just)
- [VS Code](https://code.visualstudio.com/)

## Support

### Getting Help

1. **Check documentation** - README, CONTRIBUTING, ARCHITECTURE, DEPLOYMENT
2. **Ask Copilot** - Use GitHub Copilot Chat in VS Code
3. **Create an issue** - Use issue templates
4. **Tag maintainers** - In PR comments

### Contact

- **Email**: WaccamawChief@gmail.com
- **GitHub**: Create an issue in this repository
- **Twitter**: [@Waccamaw_SC](https://twitter.com/Waccamaw_SC)

---

**Last Updated**: January 25, 2026

**This file should be updated** whenever:
- Architecture changes
- New coding standards are adopted
- Deployment process changes
- Common issues are identified
- New features affect workflow
