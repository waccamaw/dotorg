# Member Portal - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### 1. Configure API Endpoint

Edit `assets/js/config.js`, line 3:
```javascript
API_BASE_URL: 'http://localhost:3000/api',  // Change to your API URL
```

### 2. Start Local Server

```bash
cd members/
python3 -m http.server 8080
```

### 3. Open in Browser

```
http://localhost:8080
```

---

## 📁 File Structure

```
members/
├── index.html                 # Main HTML page
├── assets/
│   ├── css/
│   │   └── styles.css        # All styles
│   └── js/
│       ├── config.js         # ⚙️  Configuration (API URL)
│       ├── api.js            # 🔌 API client
│       ├── auth.js           # 🔐 Authentication
│       └── app.js            # 🎯 Main app logic
├── .env.example              # Environment config template
├── .gitignore                # Git ignore rules
└── README.md                 # Full documentation
```

---

## 🔧 Common Tasks

### Change API URL
**File**: `assets/js/config.js`
```javascript
API_BASE_URL: 'https://api.waccamaw.org/api'
```

### Add New API Endpoint
**File**: `assets/js/config.js`
```javascript
ENDPOINTS: {
    NEW_ENDPOINT: '/new-endpoint'
}
```

**File**: `assets/js/api.js`
```javascript
async getNewData() {
    return this.get(CONFIG.ENDPOINTS.NEW_ENDPOINT);
}
```

### Customize Colors
**File**: `assets/css/styles.css`
```css
:root {
    --primary-color: #0033cc;  /* Change this */
}
```

---

## 🧪 Testing

### Test Login Flow
1. Open browser console (F12)
2. Login with test credentials
3. Check for errors in console
4. Verify dashboard loads

### Test Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Test: Mobile (390x844), Tablet (820x1180), Desktop (1920x1080)

---

## 📡 API Requirements

Your member-services backend must provide:

### Auth Endpoints
- `POST /api/auth/login` → `{ token, user }`
- `POST /api/auth/register` → `{ token, user }`
- `GET /api/auth/verify` → `{ valid: true, user }`

### Data Endpoints
- `GET /api/documents` → `{ data: [...] }`
- `GET /api/events` → `{ data: [...] }`
- `GET /api/announcements` → `{ data: [...] }`

### Headers Required
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 🐛 Troubleshooting

### CORS Errors
**Problem**: API requests blocked by browser

**Solution**: Enable CORS on backend:
```javascript
// Express example
app.use(cors({ origin: 'http://localhost:8080' }));
```

### 401 Unauthorized
**Problem**: All requests fail

**Solutions**:
1. Check API URL in `config.js`
2. Verify backend is running
3. Clear localStorage and re-login
4. Check token in DevTools → Application → Local Storage

### Styles Not Loading
**Problem**: Page unstyled

**Solutions**:
1. Check browser console for 404 errors
2. Verify file path: `assets/css/styles.css`
3. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)

---

## 🚢 Deploy to Production

### Update API URL
```javascript
API_BASE_URL: 'https://api.waccamaw.org/api'
```

### Deploy to Cloudflare Pages
```bash
wrangler pages publish members/
```

### Deploy to Netlify
```bash
netlify deploy --dir=members --prod
```

---

## 📚 More Information

- **Full Documentation**: `README.md`
- **Main Project**: `../README.md`
- **Architecture**: `../ARCHITECTURE.md`
- **Contributing**: `../CONTRIBUTING.md`

---

## 💡 Tips

1. **Always test locally** before deploying
2. **Check browser console** for errors
3. **Use DevTools Network tab** to debug API calls
4. **Clear localStorage** if auth seems stuck
5. **Test on mobile** - many members use phones

---

**Need Help?** Email: waccamawchief@gmail.com
