// API Client for Member Portal - Email Verification Based
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    /**
     * Get session token from local storage
     */
    getSessionToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
    }

    /**
     * Set session token in local storage
     */
    setSessionToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN, token);
    }

    /**
     * Clear all session data from local storage
     */
    clearSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.MEMBER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.MEMBER_EMAIL);
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getSessionToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            credentials: 'include'  // Send cookies with requests
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Request email verification for member update
     * @param {string} email - Member email address
     * @returns {Promise<Object>} Response with success message
     */
    async requestUpdate(email) {
        return this.request(CONFIG.ENDPOINTS.REQUEST_UPDATE, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    /**
     * Verify email token and get member data
     * @param {string} token - Verification token from email
     * @returns {Promise<Object>} Member data and session token
     */
    async verifyToken(token) {
        const endpoint = CONFIG.ENDPOINTS.VERIFY_TOKEN.replace(':token', token);
        const response = await this.request(endpoint, {
            method: 'GET'
        });

        // Store session token if provided
        if (response.sessionToken) {
            this.setSessionToken(response.sessionToken);
        }

        // Store member data
        if (response.memberData) {
            localStorage.setItem(
                CONFIG.STORAGE_KEYS.MEMBER_DATA, 
                JSON.stringify(response.memberData)
            );
        }

        return response;
    }

    /**
     * Update member information
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Success response
     */
    async updateMember(updateData) {
        return this.request(CONFIG.ENDPOINTS.UPDATE_MEMBER, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Update member information (alias for compatibility)
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Success response
     */
    async updateMemberInfo(updateData) {
        return this.updateMember(updateData);
    }

    /**
     * Get member status information
     * @returns {Promise<Object>} Status data including active status, memberSince, lastActive
     */
    async getMemberStatus() {
        return this.request(CONFIG.ENDPOINTS.MEMBER_STATUS, {
            method: 'GET'
        });
    }

    /**
     * Get member data from local storage
     */
    getMemberData() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.MEMBER_DATA);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Check if user has active session
     */
    hasActiveSession() {
        return !!this.getSessionToken() && !!this.getMemberData();
    }

    /**
     * Make authenticated fetch request
     * @param {string} url - Full URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} JSON response
     */
    async fetchWithAuth(url, options = {}) {
        const token = this.getSessionToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            credentials: 'include'
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const api = new APIClient();
