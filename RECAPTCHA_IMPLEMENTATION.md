# reCAPTCHA v3 Implementation for Contact Form

## Overview

This document describes the implementation of Google reCAPTCHA v3 for bot detection on the contact form at `waccamaw.org/contact`.

## Frontend Implementation (Completed)

### Changes Made

1. **Added reCAPTCHA v3 Script**
   - Location: `layouts/contact/single.html`
   - Site Key: `6LfVNqEqAAAAANiQOLXBCVxv4TZjzqY5d0d8dN8i`
   - Script loaded at top of page: `https://www.google.com/recaptcha/api.js?render=SITE_KEY`

2. **Modified Form Submission Handler**
   - Generates reCAPTCHA token before form submission
   - Action name: `submit`
   - Token included in POST payload as `recaptchaToken` field
   - Enhanced error handling for reCAPTCHA failures

3. **Added Privacy Notice**
   - Displays Google Privacy Policy and Terms of Service links
   - Positioned between newsletter checkbox and submit button
   - Mobile-responsive styling

4. **CSS Styling**
   - Added `.recaptcha-notice` class for privacy notice
   - Hides default reCAPTCHA badge (`.grecaptcha-badge`)
   - Mobile-responsive adjustments

### User Experience

- **Invisible to users**: reCAPTCHA v3 runs in background without user interaction
- **No challenges**: Unlike v2, users never solve puzzles or click checkboxes
- **Seamless**: Button shows "Verifying..." briefly then "Sending..."
- **Accessible**: Works on all devices and screen sizes

## Backend Implementation (Required)

The backend API at `contact.waccamaw.org` needs to be updated to verify the reCAPTCHA token.

### API Changes Required

**Location**: `member-services` repository (contact form API endpoint)

### 1. Accept reCAPTCHA Token

The contact form now sends an additional field in the POST body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(843) 555-1234",
  "category": "general",
  "message": "Hello...",
  "newsletter": true,
  "recaptchaToken": "03AGdBq24...",  // NEW FIELD
  "customFields": {}
}
```

### 2. Verify Token with Google

**Endpoint**: `https://www.google.com/recaptcha/api/siteverify`

**Method**: POST

**Parameters**:
- `secret`: Your reCAPTCHA secret key (keep this server-side only!)
- `response`: The `recaptchaToken` from the form submission
- `remoteip`: (Optional) User's IP address

**Example Verification Request**:

```javascript
const fetch = require('node-fetch'); // or use your HTTP library

async function verifyRecaptcha(token, remoteIp = null) {
  const secretKey = 'YOUR_SECRET_KEY_HERE'; // Store in environment variable!
  
  const params = new URLSearchParams({
    secret: secretKey,
    response: token,
  });
  
  if (remoteIp) {
    params.append('remoteip', remoteIp);
  }
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params,
  });
  
  const data = await response.json();
  return data;
}
```

**Example Response from Google**:

```json
{
  "success": true,
  "score": 0.9,              // Score from 0.0 (bot) to 1.0 (human)
  "action": "submit",        // Action name from frontend
  "challenge_ts": "2025-12-10T18:45:00Z",
  "hostname": "waccamaw.org"
}
```

### 3. Implement Score-Based Filtering

Recommended approach:

```javascript
async function handleContactForm(req, res) {
  const { recaptchaToken, ...formData } = req.body;
  
  // 1. Verify the token
  const verification = await verifyRecaptcha(recaptchaToken, req.ip);
  
  // 2. Check if verification succeeded
  if (!verification.success) {
    return res.status(400).json({
      success: false,
      error: 'Bot verification failed. Please try again.',
      errors: ['reCAPTCHA verification failed']
    });
  }
  
  // 3. Check the score (0.0 = bot, 1.0 = human)
  const MIN_SCORE = 0.5; // Adjust based on your needs
  
  if (verification.score < MIN_SCORE) {
    // Log this for monitoring
    console.warn('Low reCAPTCHA score:', {
      score: verification.score,
      email: formData.email,
      ip: req.ip
    });
    
    return res.status(400).json({
      success: false,
      error: 'Bot verification failed. If you are human, please try again or contact us directly.',
      errors: ['Low reCAPTCHA score']
    });
  }
  
  // 4. Score is good, process the form normally
  // ... existing form processing logic ...
}
```

### 4. Error Handling

Handle various failure scenarios:

```javascript
// No token provided
if (!recaptchaToken) {
  return res.status(400).json({
    success: false,
    error: 'Security verification missing. Please refresh and try again.',
    errors: ['Missing reCAPTCHA token']
  });
}

// Network error verifying with Google
try {
  const verification = await verifyRecaptcha(recaptchaToken, req.ip);
} catch (error) {
  console.error('reCAPTCHA verification error:', error);
  // Still allow submission with warning (fail-open)
  console.warn('Allowing submission due to reCAPTCHA service error');
  // ... continue with form processing ...
}

// Invalid token (expired, wrong site, etc.)
if (!verification.success) {
  return res.status(400).json({
    success: false,
    error: 'Security verification failed. Please refresh and try again.',
    errors: verification['error-codes'] || ['reCAPTCHA verification failed']
  });
}
```

### 5. Score Threshold Recommendations

| Score Range | Interpretation | Action |
|-------------|----------------|--------|
| 0.9 - 1.0   | Very likely human | Always accept |
| 0.7 - 0.9   | Likely human | Accept |
| 0.5 - 0.7   | Uncertain | Accept with caution |
| 0.3 - 0.5   | Likely bot | Reject or require additional verification |
| 0.0 - 0.3   | Very likely bot | Reject |

**Recommended starting threshold**: `0.5`

Adjust based on observed false positives/negatives.

## Configuration

### Environment Variables Needed

Add these to your backend environment:

```bash
# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_secret_key_here  # Get from Google reCAPTCHA admin
RECAPTCHA_MIN_SCORE=0.5                    # Minimum score to accept
```

### Getting Secret Key

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site (or create one if needed)
3. Copy the **Secret Key** (NOT the site key)
4. Store it securely in your environment variables
5. **Never commit secret key to git!**

## Testing

### Frontend Testing

1. Navigate to `http://localhost:1313/contact` (or production URL)
2. Fill out the contact form
3. Open browser DevTools Console
4. Submit the form
5. Verify in Network tab that POST request includes `recaptchaToken` field
6. Token should be a long string starting with characters/numbers

### Backend Testing

1. **Test with valid token**: Submit form normally, should succeed with score > 0.5
2. **Test with missing token**: Remove token from request, should fail gracefully
3. **Test with invalid token**: Send random string, should fail verification
4. **Test score threshold**: Temporarily lower threshold to 0.0, all submissions should work

### Monitoring

Log these metrics in production:

```javascript
// Successful submissions
console.log('[Contact Form] Submission accepted', {
  score: verification.score,
  email: formData.email,
  timestamp: new Date().toISOString()
});

// Rejected submissions
console.warn('[Contact Form] Submission rejected - low score', {
  score: verification.score,
  email: formData.email,
  ip: req.ip,
  timestamp: new Date().toISOString()
});
```

Review logs weekly to:
- Identify if legitimate users are being blocked (lower threshold)
- Check if bots are getting through (raise threshold)
- Monitor reCAPTCHA service availability

## Cloudflare Workers Consideration

If you're using Cloudflare Workers for routing (`apps/` directory in this repo), no changes are needed. The contact form API is already routed correctly to `contact.waccamaw.org`.

However, if you want to add additional bot protection at the edge:

```javascript
// In your Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Add rate limiting for contact form endpoint
  if (url.pathname === '/api/contact' && request.method === 'POST') {
    // Optional: Add Cloudflare Bot Management
    // const botScore = request.cf.botManagement.score
    // if (botScore < 30) {
    //   return new Response('Bot detected', { status: 403 })
    // }
  }
  
  // Continue with normal routing
  return fetch(request)
}
```

## Security Best Practices

1. **Keep secret key secure**: Store in environment variables, never commit to git
2. **Validate on backend**: Frontend validation is not sufficient
3. **Log suspicious activity**: Monitor low scores for patterns
4. **Rate limiting**: Combine with rate limiting for additional protection
5. **Fail gracefully**: If reCAPTCHA service is down, consider fail-open vs fail-closed
6. **Monitor scores**: Adjust threshold based on real-world data

## Costs

- **Google reCAPTCHA v3**: Free tier includes 1,000,000 assessments/month
- Expected usage: ~100-500 submissions/month
- Well within free tier limits

## Troubleshooting

### "reCAPTCHA verification failed"

- **Cause**: Token expired (valid for 2 minutes)
- **Solution**: Generate fresh token on each submission (already implemented)

### "Low reCAPTCHA score" in logs

- **Cause**: Legitimate user might have browser extensions, VPN, or unusual behavior
- **Solution**: Lower threshold to 0.4 or implement secondary verification

### reCAPTCHA service unavailable

- **Cause**: Network issues or Google service outage
- **Solution**: Implement fail-open (allow submission) or fail-closed (reject) based on risk tolerance

### Token not included in request

- **Cause**: JavaScript error on frontend or old cached page
- **Solution**: Check browser console, clear cache, refresh page

## Future Enhancements

1. **Analytics Dashboard**: Track submission scores over time
2. **Adaptive Thresholds**: Automatically adjust based on detected patterns
3. **Secondary Verification**: For borderline scores (0.4-0.6), require email verification
4. **Honeypot Fields**: Add hidden fields as additional bot detection
5. **CAPTCHA Fallback**: For very low scores, show reCAPTCHA v2 checkbox challenge

## Support

- **Google reCAPTCHA Documentation**: https://developers.google.com/recaptcha/docs/v3
- **API Reference**: https://developers.google.com/recaptcha/docs/verify
- **Admin Console**: https://www.google.com/recaptcha/admin

## References

- Frontend implementation: `layouts/contact/single.html`
- Backend API: `member-services` repository (to be updated)
- Architecture docs: `ARCHITECTURE.md`
- Issue: #[issue_number] - Bot Detection on Contact Us Form
