// Configuration for Member Portal
// API base resolution order:
//   1. ?api=<url> query param (persisted to localStorage) — lets the site be
//      served through a tunnel while still hitting a local/alternate Worker.
//   2. previously-persisted override in localStorage.
//   3. localhost:8787 when running on localhost, else the production Worker.
const _isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Only honor the ?api override on localhost or a quick-tunnel host — never on
// the production domain, so the live portal can't be repointed at another API.
const _allowApiOverride = _isLocalHost || /\.trycloudflare\.com$/.test(window.location.hostname);
const _apiOverride = (() => {
    if (!_allowApiOverride) return null;
    try {
        const q = new URLSearchParams(window.location.search).get('api');
        if (q) { localStorage.setItem('waccamaw_api_base', q); return q; }
        return localStorage.getItem('waccamaw_api_base');
    } catch (e) { return null; }
})();
const CONFIG = {
    // API Base URL - override > localhost > production
    API_BASE_URL: _apiOverride || (_isLocalHost
        ? 'http://localhost:8787'
        : 'https://members.waccamaw.org'),
    
    // Meetings API Base URL - Standalone meetings service
    MEETINGS_API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8789'  // Meetings service port
        : 'https://meetings.waccamaw.org',
    
    // Environment
    ENV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'development'
        : 'production',
    
    // Local Storage Keys
    STORAGE_KEYS: {
        SESSION_TOKEN: 'waccamaw_session_token',
        MEMBER_DATA: 'waccamaw_member_data',
        MEMBER_EMAIL: 'waccamaw_member_email'
    },
    
    // API Endpoints
    ENDPOINTS: {
        // Email Verification Flow
        REQUEST_UPDATE: '/api/request-update',
        VERIFY_TOKEN: '/api/verify/:token',
        UPDATE_MEMBER: '/api/update-member',
        MEMBER_STATUS: '/api/member-status',
        MEMBER_PHOTO: '/api/member-photo/:itemId',
        UPLOAD_PHOTO: '/api/upload-photo',
        
        // Meetings API Endpoints (uses MEETINGS_API_BASE_URL)
        MEETINGS: '/api/meetings',
        MEETING_DETAIL: '/api/meetings/:type/:year/:month/:day',
        UPCOMING_MEETINGS: '/api/meetings/upcoming'
    },
    
    // Feature Flags
    FEATURES: {
        PHOTO_UPLOAD: true, // Toggle photo upload capability
        PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
        PHOTO_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
        SHOW_LOGO: false // Toggle logo image (true) or text wordmark (false)
    },
    
    // Settings
    SETTINGS: {
        VERIFICATION_EXPIRY: 60 * 60 * 1000, // 1 hour
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
    }
};
