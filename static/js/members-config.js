// Configuration for Member Portal
const CONFIG = {
    // API Base URL - Auto-detect environment
    // Use localhost:8787 in dev container, production URL otherwise
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8787'
        : 'https://members.waccamaw.org',
    
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
        UPLOAD_PHOTO: '/api/upload-photo'
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
