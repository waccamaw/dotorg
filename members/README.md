# Waccamaw Member Portal

The Waccamaw Indian People's Member Portal - a secure web interface for tribal members to access member-only resources, documents, and communications.

## Overview

The Member Portal provides authenticated access to:

- **Member Dashboard** - Personalized overview of documents, events, and announcements
- **Document Library** - Access to tribal documents and resources
- **Event Calendar** - View and register for tribal events
- **Announcements** - Latest news and communications
- **Member Directory** - Connect with other tribal members
- **Profile Management** - Update your member information

## Architecture

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Separate microservice (member-services repository)
- **Authentication**: JWT-based token authentication
- **API**: RESTful JSON API
- **Hosting**: Static site hosting (Cloudflare Pages, Netlify, or GitHub Pages)

### Directory Structure

```
members/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css     # Styles matching Waccamaw brand
│   └── js/
│       ├── config.js      # Configuration and constants
│       ├── api.js         # API client for backend communication
│       ├── auth.js        # Authentication manager
│       └── app.js         # Main application logic
└── README.md              # This file
```

### Component Overview

#### 1. Configuration (`config.js`)

Manages all application configuration including:
- API endpoint URLs
- Local storage keys
- API endpoint paths
- Settings and constants

**Key Configuration**:
```javascript
API_BASE_URL: 'http://localhost:3000/api'  // Update for production
```

#### 2. API Client (`api.js`)

Handles all HTTP communication with the backend:
- RESTful API requests (GET, POST, PUT, DELETE)
- Authentication token management
- File upload handling
- Error handling and token refresh

**Main Methods**:
- `login(email, password)` - Authenticate user
- `register(userData)` - Register new member
- `getDocuments()` - Fetch document list
- `getEvents()` - Fetch event list
- `getAnnouncements()` - Fetch announcements

#### 3. Authentication Manager (`auth.js`)

Manages user authentication state:
- Token verification
- User session management
- Login/logout handling
- Current user data access

#### 4. Application (`app.js`)

Main application logic and UI management:
- Screen navigation (login, register, dashboard)
- Form handling and validation
- Dashboard data loading
- Event listeners setup

## Setup & Installation

### Prerequisites

- Backend member-services API running (see member-services repository)
- Web server for hosting static files (or local development server)

### Local Development

1. **Configure API Endpoint**

   Edit `assets/js/config.js`:
   ```javascript
   API_BASE_URL: 'http://localhost:3000/api'
   ```

2. **Start a Local Web Server**

   Using Python:
   ```bash
   cd members/
   python3 -m http.server 8080
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server members/ -p 8080
   ```

   Using PHP:
   ```bash
   cd members/
   php -S localhost:8080
   ```

3. **Access the Portal**

   Open browser to: `http://localhost:8080`

### Production Deployment

#### Option 1: Cloudflare Pages

1. **Build Configuration**
   - Build command: None (static site)
   - Build output directory: `members/`
   - Root directory: `/`

2. **Environment Variables**
   ```
   API_BASE_URL=https://api.waccamaw.org/api
   ```

3. **Deploy**
   ```bash
   # Cloudflare Pages auto-deploys from GitHub
   # Or manually via Wrangler:
   wrangler pages publish members/
   ```

#### Option 2: Netlify

1. **Create `netlify.toml`** in repository root:
   ```toml
   [build]
     publish = "members/"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   netlify deploy --dir=members --prod
   ```

#### Option 3: GitHub Pages

1. **Configure GitHub Pages**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `members/`

2. **Access**: `https://waccamaw.github.io/dotorg/members/`

## Configuration

### API Endpoint Configuration

Update the API base URL in `assets/js/config.js` for different environments:

**Development**:
```javascript
API_BASE_URL: 'http://localhost:3000/api'
```

**Staging**:
```javascript
API_BASE_URL: 'https://staging-api.waccamaw.org/api'
```

**Production**:
```javascript
API_BASE_URL: 'https://api.waccamaw.org/api'
```

### Environment-Based Configuration

For dynamic configuration, you can use environment variables:

```javascript
API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api'
```

With build tools like Vite or Webpack, this allows different configurations per environment.

## API Integration

### Authentication Flow

1. **Login**
   ```javascript
   POST /api/auth/login
   Body: { email, password }
   Response: { token, user }
   ```

2. **Token Storage**
   - Token stored in `localStorage` as `waccamaw_auth_token`
   - User data stored as `waccamaw_user_data`

3. **Authenticated Requests**
   ```javascript
   Headers: {
     'Authorization': 'Bearer <token>',
     'Content-Type': 'application/json'
   }
   ```

### API Endpoints

The portal integrates with these backend endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Verify token validity

#### User
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

#### Members
- `GET /members` - List members
- `GET /members/:id` - Get member details

#### Documents
- `GET /documents` - List documents
- `POST /documents/upload` - Upload document

#### Events
- `GET /events` - List events
- `GET /events/:id` - Get event details

#### Announcements
- `GET /announcements` - List announcements

## User Interface

### Screens

#### 1. Login Screen
- Email and password authentication
- Link to registration
- Forgot password functionality (placeholder)

#### 2. Registration Screen
- First name, last name, email, password
- Password confirmation
- Validation (8+ characters, matching passwords)

#### 3. Member Dashboard
- Welcome message with member name
- Quick stats (documents, events, messages)
- Recent documents list
- Announcements feed
- Upcoming events calendar
- Quick action cards

### Responsive Design

The portal is fully responsive with breakpoints for:

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1023px (two column layout)
- **Desktop**: 1024px+ (full grid layout)

### Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Reduced motion support

## Security

### Authentication
- JWT-based token authentication
- Tokens stored in localStorage
- Automatic token refresh
- Session expiry handling

### API Security
- HTTPS-only in production
- CORS configuration required on backend
- Authorization headers on all requests
- Token validation on backend

### Best Practices
- Passwords never stored client-side
- Tokens cleared on logout
- Automatic redirect on 401 (unauthorized)
- Input validation and sanitization

## Customization

### Branding

Colors and styles are defined in `assets/css/styles.css`:

```css
:root {
    --primary-color: #0033cc;      /* Main brand color */
    --primary-hover: #0028a3;      /* Hover state */
    --primary-light: #e6eeff;      /* Light variant */
    /* ... more variables */
}
```

### Adding Features

1. **Add new API endpoint** in `config.js`:
   ```javascript
   ENDPOINTS: {
       NEW_FEATURE: '/new-feature'
   }
   ```

2. **Add API method** in `api.js`:
   ```javascript
   async getNewFeature() {
       return this.get(CONFIG.ENDPOINTS.NEW_FEATURE);
   }
   ```

3. **Use in app** in `app.js`:
   ```javascript
   const data = await api.getNewFeature();
   ```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Browser blocks API requests

**Solution**: Configure CORS on backend:
```javascript
// Express.js example
app.use(cors({
    origin: 'https://waccamaw.org',
    credentials: true
}));
```

#### 2. Authentication Fails
**Problem**: Login returns 401

**Solutions**:
- Verify API endpoint URL is correct
- Check backend is running
- Verify credentials are correct
- Check browser console for errors

#### 3. Token Expired
**Problem**: Requests fail with 401 after some time

**Solution**: Token refresh is automatic. If issues persist:
- Check token expiry time on backend
- Verify refresh logic in `api.js`
- Clear localStorage and re-login

#### 4. Styles Not Loading
**Problem**: Page appears unstyled

**Solutions**:
- Check browser console for 404 errors
- Verify file paths in `index.html`
- Check web server is serving static files
- Hard refresh browser (Cmd+Shift+R / Ctrl+F5)

### Debug Mode

Enable detailed logging by adding to `config.js`:

```javascript
DEBUG: true
```

Then in `api.js`, add logging:

```javascript
if (CONFIG.DEBUG) {
    console.log('API Request:', endpoint, options);
}
```

## Performance

### Optimization Techniques

1. **Lazy Loading**
   - Dashboard data loaded after authentication
   - Parallel API requests for faster loading

2. **Caching**
   - User data cached in localStorage
   - API responses can be cached (if backend supports)

3. **Minification** (Production)
   ```bash
   # Minify CSS
   npx csso assets/css/styles.css -o assets/css/styles.min.css
   
   # Minify JavaScript
   npx terser assets/js/*.js -o assets/js/bundle.min.js
   ```

4. **CDN Delivery**
   - Host on Cloudflare Pages for global CDN
   - Enable caching headers
   - Use HTTP/2 or HTTP/3

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Register new account
- [ ] Registration validation (password length, matching)
- [ ] Dashboard loads after login
- [ ] Stats display correctly
- [ ] Documents list renders
- [ ] Events list renders
- [ ] Announcements list renders
- [ ] Logout clears session
- [ ] Mobile responsive design works
- [ ] Tablet responsive design works
- [ ] Desktop layout correct

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

### Automated Testing

For future implementation, consider:
- Jest for JavaScript unit tests
- Cypress for E2E testing
- Lighthouse for performance audits

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes** following coding standards

3. **Test locally** with member-services backend running

4. **Commit with descriptive message**
   ```bash
   git commit -m "feat: add event registration feature"
   ```

5. **Create Pull Request** with:
   - Desktop screenshot (1920x1080)
   - Mobile screenshot (390x844)
   - Description of changes
   - Testing checklist

### Coding Standards

- **JavaScript**: ES6+ syntax, semicolons, 4-space indentation
- **CSS**: BEM-like naming, mobile-first approach
- **HTML**: Semantic elements, proper accessibility
- **Comments**: JSDoc for functions, inline for complex logic

## Roadmap

### Phase 1: MVP (Current)
- [x] Login/registration
- [x] Member dashboard
- [x] Documents list
- [x] Events list
- [x] Announcements feed

### Phase 2: Enhanced Features
- [ ] Document upload UI
- [ ] Event registration
- [ ] Member directory with search
- [ ] Profile editing
- [ ] Password reset flow

### Phase 3: Advanced Features
- [ ] Real-time notifications
- [ ] Document preview/download
- [ ] Event calendar view
- [ ] Discussion forums
- [ ] Voting/polling system

### Phase 4: Mobile App
- [ ] Progressive Web App (PWA)
- [ ] Native mobile apps (iOS/Android)
- [ ] Push notifications
- [ ] Offline support

## Support

### Getting Help

1. **Documentation**: Check this README and code comments
2. **GitHub Issues**: Create issue with detailed description
3. **Email**: waccamawchief@gmail.com
4. **Logs**: Check browser console for errors

### Reporting Bugs

Include in bug report:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors

## License

Copyright © 2025 Waccamaw Indian People. All rights reserved.

See [LICENSE](../LICENSE) file for details.

## Related Documentation

- [Main README](../README.md) - Project overview
- [Architecture](../ARCHITECTURE.md) - System architecture
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
- [Deployment](../DEPLOYMENT.md) - Deployment procedures

---

**Last Updated**: November 20, 2025

**Maintainer**: Waccamaw Tribal Technology Team
