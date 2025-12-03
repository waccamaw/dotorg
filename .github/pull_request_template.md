## Description

<!-- Provide a clear and concise description of your changes -->

## Related Issue

<!-- Link to the issue this PR addresses -->
Fixes #

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 📝 Content update (blog post, tribal information, meeting notes)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💄 Style/UI update (changes to appearance or layout)
- [ ] 📚 Documentation update
- [ ] 🏗️ Template/layout change (Hugo template modifications)
- [ ] ⚙️ Configuration change

## Changes Made

<!-- List the specific changes you made -->

- 
- 
- 

## Testing Checklist

<!-- Mark all items you have tested with an 'x' -->

### Desktop Testing
- [ ] Tested on Chrome (1920x1080 or 1440x900)
- [ ] Tested on Firefox
- [ ] Tested on Safari (Mac only)
- [ ] No console errors
- [ ] All links work correctly
- [ ] All images load correctly
- [ ] Text is readable and properly formatted

### Tablet Testing (iPad Pro M4)
- [ ] Tested on Safari (1366x1024 landscape)
- [ ] Tested on Safari (1024x1366 portrait)
- [ ] Touch targets adequate (44x44px minimum)
- [ ] No horizontal scrolling issues
- [ ] Navigation works on touch
- [ ] Text is readable without zoom
- [ ] Images scale appropriately

### Mobile Testing (iPhone 17 Pro)
- [ ] Tested on Safari (402x874)
- [ ] No horizontal scrolling issues
- [ ] Text is readable without zoom
- [ ] All interactive elements work
- [ ] Images scale appropriately

### Content/Code Quality
- [ ] Hugo builds without errors (`just serve`)
- [ ] No broken links or images
- [ ] Markdown formatted correctly
- [ ] Follows existing code style (tabs for indentation)
- [ ] Microformats preserved (if editing templates)
- [ ] Responsive on all screen sizes
- [ ] Accessible (proper heading hierarchy, alt text, etc.)

## ⚠️ Template Changes Danger Zone

<!-- ONLY fill out this section if you modified layouts/, static/theme.css, or config.json -->
<!-- If this is a content-only change, skip this section -->

### Template Change Checklist

- [ ] **Not applicable** - This PR does not modify templates, CSS, or config
- [ ] I have read [`.github/MICROBLOG_QUIRKS.md`](.github/MICROBLOG_QUIRKS.md)
- [ ] I tested with 0 posts (empty blog)
- [ ] I tested with 1 post (single item)
- [ ] I tested with 50+ posts (full blog)
- [ ] I verified no infinite loops in `range` statements
- [ ] I preserved all microformats (h-entry, h-feed, p-name, dt-published, e-content, u-url)
- [ ] I validated RSS feed at https://validator.w3.org/feed/
- [ ] I validated JSON feed
- [ ] I checked with https://indiewebify.me/ that microformats still work
- [ ] I have a rollback plan if this breaks production

### Files Modified in `layouts/`, `static/`, or `config.json`

<!-- List specific template files you changed -->

- `layouts/path/to/file.html` - Brief description of change
- `static/theme.css` - Brief description of change

### Breaking Change Assessment

- [ ] **No breaking changes** - Pure visual/CSS update only
- [ ] **Possible breaking change** - Modified template structure
- [ ] **Definite breaking change** - Changed feeds, microformats, or core layouts

<!-- If breaking change, explain mitigation strategy: -->

## Screenshots

<!-- REQUIRED: Include desktop, tablet, AND mobile screenshots -->

### Desktop View

<!-- Drag and drop desktop screenshot here -->
<!-- Recommended size: 1920x1080 or 1440x900 -->

**Desktop screenshot required** (drag image here)

### Tablet View (iPad Pro M4)

<!-- Drag and drop tablet screenshot here -->
<!-- iPad Pro M4: 1366x1024 landscape or 1024x1366 portrait -->
<!-- Use Safari DevTools or actual device -->

**Tablet screenshot required** (drag image here)

### Mobile View (iPhone 17 Pro)

<!-- Drag and drop mobile screenshot here -->
<!-- iPhone 17 Pro: 402x874 -->
<!-- Use Safari DevTools or actual device -->

**Mobile screenshot required** (drag image here)

### Additional Screenshots (if applicable)

<!-- Add before/after screenshots for bug fixes -->
<!-- Add multiple views if changes affect multiple pages -->

## Architecture Considerations

<!-- Does this change affect routing or integration with other platforms? -->

- [ ] This change is for `/updates` path only (Micro.blog - this repo)
- [ ] This change affects routing (needs Cloudflare Workers update)
- [ ] This change impacts integration with `/home` (Framer)
- [ ] This change impacts integration with `/members` (future)
- [ ] No architectural impact

<!-- See ARCHITECTURE.md for details on our multi-platform setup -->

## Deployment Notes

<!-- Any special considerations for deployment? -->

- [ ] No special deployment steps needed
- [ ] Requires Micro.blog republish
- [ ] Requires Cloudflare Workers update
- [ ] Requires DNS changes
- [ ] Other (explain below):

<!-- If you checked anything other than "No special deployment steps", explain: -->

## Documentation Updates

<!-- Did you update relevant documentation? -->

- [ ] README.md updated (if needed)
- [ ] CONTRIBUTING.md updated (if needed)
- [ ] ARCHITECTURE.md updated (if needed)
- [ ] DEPLOYMENT.md updated (if needed)
- [ ] Inline code comments added (if needed)
- [ ] No documentation updates needed

## Accessibility

<!-- For UI/template changes, confirm accessibility -->

- [ ] Images have alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Color contrast is sufficient
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Not applicable (content-only change)

## Additional Notes

<!-- Any other context, concerns, or information for reviewers? -->

---

## For Reviewers

### Review Checklist

- [ ] Screenshots show expected changes
- [ ] Code follows repository standards
- [ ] Hugo template syntax is correct
- [ ] Microformats are preserved
- [ ] Mobile responsive design maintained
- [ ] No security concerns
- [ ] Documentation is adequate
- [ ] Ready to merge

### Reviewer Notes

<!-- Reviewers: Add your feedback here -->
