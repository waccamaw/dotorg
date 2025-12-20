/**
 * Meetings API Client
 * Extends the member portal API client to fetch meeting data
 * Handles both public and authenticated requests
 */

class MeetingsAPIClient {
    constructor() {
        this.baseURL = CONFIG.MEETINGS_API_BASE_URL || CONFIG.API_BASE_URL;
    }

    /**
     * Get session token from local storage
     */
    getSessionToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getSessionToken();
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

        // Include auth header if we have a token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Meetings API Request Error:', error);
            throw error;
        }
    }

    /**
     * Get all meetings (filtered by visibility based on auth status)
     * @param {Object} filters - Optional filters
     * @param {string} filters.type - Meeting type (general, powwow, open, executive, committee)
     * @param {string} filters.startDate - Filter from this date (ISO format)
     * @param {string} filters.endDate - Filter to this date (ISO format)
     * @param {boolean} filters.upcoming - Only upcoming meetings
     * @param {boolean} filters.past - Only past meetings
     * @returns {Promise<Object>} Response with meetings array
     */
    async getMeetings(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.type) params.append('type', filters.type);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.upcoming) params.append('upcoming', 'true');
        if (filters.past) params.append('past', 'true');

        const queryString = params.toString();
        const endpoint = CONFIG.ENDPOINTS.MEETINGS + (queryString ? `?${queryString}` : '');

        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Get a specific meeting by ID
     * @param {string} id - Meeting ID
     * @returns {Promise<Object>} Response with meeting details
     */
    async getMeetingById(id) {
        const endpoint = `/api/meetings/${id}`;
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Get a specific meeting by path
     * @param {string} type - Meeting type
     * @param {string} year - Year (YYYY)
     * @param {string} month - Month (MM)
     * @param {string} day - Day (DD)
     * @returns {Promise<Object>} Response with meeting details
     */
    async getMeeting(type, year, month, day) {
        const endpoint = CONFIG.ENDPOINTS.MEETING_DETAIL
            .replace(':type', type)
            .replace(':year', year)
            .replace(':month', month)
            .replace(':day', day);

        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Get upcoming meetings
     * @returns {Promise<Object>} Response with upcoming meetings
     */
    async getUpcomingMeetings() {
        return this.request(CONFIG.ENDPOINTS.UPCOMING_MEETINGS, { method: 'GET' });
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format time for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted time
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    /**
     * Format duration (minutes to human readable)
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    formatDuration(minutes) {
        if (!minutes || minutes === 0) return 'Duration not recorded';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins} minutes`;
        if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
    }

    /**
     * Get meeting type badge color
     * @param {string} type - Meeting type
     * @returns {string} CSS class name
     */
    getTypeBadgeClass(type) {
        const badgeMap = {
            'open': 'badge-open',
            'executive': 'badge-executive',
            'general': 'badge-general',
            'powwow': 'badge-powwow',
            'committee': 'badge-committee'
        };
        return badgeMap[type] || 'badge-default';
    }

    /**
     * Get meeting type display name
     * @param {string} type - Meeting type
     * @returns {string} Display name
     */
    getTypeDisplayName(type) {
        const nameMap = {
            'open': 'Open Meeting',
            'executive': 'Executive Meeting',
            'general': 'General Meeting',
            'powwow': 'Powwow Meeting',
            'committee': 'Committee Meeting'
        };
        return nameMap[type] || type;
    }
}
