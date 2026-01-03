# Email Template Preview Feature

## Overview

The Member Engagement Dashboard now includes an email template preview feature that allows executive leadership to view how automated reminder emails will appear before they are sent to members.

## Location

The preview buttons are located on the Member Engagement Dashboard page:
- Navigate to: http://localhost:1313/members/
- Log in with your member email
- Click "Member Engagement Dashboard" (executive leadership only)
- Scroll to the "📧 Email Template Previews" section

## Available Templates

Three email templates can be previewed:

### 1. 📧 Inactive Member Email
- **Audience**: Members with "Inactive" status
- **Purpose**: Re-engagement for lapsed memberships
- **Content**: 
  - Welcomes member back
  - Explains inactive status
  - Provides renewal instructions
  - Highlights business rules (payment arrangements, ID renewal, age requirements)

### 2. ⚠️ Critical (<30 Days) Email
- **Audience**: Active members expiring within 30 days
- **Purpose**: Urgent renewal reminder
- **Content**:
  - Countdown to expiration
  - Critical timing alert
  - Payment instructions
  - Business rules for renewal

### 3. 📋 Warning (30-90 Days) Email
- **Audience**: Active members expiring in 30-90 days
- **Purpose**: Early renewal reminder
- **Content**:
  - Friendly advance notice
  - Time remaining
  - Renewal instructions
  - Business rules information

## How to Use

1. **Access the Dashboard**
   - Visit http://localhost:1313/members/
   - Log in as an executive leadership member
   - Click "Member Engagement Dashboard"

2. **View Templates**
   - Scroll to the "Email Template Previews" section
   - Click any of the three preview buttons
   - A modal window will open displaying the email template

3. **Preview Features**
   - Templates are populated with sample data
   - See exact formatting as members will receive
   - Review business rules and instructions
   - Check links and contact information

4. **Close Preview**
   - Click the "×" button in the top right
   - Or click "Close" button at the bottom
   - Or click outside the modal

## Template Locations

Email templates are stored in two locations:

1. **Source Templates** (for editing and styling):
   ```
   static/members/email-templates/
   ├── reminder-inactive.html
   ├── reminder-inactive.txt
   ├── reminder-at-risk-critical.html
   ├── reminder-at-risk-critical.txt
   ├── reminder-at-risk-warning.html
   └── reminder-at-risk-warning.txt
   ```

2. **Deployment Templates** (synced from source):
   ```
   apps/members-service/src/templates/
   ├── reminder-inactive.html
   ├── reminder-inactive.txt
   ├── reminder-at-risk-critical.html
   ├── reminder-at-risk-critical.txt
   ├── reminder-at-risk-warning.html
   └── reminder-at-risk-warning.txt
   ```

## Updating Templates

### Source of Truth

Email templates in `static/members/email-templates/` are the **source of truth** for styling and content. They are automatically synced to `apps/members-service/src/templates/` for deployment.

### Automatic Sync

Templates are automatically synced when you attach/reopen the dev container. A file watcher runs in the background and automatically syncs any changes you make.

### Manual Sync

To manually sync templates after editing:

```bash
just email-templates
```

Or from the apps directory:

```bash
cd apps && just sync-email-templates
```

### Watch Mode

The watch mode is automatically started in the background when you attach to the dev container. To start it manually:

```bash
just watch-email-templates
```

This watches `static/members/email-templates/` and automatically syncs changes to `apps/members-service/src/templates/`.

### Going Live

**Important:** Changes to email templates must be committed to git and deployed to take effect in production. The sync only updates the local members-service copy for development/deployment.

## Technical Implementation

### Components

1. **Modal HTML** (`layouts/members/single.html`):
   - Email template modal structure
   - Iframe for rendering emails
   - Close buttons

2. **JavaScript** (`static/js/members-app.js`):
   - `showEmailTemplate(type)` - Load and display template
   - `populateTemplateVariables(html, type)` - Fill sample data
   - `closeEmailTemplateModal()` - Close preview
   - `addTemplatePreviewSection()` - Inject preview buttons
   - Event listeners for button clicks

3. **CSS** (`static/members/css/styles.css`):
   - Modal styling (already existing)
   - Button layout
   - Responsive design

### Sample Data

Templates are populated with realistic sample data:
- **Name**: John Doe
- **Email**: john.doe@example.com
- **Expires**: 15 days from now (critical) or 45 days (warning)
- **Days Until Expiry**: 15 or 45
- **Status**: Inactive or Active
- **Last Payment**: 1 year ago

### Security

- Preview feature only available to executive leadership
- Templates served from static directory (no API calls)
- Iframe sandboxing for security
- No actual member data exposed

## Troubleshooting

### Preview buttons not showing
- Ensure you have executive leadership access
- Check browser console for JavaScript errors
- Verify template files exist in `static/members/email-templates/`

### Template not loading
- Check browser console for 404 errors
- Verify template files are copied to static directory
- Ensure Hugo server is running on port 1313

### Styling looks wrong
- Templates use inline styles (email-safe)
- Iframe may need to load fully
- Try refreshing the preview

## Future Enhancements

Possible improvements for future versions:
- Live preview with actual member data
- Side-by-side comparison of templates
- Export templates as PDF
- Test email sending to yourself
- Template editing interface
- Variable highlighting
- Mobile preview mode
