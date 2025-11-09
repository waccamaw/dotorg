# Repository Copilot Instructions

## Project Overview
This is a custom Hugo theme/template repository for Micro.blog. It provides layouts, partials, and configuration for a personal blog on the Micro.blog platform.

## Technology Stack
- **Static Site Generator**: Hugo
- **Platform**: Micro.blog
- **Templating**: Go HTML templates
- **Configuration**: JSON (config.json)

## Project Structure
```
.
├── config.json           # Hugo configuration with Micro.blog-specific settings
├── layouts/              # Hugo template files
│   ├── _default/        # Default layouts (baseof, lists, archives, photos)
│   ├── partials/        # Reusable template components (header, footer, head)
│   ├── redirect/        # Redirect layouts
│   └── *.xml/html       # Output format templates (RSS, JSON, RSD, podcasts)
└── LICENSE              # Project license
```

## Coding Standards

### Template Files
- Use Hugo's Go template syntax consistently
- Follow existing indentation and spacing patterns (tabs for indentation)
- Include proper HTML semantics and microformats (h-entry, h-feed, p-name, dt-published, etc.)
- Preserve existing template structure and partials

### Configuration
- The `config.json` uses placeholder values in brackets (e.g., `[TITLE]`, `[USERNAME]`)
- These placeholders are replaced by Micro.blog when the template is deployed
- Do not replace or hardcode these placeholder values

### Output Formats
The repository supports multiple output formats:
- HTML (standard pages)
- RSS and JSON feeds
- RSD (Really Simple Discovery) for blog clients
- Archive and Photos JSON feeds
- Podcast XML and JSON feeds

## Making Changes

### Template Modifications
- When modifying layouts, maintain consistency with Hugo best practices
- Test template changes with sample Hugo content if possible
- Preserve microformats and semantic HTML structure
- Keep mobile-responsive design considerations

### Style Guidelines
- Inline CSS is used in some templates (e.g., photos grid)
- Maintain existing CSS patterns and naming conventions
- Do not introduce external dependencies without discussion

### Git Workflow
- Keep commits focused and atomic
- Use descriptive commit messages
- Do not commit `.DS_Store` or other system files (see `.gitignore`)

## Testing
- This is a template repository, so traditional unit tests don't apply
- Manual testing should be done by:
  1. Using Hugo to build a test site with this theme
  2. Verifying all layout files render correctly
  3. Checking RSS/JSON feeds are valid
  4. Testing responsive layout on different screen sizes

## Documentation
- When adding new layouts or partials, document their purpose
- Update this file if significant structural changes are made
- Maintain backward compatibility with existing Micro.blog installations

## Notes for Copilot
- This repository contains Hugo templates for Micro.blog
- Do not modify placeholder values in `config.json` (values in brackets like `[USERNAME]`)
- Preserve microformats (h-entry, h-feed, etc.) in templates as they're used by Micro.blog
- When making changes, ensure compatibility with Hugo's templating system
- No build process or package manager is required for this repository
