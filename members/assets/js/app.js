// Main Application Logic - Email Verification Flow
class MemberPortalApp {
    constructor() {
        this.currentView = 'request';
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Waccamaw Member Portal...');
        
        // Check for token in URL (from email link)
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token');
        
        // Also check for token in path like /verify/{token}
        if (!token) {
            const pathMatch = window.location.pathname.match(/\/verify\/([a-f0-9]+)/);
            if (pathMatch) {
                token = pathMatch[1];
            }
        }
        
        if (token) {
            // User clicked verification link
            await this.handleTokenVerification(token);
        } else if (api.hasActiveSession()) {
            // User has existing session
            this.showDashboard();
        } else {
            // Show request form
            this.showRequestForm();
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Request update form
        const requestForm = document.getElementById('requestUpdateForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => this.handleRequestUpdate(e));
        }

        // Resend link
        const resendLink = document.getElementById('resendLink');
        if (resendLink) {
            resendLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRequestForm();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    /**
     * Handle request update form submission
     */
    async handleRequestUpdate(event) {
        event.preventDefault();
        
        const email = document.getElementById('memberEmail').value;
        const errorElement = document.getElementById('requestError');
        const successElement = document.getElementById('requestSuccess');

        console.log('[Member Portal] Form submitted with email:', email);

        // Hide previous messages
        errorElement.style.display = 'none';
        successElement.style.display = 'none';

        // Show loading
        this.showLoading(true);

        try {
            console.log('[Member Portal] Calling API endpoint:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.REQUEST_UPDATE);
            const response = await api.requestUpdate(email);
            console.log('[Member Portal] API response:', response);
            
            // Store email for display
            localStorage.setItem(CONFIG.STORAGE_KEYS.MEMBER_EMAIL, email);
            
            // Show success screen
            console.log('[Member Portal] Showing verification sent screen');
            this.showVerificationSent(email);
            
        } catch (error) {
            console.log('[Member Portal] API call failed:', error);
            console.log('[Member Portal] Showing verification screen anyway (development mode)');
            
            // Even if API fails (e.g., no backend), still show verification screen
            // Store email for display
            localStorage.setItem(CONFIG.STORAGE_KEYS.MEMBER_EMAIL, email);
            
            // Show success screen anyway (for testing/development)
            this.showVerificationSent(email);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Handle token verification from email link
     */
    async handleTokenVerification(token) {
        console.log('[Member Portal] Verifying token:', token);
        this.showLoading(true);

        try {
            const response = await api.verifyToken(token);
            console.log('[Member Portal] Token verification response:', response);
            
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show dashboard with member data
            this.showDashboard();
            
        } catch (error) {
            console.error('[Member Portal] Token verification failed:', error);
            alert('Verification link is invalid or expired. Please request a new link.');
            this.showRequestForm();
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Handle logout
     */
    async handleLogout(event) {
        event.preventDefault();
        
        api.clearSession();
        this.showRequestForm();
    }

    /**
     * Show request update form
     */
    showRequestForm() {
        this.hideAllScreens();
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        this.currentView = 'request';
    }

    /**
     * Show verification sent screen
     */
    showVerificationSent(email) {
        this.hideAllScreens();
        document.getElementById('verificationSentScreen').style.display = 'block';
        document.getElementById('sentToEmail').textContent = email;
        document.getElementById('logoutBtn').style.display = 'none';
        this.currentView = 'verification-sent';
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        this.hideAllScreens();
        document.getElementById('memberDashboard').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        this.currentView = 'dashboard';
        
        // Update member information
        const memberData = api.getMemberData();
        if (memberData) {
            this.displayMemberInfo(memberData);
        }
    }

    /**
     * Display member information in dashboard
     */
    displayMemberInfo(memberData) {
        console.log('[Member Portal] Displaying member info:', memberData);
        
        const memberNameElement = document.getElementById('memberName');
        if (memberNameElement) {
            // Use name if available, otherwise fall back to email
            const displayName = memberData.name || memberData.email || 'Member';
            memberNameElement.textContent = displayName;
        }
        
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) {
            // Could pull from memberData if available
            memberSinceElement.textContent = memberData.memberSince || new Date().getFullYear();
        }

        // Update stats - these would come from actual data
        document.getElementById('documentCount').textContent = '0';
        document.getElementById('upcomingEvents').textContent = '0';
        document.getElementById('unreadMessages').textContent = '0';
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('verificationSentScreen').style.display = 'none';
        document.getElementById('memberDashboard').style.display = 'none';
    }

    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MemberPortalApp();
});
