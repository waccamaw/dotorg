// Configuration for Member Portal
const CONFIG = {
    // API Base URL - Update this to point to your member-services endpoint
    API_BASE_URL: 'https://members.waccamaw.org',
    
    // Environment
    ENV: 'development',
    
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
        UPDATE_MEMBER: '/api/update-member'
    },
    
    // Settings
    SETTINGS: {
        VERIFICATION_EXPIRY: 60 * 60 * 1000, // 1 hour
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
    }
};
