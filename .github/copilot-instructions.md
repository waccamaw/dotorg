# GitHub Copilot Agent Instructions

## CRITICAL RULES - READ FIRST

1. **Hugo server is ALREADY RUNNING on port 1313** - NEVER start additional servers
2. **Members portal is at `/members/` directory** - served by Hugo at http://localhost:1313/members/
3. **Stay focused** - Answer the user's actual question without overcomplicating
4. **Don't test unless asked** - Make the change, trust the code
5. **Members portal uses vanilla JS** - Not part of Hugo build, just static HTML/CSS/JS files

## Project Overview

This repository powers the **Waccamaw Indian People's official website** at waccamaw.org/updates/. The Waccamaw are South Carolina's first state-recognized tribe (recognized in 2005), based in the Dog Bluff community near Aynor, SC.

### Multi-Platform Architecture

This repository is **one component** of a larger multi-platform website:

```
waccamaw.org
├── /home/      → Framer (marketing site)          [External]
├── /updates/   → Micro.blog (this repository)     [You are here]
└── /members/   → Future microservice (planned)    [Future]
```

**Cloudflare Workers** handles intelligent routing between platforms. See ARCHITECTURE.md in the repository root for complete details.

### This Repository's Role

- **Path**: waccamaw.org/updates/
- **Platform**: Micro.blog (Hugo-based)
- **Content**: Blog posts, news, tribal meeting notes, photo galleries
- **Source Control**: GitHub (auto-syncs to Micro.blog)
- **Contributors**: Tribal members and family (varying technical skill)

## Technology Stack

- **Static Site Generator**: Hugo (Go-based)
- **Platform**: Micro.blog (micro.blog)
- **Templating**: Go HTML templates
- **Configuration**: JSON (config.json)
- **Routing**: Cloudflare Workers (external to this repo)
- **DNS**: Cloudflare DNS
- **Version Control**: Git/GitHub
- **Deployment**: Auto-deploy from GitHub main branch

## Repository Structure

```
dotorg/
├── .github/
│   ├── copilot-instructions.md    # This file - agent guidelines
│   ├── pull_request_template.md   # PR template (requires screenshots)
│   └── ISSUE_TEMPLATE/            # Issue templates (bug, feature, content, docs)
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
│   └── logos/                     # Tribal logos
│       └── doug-2025/             # Current logo set
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

## Pull Request Requirements

Every PR **MUST** include:

- [ ] **Desktop screenshot** (1920x1080 or 1440x900)
- [ ] **Mobile screenshot** (iPhone 12 Pro 390x844 or similar)
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
- **`/members/`** → Future microservice (not yet implemented)

**Cloudflare Workers** routes requests between these platforms at the edge.

### What This Means for Changes

1. **Scope**: Only make changes relevant to `/updates/` content
2. **Routing**: Don't attempt to handle routing in this repo (handled by Cloudflare Workers)
3. **Links**: Be aware of cross-platform linking considerations
4. **Content**: Blog posts, news, meetings, photos belong here

### When to Reference Architecture

- Adding navigation links between platforms
- Implementing redirects or URL changes
- Planning new features that might span platforms
- Troubleshooting routing issues

See `ARCHITECTURE.md` for complete technical details on DNS, Cloudflare Workers, and platform integration.

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
- **Tablet**: 820x1180 (iPad)
- **Mobile**: 390x844 (iPhone 12 Pro), 360x800 (Android)

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

## Best Practices

### Do's ✅

- **Always test locally** with `just serve`
- **Include screenshots** in every PR (desktop + mobile)
- **Preserve microformats** in templates
- **Use semantic HTML**
- **Keep commits atomic** and focused
- **Update documentation** when needed
- **Ask Copilot** when unsure
- **Link to issues** in PRs

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

**Last Updated**: November 18, 2025

**This file should be updated** whenever:
- Architecture changes
- New coding standards are adopted
- Deployment process changes
- Common issues are identified
- New features affect workflow
