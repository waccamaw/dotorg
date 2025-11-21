# Member Portal Deployment Guide

Quick deployment instructions for the Waccamaw Member Portal frontend.

## Prerequisites

- [ ] Backend API (member-services) deployed and running
- [ ] API URL configured in production
- [ ] Static hosting platform account (Cloudflare Pages, Netlify, or similar)

## Pre-Deployment Checklist

### 1. Update API Configuration

Edit `members/assets/js/config.js`:

```javascript
API_BASE_URL: 'https://api.waccamaw.org/api',  // Production API URL
```

**Important**: Never commit API keys or secrets to the repository!

### 2. Test Locally

```bash
cd members/
python3 -m http.server 8080
```

Visit `http://localhost:8080` and verify:
- [ ] Login works
- [ ] Registration works
- [ ] Dashboard loads
- [ ] API calls succeed
- [ ] Mobile responsive design works

### 3. Verify Backend API

Ensure your backend API is:
- [ ] Deployed and accessible
- [ ] CORS configured for your frontend domain
- [ ] SSL/HTTPS enabled
- [ ] All endpoints working

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

**Advantages**: Fast CDN, free tier, easy integration with Cloudflare Workers

#### Via GitHub (Automatic)

1. **Connect Repository**
   - Log in to Cloudflare Dashboard
   - Pages → Create a project
   - Connect to GitHub → Select repository
   
2. **Configure Build**
   ```
   Build command: (leave empty)
   Build output directory: members/
   Root directory: /
   ```

3. **Environment Variables**
   ```
   API_BASE_URL=https://api.waccamaw.org/api
   ```
   
4. **Deploy**
   - Save and deploy
   - Auto-deploys on push to main branch

#### Via Wrangler CLI (Manual)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages publish members/ --project-name=waccamaw-members
```

**Custom Domain**:
- Pages → waccamaw-members → Custom domains
- Add `members.waccamaw.org`

### Option 2: Netlify

**Advantages**: Simple deployment, good free tier, built-in form handling

#### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd members/
netlify deploy --prod
```

#### Via Git (Automatic)

1. **Create `netlify.toml`** in repository root:
   ```toml
   [build]
     publish = "members/"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     API_BASE_URL = "https://api.waccamaw.org/api"
   ```

2. **Connect Repository**
   - Log in to Netlify
   - New site from Git
   - Select repository
   - Deploy

**Custom Domain**:
- Site settings → Domain management
- Add custom domain: `members.waccamaw.org`

### Option 3: GitHub Pages

**Advantages**: Free, simple, integrated with GitHub

#### Setup

1. **Configure GitHub Pages**
   - Repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `members/`
   
2. **Access**
   - Site available at: `https://waccamaw.github.io/dotorg/members/`

3. **Custom Domain** (Optional)
   - Add CNAME record: `members.waccamaw.org → waccamaw.github.io`
   - Settings → Pages → Custom domain → `members.waccamaw.org`

**Note**: GitHub Pages doesn't support environment variables, so API URL must be hardcoded.

### Option 4: Vercel

**Advantages**: Fast deployment, good developer experience

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd members/
vercel --prod
```

**Environment Variables**:
- Dashboard → Project → Settings → Environment Variables
- Add: `API_BASE_URL=https://api.waccamaw.org/api`

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:
- [ ] Site loads correctly
- [ ] All assets load (CSS, JS)
- [ ] No console errors
- [ ] Login/registration works
- [ ] API calls succeed
- [ ] Mobile responsive

### 2. Test on Multiple Devices

- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet

### 3. Configure DNS (if using custom domain)

Add DNS records in Cloudflare:

```
Type   Name     Value                        Proxy
CNAME  members  waccamaw-members.pages.dev   Proxied (orange)
```

Or for Netlify:

```
Type   Name     Value                        
CNAME  members  waccamaw-members.netlify.app
```

### 4. Update Cloudflare Workers

Update your routing worker to include member portal:

```javascript
// Route /members/ to member portal
if (path.startsWith('/members/')) {
  return fetch('https://members.waccamaw.org' + path, {
    headers: request.headers
  })
}
```

### 5. SSL Certificate

Ensure SSL is properly configured:
- [ ] HTTPS enforced
- [ ] Valid SSL certificate
- [ ] No mixed content warnings

## Environment-Specific Configuration

### Development
```javascript
API_BASE_URL: 'http://localhost:3000/api'
```

### Staging
```javascript
API_BASE_URL: 'https://staging-api.waccamaw.org/api'
```

### Production
```javascript
API_BASE_URL: 'https://api.waccamaw.org/api'
```

## CORS Configuration

Your backend API must allow requests from your frontend domain.

**Express.js example**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:8080',           // Local development
    'https://members.waccamaw.org',    // Production
    'https://waccamaw-members.pages.dev' // Cloudflare Pages
  ],
  credentials: true
}));
```

## Monitoring & Analytics

### Enable Analytics

**Cloudflare Web Analytics**:
- Dashboard → Analytics → Web Analytics
- Add site beacon to `index.html` (optional)

**Google Analytics** (if desired):
Add to `<head>` in `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Consider adding error tracking:
- **Sentry**: Free tier available
- **LogRocket**: Session replay and errors
- **Rollbar**: Error monitoring

## Troubleshooting

### Site Not Loading

1. Check deployment logs
2. Verify build output directory is correct
3. Check all file paths are correct
4. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)

### CORS Errors

1. Verify backend CORS configuration includes frontend domain
2. Check API URL is correct (https, not http)
3. Ensure credentials are allowed in CORS config

### Authentication Not Working

1. Check API_BASE_URL is correct
2. Verify backend API is running
3. Check browser console for errors
4. Clear localStorage and try again
5. Verify JWT token generation works on backend

### Assets Not Loading (404)

1. Check file paths in `index.html`
2. Verify build output directory
3. Check deployment logs for errors
4. Ensure all files are committed to Git

## Rollback Procedure

### Cloudflare Pages
- Deployments → Select previous deployment → Rollback

### Netlify
- Deploys → Select previous deploy → Publish deploy

### GitHub Pages
```bash
git revert HEAD
git push origin main
```

## Performance Optimization

### After Deployment

1. **Check Lighthouse Score**
   - Chrome DevTools → Lighthouse
   - Target: 90+ for Performance, Accessibility, Best Practices

2. **Enable Compression**
   - Cloudflare automatically handles this
   - Netlify/Vercel also enable by default

3. **Cache Headers**
   - Static assets should have long cache times
   - HTML should have short cache times

4. **CDN Benefits**
   - All platforms provide global CDN
   - Content served from edge locations
   - Fast load times worldwide

## Security Checklist

- [ ] HTTPS enforced (no HTTP access)
- [ ] Content Security Policy headers (optional)
- [ ] X-Frame-Options set
- [ ] No API keys in frontend code
- [ ] CORS properly configured
- [ ] JWT tokens stored securely (localStorage)
- [ ] Input validation on forms

## Maintenance

### Regular Updates

1. **Monthly**: Check for security updates
2. **Quarterly**: Review analytics and user feedback
3. **As Needed**: Update content, fix bugs, add features

### Monitoring

- Monitor uptime (use UptimeRobot or similar)
- Check error rates
- Review user feedback
- Test functionality monthly

## Support

**Issues**: Create GitHub issue in repository
**Email**: waccamawchief@gmail.com
**Documentation**: See `members/README.md`

---

**Last Updated**: November 20, 2025
