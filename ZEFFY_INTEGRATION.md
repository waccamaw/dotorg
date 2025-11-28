# Zeffy Integration Guide

## Overview

The membership fees page has been created and is ready for your Zeffy embed code. The page is fully styled and responsive across all devices.

## Page Location

- **URL**: https://waccamaw.org/membership-fees/
- **Template**: `/workspaces/waccamawdotorg/layouts/_default/membership-fees.html`
- **Content**: `/workspaces/waccamawdotorg/content/membership-fees.md`

## How to Add Your Zeffy Embed Code

### Option 1: iframe Embed (Recommended)

1. Go to your Zeffy campaign dashboard
2. Find the embed/share option for the "Membership Fees 2025-2026" campaign
3. Copy the iframe embed code
4. Open `/workspaces/waccamawdotorg/layouts/_default/membership-fees.html`
5. Replace the placeholder section (lines 19-24) with your Zeffy iframe:

**Replace this:**
```html
<div id="zeffyEmbed" class="zeffy-frame-wrapper">
    <p style="text-align: center; padding: 40px 20px; color: #666;">
        Please provide your Zeffy embed code to complete this integration.
    </p>
</div>
```

**With your Zeffy iframe:**
```html
<div id="zeffyEmbed" class="zeffy-frame-wrapper">
    <!-- Your Zeffy iframe code here -->
    <iframe src="https://www.zeffy.com/embed/..." 
            width="100%" 
            height="100%" 
            frameborder="0"
            allow="payment"></iframe>
</div>
```

### Option 2: JavaScript Widget

If Zeffy provides a JavaScript widget instead:

```html
<div id="zeffyEmbed" class="zeffy-frame-wrapper">
    <div id="zeffy-widget-container"></div>
    <script src="https://www.zeffy.com/widget.js"></script>
    <script>
        Zeffy.init({
            formId: 'YOUR_CAMPAIGN_ID',
            container: '#zeffy-widget-container'
        });
    </script>
</div>
```

## Integration Points Created

### 1. Member Portal Button
- Location: `/members/`
- The "Pay Membership Fees" card now links to `/membership-fees/`
- Changed from disabled/grayed out to active
- Shows "2025-2026" subtitle

### 2. Footer Link
- Added to the "Resources" section in site footer
- Visible on all pages of the site
- Allows non-members to access payment page directly

### 3. Dedicated Page
- Clean, distraction-free payment experience
- Responsive design (mobile, tablet, desktop)
- Matching site branding and colors
- Help contact information included
- Back link to member portal

## Analytics Tracking

The page is already set up with Google Analytics (GA4):

- **Page View**: Automatically tracked when users visit `/membership-fees/`
- **Campaign ID**: `d172d847-836e-43d1-a329-2be0f1728d95` (from your Zeffy URL)

You can track:
- How many people view the page
- Time on page
- Conversion rates (if Zeffy sends conversion events)

## Styling

All styles are in `/workspaces/waccamawdotorg/static/theme.css` under the "Zeffy Membership Fees Page" section:

- ✅ Mobile-first responsive design
- ✅ Matches existing site colors and branding
- ✅ Accessible and semantic HTML
- ✅ Smooth, professional appearance

## Testing Locally

1. Build the site:
   ```bash
   hugo
   ```

2. The page will be at:
   ```
   /workspaces/waccamawdotorg/public/membership-fees/index.html
   ```

3. Or serve with Hugo's built-in server:
   ```bash
   hugo server
   ```
   Then visit: http://localhost:1313/membership-fees/

## Deployment

Once you add your Zeffy embed code:

1. Commit the changes:
   ```bash
   git add layouts/_default/membership-fees.html
   git commit -m "Add Zeffy embed code for membership fees"
   git push
   ```

2. Micro.blog will automatically rebuild and deploy
3. Page will be live at https://waccamaw.org/membership-fees/

## Future: ID Card Replacement

A similar integration can be created for the "Replacement ID Card Process" campaign:

1. Create `/content/id-card-replacement.md`
2. Create `/layouts/_default/id-card-replacement.html` (copy membership-fees.html)
3. Update the "Order ID Card" button in member portal
4. Add Zeffy embed code for campaign `0a0bc696-f632-4977-9144-1df6e87f4b16`

## Support

If you need help with the Zeffy integration:
- Check Zeffy's documentation for embed code formats
- Test the embed code locally before deploying
- Verify iframe dimensions and responsive behavior
- Ensure the "allow" attribute includes payment permissions

## Clean Analytics Benefits

By using a separate page instead of a modal:

✅ **Clear Page Views**: Each visit to `/membership-fees/` is a distinct pageview
✅ **Better Conversion Tracking**: Can set up GA4 goals for this specific page
✅ **Zeffy Analytics**: Zeffy's own analytics will track engagement better
✅ **Shareable URL**: Can share direct link to payment page
✅ **No Auth Required**: Anyone can pay fees, not just logged-in members
