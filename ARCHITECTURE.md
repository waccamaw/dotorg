# Waccamaw.org Architecture

This document describes the technical architecture of the Waccamaw Indian People's website, including DNS configuration, routing strategy, and platform integration.

## Table of Contents

- [Overview](#overview)
- [Multi-Platform Architecture](#multi-platform-architecture)
- [DNS Configuration](#dns-configuration)
- [Cloudflare Workers Routing](#cloudflare-workers-routing)
- [Platform Components](#platform-components)
- [Data Flow](#data-flow)
- [Development Environments](#development-environments)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)

## Overview

The Waccamaw.org website uses a **segmented multi-platform architecture** where different URL paths are routed to different hosting platforms, each optimized for its specific purpose. This approach allows us to:

- Use best-in-class tools for each use case
- Keep costs low (free/non-profit tiers)
- Maintain flexibility and independence
- Scale components separately

### Key Design Principles

1. **Path-based routing** - Different URL paths route to different platforms
2. **Cloudflare as orchestrator** - Workers handle intelligent routing
3. **Platform independence** - Each component can be upgraded/replaced independently
4. **Cost optimization** - Leverage free tiers for non-profits
5. **Simplicity** - Each platform does what it does best

## Multi-Platform Architecture

```
                               waccamaw.org
                                    |
                                    |
                          ┌─────────┴─────────┐
                          │  Cloudflare DNS   │
                          │   & Workers       │
                          └─────────┬─────────┘
                                    |
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
        │   /home/      │   │   /updates/   │   │   /members/   │
        │               │   │               │   │               │
        │    Framer     │   │  Micro.blog   │   │   Future      │
        │               │   │     (Hugo)    │   │  Microservice │
        │  Marketing    │   │               │   │               │
        │    Site       │   │  Blog/News    │   │  Member       │
        │               │   │   Content     │   │   Portal      │
        └───────────────┘   └───────────────┘   └───────────────┘
             Static              Static              Dynamic
```

### URL Structure

| Path | Platform | Purpose | Repository | Status |
|------|----------|---------|------------|--------|
| `/` | Redirect | Root redirects to `/home/` | N/A | ✅ Active |
| `/home/` | Framer | Marketing, tribal info, about pages | External | ✅ Active |
| `/updates/` | Micro.blog | Blog posts, news, meeting notes, photos | **This repo** | ✅ Active |
| `/members/` | TBD | Member portal, private content | Future | 🔜 Planned |

## DNS Configuration

### Provider: Cloudflare

We use Cloudflare for DNS management and edge computing capabilities.

#### DNS Records

```
# Primary domain
waccamaw.org          A      76.76.21.21  (Cloudflare proxy enabled)
waccamaw.org          AAAA   [IPv6]       (Cloudflare proxy enabled)

# Subdomain for updates
updates.waccamaw.org  CNAME  waccamaw.micro.blog  (Cloudflare proxy enabled)

# Future member portal
members.waccamaw.org  A      [TBD]        (Cloudflare proxy enabled)
```

### Cloudflare Features Enabled

- [x] **Proxy (Orange Cloud)** - Enable for all records
- [x] **SSL/TLS** - Full (strict) mode
- [x] **HTTPS Rewrites** - Force HTTPS
- [x] **HSTS** - HTTP Strict Transport Security
- [x] **Workers** - Edge routing logic
- [x] **Caching** - Optimize static content delivery

### SSL/TLS Configuration

```yaml
Mode: Full (strict)
Edge Certificates: Auto-generated
Minimum TLS: 1.2
TLS 1.3: Enabled
HSTS: Enabled
  - Max Age: 6 months
  - Include Subdomains: Yes
  - Preload: Yes
```

## Cloudflare Workers Routing

### Worker Script Overview

A Cloudflare Worker script handles intelligent routing based on URL paths. The worker runs at the edge, close to users, providing fast routing decisions.

### Routing Logic

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Root redirect to /home/
  if (path === '/') {
    return Response.redirect('https://waccamaw.org/home/', 301)
  }
  
  // Route /home/ to Framer
  if (path.startsWith('/home/')) {
    return fetch('https://waccamaw-org.framer.app' + path.replace('/home/', '/'), {
      headers: request.headers
    })
  }
  
  // Route /updates/ to Micro.blog
  if (path.startsWith('/updates/')) {
    return fetch('https://waccamaw.micro.blog' + path.replace('/updates/', '/'), {
      headers: request.headers
    })
  }
  
  // Route /members/ to future member portal
  if (path.startsWith('/members/')) {
    // TODO: Route to member portal when implemented
    return new Response('Member portal coming soon', { status: 503 })
  }
  
  // Default: serve from Micro.blog (fallback)
  return fetch('https://waccamaw.micro.blog' + path, {
    headers: request.headers
  })
}
```

### Worker Route Configuration

```
Route: waccamaw.org/*
Zone: waccamaw.org
```

### Caching Strategy

```javascript
// Cache static assets aggressively
const CACHE_CONTROL = {
  '/static/*': 'public, max-age=31536000, immutable',
  '/images/*': 'public, max-age=86400',
  '/updates/*': 'public, max-age=300',
  '/home/*': 'public, max-age=600',
  default: 'public, max-age=0, must-revalidate'
}
```

## Platform Components

### 1. Framer (`/home/`)

**Purpose**: Marketing site with rich visual design for tribal information, history, and public-facing content.

**Technology**:
- Platform: Framer (framer.com)
- Type: Visual site builder
- Hosting: Framer's CDN
- Custom domain: Proxied through Cloudflare Worker

**Characteristics**:
- Rich animations and interactions
- Easy for non-technical tribal members to update
- Mobile-responsive by default
- Fast global CDN delivery

**Content Types**:
- About the Waccamaw People
- Tribal history and heritage
- Leadership and governance
- Cultural information
- Contact information
- Event calendars

**Deployment**:
- Managed through Framer's interface
- Published automatically to their CDN
- Proxied through Cloudflare Workers to `/home/` path

### 2. Micro.blog (`/updates/`) - **This Repository**

**Purpose**: Blog platform for news, updates, meeting notes, and community content.

**Technology**:
- Platform: Micro.blog (micro.blog)
- Static Generator: Hugo
- Source Control: This GitHub repository
- Templating: Go HTML templates

**Characteristics**:
- Markdown-based content
- Git-based workflow
- RSS/JSON feeds
- IndieWeb compatible (microformats)
- Open source and customizable

**Content Types**:
- News and announcements
- Tribal meeting notes
- Photo galleries
- Community updates
- Historical content
- Event summaries

**Deployment Process**:
1. Content updated in this GitHub repo
2. Push to `main` branch
3. Micro.blog auto-syncs from GitHub
4. Hugo builds static site
5. Published to Micro.blog's CDN
6. Available at waccamaw.micro.blog
7. Proxied to waccamaw.org/updates/ via Cloudflare Workers

**Repository Structure**:
```
dotorg/
├── config.json          # Hugo configuration
├── content/             # Markdown content files
│   ├── about.md
│   ├── meetings.md
│   └── YYYY/MM/DD/     # Date-organized blog posts
├── layouts/             # Hugo templates
│   ├── _default/
│   ├── partials/
│   └── *.xml/html
└── static/              # CSS, images, logos
```

### 3. Member Portal (`/members/`) - **Future**

**Purpose**: Private member-only portal for internal tribal communications and resources.

**Planned Technology**:
- Container-based microservice
- Framework: TBD (Django, Rails, or Node.js)
- Database: PostgreSQL or MongoDB
- Hosting: Free tier for non-profits
  - Options: Heroku, Railway, Fly.io, Render
  - Requirements: SSL, database, user auth

**Planned Features**:
- Member authentication
- Private documents and resources
- Tribal council communications
- Member directory
- Event registration
- Voting/polling
- Discussion forums

**Architecture Requirements**:
- **Authentication**: OAuth2 or JWT-based
- **Database**: Member data, documents, permissions
- **Storage**: Document/file uploads (S3-compatible)
- **Email**: Notifications and communications
- **Security**: HTTPS, RBAC, audit logging

**Deployment Strategy** (when implemented):
1. Docker container deployment
2. Environment-based configuration
3. Database migrations managed
4. SSL via Cloudflare
5. Proxied to `/members/` path

**Non-Profit Hosting Options**:
- **Heroku**: Free tier for non-profits (via GitHub Student/Non-profit program)
- **Railway**: $5/month credits for non-profits
- **Fly.io**: Free tier, scales affordably
- **Render**: Free tier for static + paid for dynamic
- **Cloudflare Workers** (advanced): Could host serverless API

## Data Flow

### User Request Flow

```
User Browser
    |
    | HTTPS Request (waccamaw.org/updates/some-post)
    ▼
Cloudflare Edge (Nearest POP)
    |
    | DNS Resolution
    ▼
Cloudflare Worker (Routing Logic)
    |
    | Path analysis: /updates/* → Micro.blog
    ▼
Origin Fetch (waccamaw.micro.blog/some-post)
    |
    | Micro.blog CDN serves content
    ▼
Cloudflare Edge (Cache & deliver)
    |
    | Response with caching headers
    ▼
User Browser (Displays content)
```

### Content Update Flow (This Repo)

```
Contributor
    |
    | Create/update markdown in content/
    ▼
Git Commit & Push
    |
    | Push to GitHub (main branch)
    ▼
GitHub Repository (waccamaw/dotorg)
    |
    | Webhook notification
    ▼
Micro.blog Platform
    |
    | Pull from GitHub
    | Run Hugo build
    ▼
Static HTML/CSS/JS Generated
    |
    | Deploy to CDN
    ▼
Micro.blog CDN
    |
    | Available at waccamaw.micro.blog
    ▼
Cloudflare Worker
    |
    | Proxy to waccamaw.org/updates/
    ▼
Live on waccamaw.org
```

## Development Environments

### Local Development (This Repo)

```bash
# Clone repository
git clone https://github.com/waccamaw/dotorg.git

# Install Hugo (if not installed)
# See: https://gohugo.io/installation/

# Run local server
just serve
# Or: hugo server --watch --bind="0.0.0.0" --port="1313"

# Access locally
# http://localhost:1313/
```

**Local URLs**:
- Development server: `http://localhost:1313/`
- Note: Local development doesn't simulate routing - test full paths on staging

### Staging/Testing

**Micro.blog Staging**:
- URL: `https://waccamaw.micro.blog/`
- Direct access to Micro.blog before Cloudflare routing
- Test content and builds here first

**Cloudflare Workers Testing**:
- Use Cloudflare Workers preview for routing changes
- Test with `wrangler dev` (Cloudflare CLI)

### Production

- **Production URL**: `https://waccamaw.org/updates/`
- **Origin**: `https://waccamaw.micro.blog/`
- **Routing**: Cloudflare Workers at edge
- **SSL**: Full (strict) via Cloudflare

## Security Considerations

### SSL/TLS

- **End-to-end encryption**: Cloudflare to origin (Full Strict mode)
- **HSTS**: Enabled with 6-month max age
- **TLS 1.3**: Enabled for modern clients
- **Certificate**: Auto-managed by Cloudflare

### DDoS Protection

- Cloudflare's built-in DDoS protection
- Rate limiting on Workers (if needed)
- Bot management (Cloudflare's bot detection)

### Content Security

- **Micro.blog**: Read-only access from CDN, write access via GitHub only
- **Git authentication**: GitHub's 2FA required for contributors
- **Member portal** (future): Authentication required, RBAC, audit logs

### DNS Security

- **DNSSEC**: Enabled on waccamaw.org
- **Cloudflare proxy**: Hides origin IP addresses
- **Access control**: Cloudflare dashboard access limited to tribal admins

## Performance Optimization

### Caching Strategy

**Cloudflare Page Rules**:
```
waccamaw.org/updates/static/*
  - Cache Level: Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year

waccamaw.org/updates/feed.*
  - Cache Level: Standard
  - Edge Cache TTL: 5 minutes

waccamaw.org/updates/*
  - Cache Level: Standard
  - Edge Cache TTL: 1 hour
```

### CDN & Edge

- **Cloudflare**: Global edge network (200+ locations)
- **Micro.blog**: Uses CDN for static assets
- **Framer**: Global CDN included
- **Worker**: Runs at edge, minimal latency

### Image Optimization

- **Cloudflare Polish**: Automatic image optimization
- **WebP conversion**: Automatic for supported browsers
- **Lazy loading**: Implemented in templates

## Monitoring & Analytics

### Tools

- **Cloudflare Analytics**: Traffic, performance, security metrics
- **Micro.blog Stats**: Post views, feed subscribers
- **Hugo build logs**: Via Micro.blog dashboard
- **Worker metrics**: Request count, errors, latency

### Key Metrics

- Page load time (target: < 2s)
- Time to First Byte (target: < 500ms)
- Cache hit ratio (target: > 85%)
- Worker execution time (target: < 50ms)

## Future Roadmap

### Phase 1: Current (Complete)
- [x] Micro.blog blog platform (`/updates/`)
- [x] Basic Cloudflare routing
- [x] Framer marketing site (`/home/`)
- [x] GitHub Copilot workflow

### Phase 2: Near Term (Next 3-6 months)
- [ ] Member portal (`/members/`) - Initial implementation
- [ ] Enhanced Cloudflare Workers routing
- [ ] Member authentication system
- [ ] Private document storage

### Phase 3: Medium Term (6-12 months)
- [ ] Tribal calendar integration
- [ ] Event registration system
- [ ] Member directory
- [ ] Email notifications

### Phase 4: Long Term (12+ months)
- [ ] Mobile app consideration
- [ ] Video/podcast hosting
- [ ] Advanced member features (voting, surveys)
- [ ] Integration with tribal management systems

## Architecture Decision Records

### ADR-001: Why Multi-Platform Architecture?

**Decision**: Use separate platforms for different use cases rather than single monolithic CMS.

**Rationale**:
- Each platform optimized for its purpose
- Easier for non-technical tribal members to contribute
- Lower costs (multiple free tiers vs. paid hosting)
- Flexibility to replace components independently
- Reduced vendor lock-in

**Alternatives Considered**:
- WordPress (expensive hosting, more complex)
- Single static site (less flexibility for marketing)
- Custom full-stack app (too complex, costly to maintain)

### ADR-002: Why Cloudflare Workers?

**Decision**: Use Cloudflare Workers for routing instead of reverse proxy or subdomain redirects.

**Rationale**:
- Edge computing = faster routing decisions
- Single domain (waccamaw.org) for SEO
- No server to maintain
- Free tier sufficient for our traffic
- Built-in security and DDoS protection

**Alternatives Considered**:
- Nginx reverse proxy (requires server management)
- Subdomain approach (SEO fragmentation)
- Client-side routing (poor for SEO, slower)

### ADR-003: Why Micro.blog for Updates?

**Decision**: Use Micro.blog's Hugo-based platform for blog/updates content.

**Rationale**:
- Git-based workflow (GitHub integration)
- Open source (Hugo templates we control)
- IndieWeb compatible (microformats, feeds)
- Free tier for our use case
- Easy for tribal members to contribute via GitHub

**Alternatives Considered**:
- Ghost (more expensive, less flexible)
- Medium (no ownership, ads, limited control)
- Self-hosted Hugo (requires server management, backups)

## Troubleshooting

### Common Issues

**Issue**: Changes not appearing on waccamaw.org/updates/

**Solutions**:
1. Check GitHub repository - commit pushed?
2. Check Micro.blog - did it sync from GitHub?
3. Check Cloudflare cache - purge cache if needed
4. Check Cloudflare Workers - is routing correct?

**Issue**: Cloudflare Worker not routing correctly

**Solutions**:
1. Check Worker script in Cloudflare dashboard
2. Verify route configuration (waccamaw.org/*)
3. Check worker logs for errors
4. Test with curl to see actual routing

**Issue**: SSL certificate errors

**Solutions**:
1. Verify Cloudflare SSL mode is "Full (strict)"
2. Check origin server has valid SSL
3. Verify Cloudflare proxy is enabled (orange cloud)

## Technical Contacts

- **DNS/Cloudflare**: Tribal admin access required
- **Micro.blog**: waccamawchief@gmail.com
- **GitHub**: Repository admins
- **Framer**: [Contact info for Framer admin]

## Related Documentation

- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - AI agent guidelines

---

**Last Updated**: November 18, 2025

**Document Owner**: Tribal Technology Team

**Review Schedule**: Quarterly or when architecture changes
