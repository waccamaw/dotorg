/**
 * Meetings SPA Application
 * Client-side application for browsing tribal meetings
 * Supports public and authenticated access with visibility filtering
 */

console.log('[Meetings] Script loaded! Waiting for DOMContentLoaded...');

class MeetingsApp {
    constructor() {
        this.api = new MeetingsAPIClient();
        this.meetings = [];
        this.filteredMeetings = [];
        this.currentYear = null;
        this.currentType = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('[Meetings] Initializing app...');
        this.renderLoadingState();
        await this.loadMeetings();
        this.setupEventListeners();
        this.renderMeetings();
    }

    /**
     * Load meetings from API
     */
    async loadMeetings() {
        console.log('[Meetings] Loading meetings from API...');
        console.log('[Meetings] API Base URL:', this.api.baseURL);
        try {
            this.isLoading = true;
            const response = await this.api.getMeetings();
            console.log('[Meetings] API Response:', response);
            
            if (response.success) {
                this.meetings = response.meetings || [];
                this.filteredMeetings = this.meetings;
                console.log('[Meetings] Loaded', this.meetings.length, 'meetings');
                this.renderStats(response.statistics);
                this.renderAuthStatus(response.authenticated);
            } else {
                console.error('[Meetings] API returned error:', response);
                this.renderError('Failed to load meetings');
            }
        } catch (error) {
            console.error('[Meetings] Error loading meetings:', error);
            this.renderError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const resetButton = document.getElementById('resetFilter');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetFilters());
        }

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => this.filterByType(e.target.value));
        }
    }

    /**
     * Render authentication status
     */
    renderAuthStatus(isAuthenticated) {
        const statusEl = document.getElementById('authStatus');
        if (!statusEl) return;

        if (isAuthenticated) {
            statusEl.innerHTML = `
                <span class="auth-badge authenticated">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 11 12 14 16 10"/>
                    </svg>
                    Authenticated - Viewing all meetings
                </span>
            `;
        } else {
            statusEl.innerHTML = `
                <span class="auth-badge unauthenticated">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Viewing public meetings only - <a href="/members/">Sign in</a> to see all
                </span>
            `;
        }
    }

    /**
     * Render statistics
     */
    renderStats(stats) {
        const totalEl = document.getElementById('totalCount');
        const displayedEl = document.getElementById('displayedCount');
        const yearCountEl = document.getElementById('yearCount');

        if (totalEl) totalEl.textContent = stats.total || 0;
        if (displayedEl) displayedEl.textContent = stats.total || 0;
        
        // Count unique years
        const years = new Set();
        this.meetings.forEach(meeting => {
            if (meeting.pathComponents && meeting.pathComponents.year) {
                years.add(meeting.pathComponents.year);
            }
        });
        if (yearCountEl) yearCountEl.textContent = years.size;

        // Render year filter timeline
        this.renderYearFilter(Array.from(years).sort().reverse());
    }

    /**
     * Render year filter timeline
     */
    renderYearFilter(years) {
        const timelineEl = document.getElementById('timelineYears');
        if (!timelineEl) return;

        timelineEl.innerHTML = '';
        years.forEach(year => {
            const btn = document.createElement('button');
            btn.className = 'year-btn';
            btn.dataset.year = year;
            btn.textContent = year;
            btn.addEventListener('click', () => this.filterByYear(year));
            timelineEl.appendChild(btn);
        });
    }

    /**
     * Filter meetings by year
     */
    filterByYear(year) {
        this.currentYear = year;
        this.applyFilters();
        
        // Update UI
        document.querySelectorAll('.year-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.year === year);
        });

        const resetButton = document.getElementById('resetFilter');
        if (resetButton) resetButton.style.display = 'inline-block';

        const selectedYearText = document.getElementById('selectedYearText');
        if (selectedYearText) {
            selectedYearText.textContent = `Showing ${this.filteredMeetings.length} meetings from ${year}`;
        }
    }

    /**
     * Filter meetings by type
     */
    filterByType(type) {
        this.currentType = type || null;
        this.applyFilters();
    }

    /**
     * Apply all active filters
     */
    applyFilters() {
        this.filteredMeetings = this.meetings.filter(meeting => {
            // Year filter
            if (this.currentYear && meeting.pathComponents?.year !== this.currentYear) {
                return false;
            }
            // Type filter
            if (this.currentType && meeting.type !== this.currentType) {
                return false;
            }
            return true;
        });

        this.renderMeetings();
        
        const displayedCount = document.getElementById('displayedCount');
        if (displayedCount) displayedCount.textContent = this.filteredMeetings.length;
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.currentYear = null;
        this.currentType = null;
        this.filteredMeetings = this.meetings;

        // Reset UI
        document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.value = '';
        
        const resetButton = document.getElementById('resetFilter');
        if (resetButton) resetButton.style.display = 'none';

        const selectedYearText = document.getElementById('selectedYearText');
        if (selectedYearText) selectedYearText.textContent = 'Showing all years';

        this.renderMeetings();
        
        const displayedCount = document.getElementById('displayedCount');
        if (displayedCount) displayedCount.textContent = this.filteredMeetings.length;
    }

    /**
     * Render loading state
     */
    renderLoadingState() {
        const listEl = document.getElementById('meetingsList');
        if (!listEl) return;

        listEl.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading meetings...</p>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError(message) {
        const listEl = document.getElementById('meetingsList');
        if (!listEl) return;

        // Check if this is a local development API connection issue
        const isLocalDevError = message.includes('Failed to fetch') || message.includes('Network') || message.includes('connect');
        
        if (isLocalDevError) {
            listEl.innerHTML = `
                <div class="info-state" style="background: #fff3cd; border-color: #ffc107; color: #856404;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>API Not Available (Local Development)</h3>
                    <p>The member-services API is not running locally. This is normal for local development.</p>
                    <p><strong>The classic archive below</strong> shows all meetings and works perfectly!</p>
                    <p style="font-size: 0.9em; margin-top: 1em; color: #666;">
                        <em>Note: The API-powered section will work automatically when deployed to production.</em>
                    </p>
                </div>
            `;
        } else {
            listEl.innerHTML = `
                <div class="error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Error Loading Meetings</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Render meetings list
     */
    renderMeetings() {
        const listEl = document.getElementById('meetingsList');
        if (!listEl) return;

        if (this.filteredMeetings.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <p>No meetings found matching your filters.</p>
                </div>
            `;
            return;
        }

        // Group meetings by year
        const byYear = {};
        this.filteredMeetings.forEach(meeting => {
            const year = meeting.pathComponents?.year || 'Unknown';
            if (!byYear[year]) byYear[year] = [];
            byYear[year].push(meeting);
        });

        // Sort years descending
        const years = Object.keys(byYear).sort().reverse();

        // Render
        listEl.innerHTML = years.map(year => {
            const yearMeetings = byYear[year];
            return `
                <div class="meetings-year" data-year="${year}">
                    <h2 class="year-heading">${year} Meetings</h2>
                    <div class="year-meetings">
                        ${yearMeetings.map(meeting => this.renderMeetingCard(meeting)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render single meeting card
     */
    renderMeetingCard(meeting) {
        const { pathComponents, title, date, type, visibility, hasTranscript, hasRecording, hasNotes } = meeting;
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const typeDisplay = this.api.getTypeDisplayName(type);
        const typeBadge = this.api.getTypeBadgeClass(type);

        // Build meeting URL
        const meetingUrl = `/meetings/${pathComponents.type}/${pathComponents.year}/${pathComponents.month}/${pathComponents.day}/`;

        return `
            <a href="${meetingUrl}" class="meeting-item" data-year="${pathComponents.year}" data-type="${type}">
                <div class="meeting-calendar">
                    <div class="calendar-month">${month}</div>
                    <div class="calendar-label">${typeDisplay}</div>
                </div>
                <div class="meeting-info">
                    <h3 class="meeting-title">
                        ${title}
                        ${visibility === 'members-only' ? '<span class="lock-icon" title="Members only">🔒</span>' : ''}
                    </h3>
                    <div class="meeting-meta">
                        <span class="meeting-badge ${typeBadge}">${typeDisplay}</span>
                        <span class="meeting-date">${this.api.formatDate(date)}</span>
                    </div>
                    <div class="meeting-features">
                        ${hasRecording ? '<span class="feature-badge">📹 Recording</span>' : ''}
                        ${hasTranscript ? '<span class="feature-badge">📝 Transcript</span>' : ''}
                        ${hasNotes ? '<span class="feature-badge">📋 Notes</span>' : ''}
                    </div>
                </div>
            </a>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Meetings] DOM ready, checking for meetingsList element...');
    const element = document.getElementById('meetingsList');
    console.log('[Meetings] meetingsList element:', element);
    if (element) {
        console.log('[Meetings] Creating MeetingsApp instance...');
        new MeetingsApp();
    } else {
        console.warn('[Meetings] meetingsList element not found!');
    }
});
