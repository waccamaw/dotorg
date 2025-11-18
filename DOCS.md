# Documentation Summary

This file provides a quick reference to all documentation in this repository.

## 📚 Documentation Index

### For Contributors

1. **[README.md](./README.md)**
   - Project overview and quick start
   - Technology stack
   - Available commands
   - Contact information

2. **[CONTRIBUTING.md](./CONTRIBUTING.md)**
   - Complete GitHub Copilot workflow
   - Step-by-step contribution guide
   - Pull request requirements
   - Code standards and best practices
   - Common tasks and examples

3. **[Issue Templates](./.github/ISSUE_TEMPLATE/)**
   - Bug reports
   - Feature requests
   - Content updates
   - Documentation improvements

### For Developers

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Multi-platform architecture explanation
   - DNS and Cloudflare Workers routing
   - Platform components (/home, /updates, /members)
   - Data flow and deployment architecture
   - Security considerations
   - Architecture decision records (ADRs)

5. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Deployment workflows
   - Content, template, and infrastructure deployment
   - Rollback procedures
   - Monitoring and verification
   - Troubleshooting guide

6. **[Copilot Instructions](./.github/copilot-instructions.md)**
   - Guidelines for GitHub Copilot agent
   - Repository structure
   - Coding standards
   - Testing requirements
   - Microformats reference

### Templates

7. **[Pull Request Template](./.github/pull_request_template.md)**
   - Required sections (description, screenshots, testing)
   - Desktop and mobile screenshot requirements
   - Architecture considerations
   - Deployment notes checklist

## 🎯 Quick Start Guides

### I want to add a blog post
→ See [CONTRIBUTING.md → Common Tasks → Add a Blog Post](./CONTRIBUTING.md#add-a-blog-post)

### I want to update tribal information
→ See [CONTRIBUTING.md → Common Tasks → Update Tribal Information](./CONTRIBUTING.md#update-tribal-information)

### I want to fix a bug
→ See [CONTRIBUTING.md → Example 2: Fixing Mobile Bug](./CONTRIBUTING.md#example-2-fixing-mobile-bug)

### I want to modify the design
→ See [CONTRIBUTING.md → Common Tasks → Modify Layout/Design](./CONTRIBUTING.md#modify-layoutdesign)

### I need to understand the architecture
→ See [ARCHITECTURE.md](./ARCHITECTURE.md)

### I need to deploy changes
→ See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤖 GitHub Copilot Integration

This repository is designed for **GitHub Copilot-assisted development**:

### For Contributors
- Create an issue using templates
- Ask Copilot for help: "How do I add a blog post?"
- Let Copilot guide you through changes
- Submit PR with required screenshots

### For the Copilot Agent
- Read `.github/copilot-instructions.md` for complete context
- Understand multi-platform architecture
- Preserve microformats and coding standards
- Guide contributors through testing and documentation

## 📋 Key Concepts

### Multi-Platform Architecture

```
waccamaw.org
├── /home/      → Framer (marketing site)
├── /updates/   → Micro.blog (this repository - blog/news)
└── /members/   → Future microservice (member portal)
```

**Routing**: Cloudflare Workers handles intelligent path-based routing

**This Repository**: Only handles `/updates/` content (blog, news, meetings, photos)

### Required for Every PR

✅ **Desktop screenshot** (1920x1080 or 1440x900)
✅ **Mobile screenshot** (iPhone 12 Pro 390x844)
✅ **Description** of changes
✅ **Link** to related issue
✅ **Testing** checklist completed

### Important Constraints

❌ **Never modify** `config.json` placeholder values (e.g., `[USERNAME]`)
❌ **Never commit** directly to `main` branch
❌ **Never break** microformats (h-entry, h-feed, etc.)
❌ **Never skip** mobile testing

## 🔧 Technology Stack

- **Static Generator**: Hugo
- **Platform**: Micro.blog
- **Templating**: Go HTML templates
- **Routing**: Cloudflare Workers
- **DNS**: Cloudflare
- **Source Control**: GitHub
- **Deployment**: Auto-deploy from main branch

## 📱 Testing Requirements

### Screen Sizes
- **Desktop**: 1920x1080, 1440x900
- **Tablet**: 820x1180 (iPad)
- **Mobile**: 390x844 (iPhone 12 Pro), 360x800 (Android)

### Checklist
- [ ] Works on desktop Chrome
- [ ] Works on mobile simulation
- [ ] No console errors
- [ ] All links functional
- [ ] Images load correctly
- [ ] Responsive design maintained
- [ ] Microformats preserved (templates only)

## 🚀 Deployment Flow

```
1. Create feature branch
2. Make changes locally
3. Test with `just serve`
4. Take screenshots (desktop + mobile)
5. Commit and push
6. Create PR with template
7. Review and approval
8. Merge to main
9. Auto-deploy (~5 minutes)
10. Verify on production
```

## 📞 Getting Help

### In Order of Preference:

1. **Ask GitHub Copilot** - "How do I...?"
2. **Search documentation** - Use this summary to find the right doc
3. **Create an issue** - Use issue templates
4. **Contact maintainers** - Tag in PR comments
5. **Email tribal leadership** - WaccamawChief@gmail.com

## 🔗 External Resources

### Hugo
- [Hugo Docs](https://gohugo.io/documentation/)
- [Hugo Templates](https://gohugo.io/templates/)

### Micro.blog
- [Micro.blog Help](https://help.micro.blog/)
- [GitHub Integration](https://help.micro.blog/t/github-pages/53)

### IndieWeb
- [Microformats](http://microformats.org/)
- [h-entry Specification](http://microformats.org/wiki/h-entry)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [GitHub Copilot](https://github.com/features/copilot)
- [Just Command Runner](https://github.com/casey/just)

## 📊 Documentation Maintenance

### When to Update

- **Architecture changes** → Update ARCHITECTURE.md
- **Deployment process changes** → Update DEPLOYMENT.md
- **Contributor workflow changes** → Update CONTRIBUTING.md
- **New features** → Update README.md
- **Copilot behavior adjustments** → Update .github/copilot-instructions.md

### Documentation Standards

- Clear, concise language
- Include examples and code snippets
- Add diagrams where helpful
- Link between related docs
- Keep current and accurate

## 🎓 Learning Path

### For New Contributors

1. Read [README.md](./README.md) - Understand the project
2. Read [CONTRIBUTING.md](./CONTRIBUTING.md) - Learn the workflow
3. Set up local environment
4. Try a simple content update
5. Graduate to template changes

### For Developers

1. Start with contributor path (above)
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
3. Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Learn deployment
4. Review [.github/copilot-instructions.md](./.github/copilot-instructions.md)
5. Contribute to infrastructure

## ✨ Recognition

All contributors are:
- Listed in GitHub insights
- Mentioned in release notes
- Acknowledged in tribal communications

Thank you for helping preserve and share Waccamaw heritage online! 🪶

---

**Last Updated**: November 18, 2025

**Maintained By**: Waccamaw Technology Team
