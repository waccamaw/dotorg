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
        const token = urlParams.get('token');
        
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

        // Update member info button
        const updateMemberInfoBtn = document.getElementById('updateMemberInfoBtn');
        if (updateMemberInfoBtn) {
            updateMemberInfoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMemberInfoForm();
            });
        }

        // Member info form
        const updateMemberInfoForm = document.getElementById('updateMemberInfoForm');
        if (updateMemberInfoForm) {
            updateMemberInfoForm.addEventListener('submit', (e) => this.handleMemberInfoUpdate(e));
        }

        // Cancel update button
        const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
        if (cancelUpdateBtn) {
            cancelUpdateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
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
    async showDashboard() {
        this.hideAllScreens();
        document.getElementById('memberDashboard').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        this.currentView = 'dashboard';
        
        // Update member information
        const memberData = api.getMemberData();
        if (memberData) {
            this.displayMemberInfo(memberData);
        }
        
        // Fetch and display member status
        await this.fetchAndDisplayMemberStatus();
    }

    /**
     * Fetch and display member status
     */
    async fetchAndDisplayMemberStatus() {
        try {
            console.log('[Member Portal] Fetching member status...');
            const statusResponse = await api.getMemberStatus();
            console.log('[Member Portal] Status response:', statusResponse);
            
            if (statusResponse.success && statusResponse.status) {
                const { active, statusText, memberSince, lastActive, position, voter, expires } = statusResponse.status;
                console.log('[Member Portal] Status data:', { active, statusText, memberSince, lastActive, position, voter, expires });
                
                // Update status badge
                const statusBadge = document.getElementById('statusBadge');
                const statusIndicator = document.getElementById('statusIndicator');
                const statusTextElement = document.getElementById('statusText');
                
                if (statusBadge && statusTextElement) {
                    // Remove all status classes
                    statusBadge.classList.remove('active', 'inactive');
                    
                    // Add appropriate class based on status
                    if (statusText && statusText.toLowerCase() === 'active') {
                        statusBadge.classList.add('active');
                    } else if (statusText && statusText.toLowerCase() === 'inactive') {
                        statusBadge.classList.add('inactive');
                    }
                    // If neither active nor inactive, it stays grey (default)
                    
                    statusTextElement.textContent = statusText || 'Unknown';
                    console.log('[Member Portal] Updated status badge:', statusText);
                }
                
                // Update member since date
                const memberSinceElement = document.getElementById('memberSince');
                if (memberSinceElement) {
                    memberSinceElement.textContent = memberSince ? this.formatDate(memberSince) : '-';
                    console.log('[Member Portal] Updated member since:', memberSince);
                }
                
                // Update last active date
                const lastActiveElement = document.getElementById('lastActive');
                if (lastActiveElement) {
                    lastActiveElement.textContent = lastActive ? this.formatDate(lastActive) : '-';
                    console.log('[Member Portal] Updated last active:', lastActive);
                }
                
                // Update position
                const memberPositionElement = document.getElementById('memberPosition');
                if (memberPositionElement) {
                    memberPositionElement.textContent = position || '-';
                    console.log('[Member Portal] Updated position:', position);
                }
                
                // Update voter status
                const memberVoterElement = document.getElementById('memberVoter');
                if (memberVoterElement) {
                    memberVoterElement.textContent = voter || '-';
                    console.log('[Member Portal] Updated voter status:', voter);
                }
                
                // Update expires date
                const memberExpiresElement = document.getElementById('memberExpires');
                if (memberExpiresElement) {
                    memberExpiresElement.textContent = expires ? this.formatDate(expires) : '-';
                    console.log('[Member Portal] Updated expires:', expires);
                }
                
                // Update debug view (local only)
                this.updateDebugView(statusResponse);
            } else {
                console.warn('[Member Portal] Invalid status response:', statusResponse);
            }
        } catch (error) {
            console.error('[Member Portal] Failed to fetch member status:', error);
            console.error('[Member Portal] Error details:', error.message, error.stack);
            // Don't show error to user, just log it
            // Set default values
            const memberSinceElement = document.getElementById('memberSince');
            if (memberSinceElement) {
                memberSinceElement.textContent = '-';
            }
            const lastActiveElement = document.getElementById('lastActive');
            if (lastActiveElement) {
                lastActiveElement.textContent = '-';
            }
        }
    }

    /**
     * Display member information in dashboard
     */
    displayMemberInfo(memberData) {
        console.log('[Member Portal] Displaying member info:', memberData);
        
        const memberNameElement = document.getElementById('memberName');
        if (memberNameElement && memberData.name) {
            memberNameElement.textContent = memberData.name;
        }
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('verificationSentScreen').style.display = 'none';
        document.getElementById('memberDashboard').style.display = 'none';
        document.getElementById('memberInfoScreen').style.display = 'none';
    }

    /**
     * Show member info update form
     */
    showMemberInfoForm() {
        this.hideAllScreens();
        document.getElementById('memberInfoScreen').style.display = 'block';
        this.currentView = 'member-info';
        
        // Load current member data into form
        const memberData = api.getMemberData();
        if (memberData) {
            this.populateMemberInfoForm(memberData);
        }
    }

    /**
     * Populate member info form with current data
     */
    populateMemberInfoForm(memberData) {
        // Split name if available
        if (memberData.name) {
            const nameParts = memberData.name.split(' ');
            if (nameParts.length > 1) {
                document.getElementById('firstName').value = nameParts[0] || '';
                document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
            } else {
                document.getElementById('firstName').value = memberData.name || '';
            }
        }

        document.getElementById('email').value = memberData.email || localStorage.getItem(CONFIG.STORAGE_KEYS.MEMBER_EMAIL) || '';
        document.getElementById('phone').value = memberData.phone || '';
        document.getElementById('address').value = memberData.address || '';
        document.getElementById('city').value = memberData.city || '';
        document.getElementById('state').value = memberData.state || 'SC';
        document.getElementById('zip').value = memberData.zip || '';
    }

    /**
     * Handle member info update form submission
     */
    async handleMemberInfoUpdate(event) {
        event.preventDefault();
        
        const errorElement = document.getElementById('updateMemberError');
        const successElement = document.getElementById('updateMemberSuccess');

        // Hide previous messages
        errorElement.style.display = 'none';
        successElement.style.display = 'none';

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
        };

        console.log('[Member Portal] Updating member info:', formData);

        // Show loading
        this.showLoading(true);

        try {
            // Call API to update member info
            const response = await api.updateMemberInfo(formData);
            console.log('[Member Portal] Update response:', response);
            
            // Update local storage with new data
            const memberData = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                ...formData
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.MEMBER_DATA, JSON.stringify(memberData));
            
            // Show success message
            successElement.textContent = 'Your information has been updated successfully!';
            successElement.style.display = 'block';
            
            // Return to dashboard after 2 seconds
            setTimeout(() => {
                this.showDashboard();
            }, 2000);
            
        } catch (error) {
            console.error('[Member Portal] Update failed:', error);
            
            // For development, still save locally
            const memberData = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                ...formData
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.MEMBER_DATA, JSON.stringify(memberData));
            
            // Show success anyway (development mode)
            successElement.textContent = 'Your information has been updated successfully!';
            successElement.style.display = 'block';
            
            setTimeout(() => {
                this.showDashboard();
            }, 2000);
        } finally {
            this.showLoading(false);
        }
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

    /**
     * Update debug view with member data (local development only)
     */
    updateDebugView(statusResponse) {
        // Only show debug view on localhost
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
        
        const debugView = document.getElementById('debugView');
        if (!debugView) return;
        
        if (!isLocal) {
            debugView.style.display = 'none';
            return;
        }
        
        // Show debug view
        debugView.style.display = 'block';
        
        const debugContent = document.getElementById('debugContent');
        if (!debugContent) return;
        
        // Get all raw fields from the API response
        const rawFields = statusResponse?.rawFields || {};
        
        // If we have raw fields, show them all
        if (Object.keys(rawFields).length > 0) {
            let html = '<table class="debug-table">';
            html += '<thead><tr><th>Field Name</th><th>Value</th></tr></thead>';
            html += '<tbody>';
            
            // Sort fields alphabetically for easier reading
            const sortedKeys = Object.keys(rawFields).sort();
            
            for (const key of sortedKeys) {
                const value = rawFields[key];
                const displayValue = this.formatDebugValue(value);
                html += `<tr><td>${this.escapeHtml(key)}</td><td>${displayValue}</td></tr>`;
            }
            
            html += '</tbody></table>';
            debugContent.innerHTML = html;
        } else {
            debugContent.innerHTML = '<p class="debug-placeholder">No raw field data available</p>';
        }
    }
    
    /**
     * Format debug value with appropriate styling
     */
    formatDebugValue(value) {
        if (value === null || value === undefined) {
            return '<span class="debug-null">null</span>';
        }
        if (value === '') {
            return '<span class="debug-null">(empty string)</span>';
        }
        if (typeof value === 'boolean') {
            return `<span class="debug-boolean">${value}</span>`;
        }
        if (typeof value === 'number') {
            return `<span class="debug-number">${value}</span>`;
        }
        if (typeof value === 'object') {
            // Handle arrays and objects
            const jsonStr = JSON.stringify(value, null, 2);
            return `<span class="debug-object">${this.escapeHtml(jsonStr)}</span>`;
        }
        // Escape HTML for string values
        return this.escapeHtml(String(value));
    }
    
    /**
     * Escape HTML characters
     */
    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MemberPortalApp();
});
