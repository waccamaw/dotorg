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
        this.originalMeetings = []; // Store ALL meetings for dev table
        this.filteredMeetings = [];
        this.currentYear = null;
        this.currentType = null;
        this.isLoading = false;
        this.isAuthenticated = false;
        
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
                let allMeetings = response.meetings || [];
                this.isAuthenticated = response.authenticated;
                
                // Store original unfiltered meetings for dev table
                this.originalMeetings = [...allMeetings];

                // Always filter by visibility (production behavior)
                // Only show public meetings if not authenticated
                if (!response.authenticated) {
                    allMeetings = allMeetings.filter(meeting => meeting.visibility === 'public');
                    console.log(`[Meetings] Filtered to ${allMeetings.length} public meetings (not authenticated)`);
                } else {
                    console.log(`[Meetings] Authenticated: showing all ${allMeetings.length} meetings`);
                }

                this.meetings = allMeetings;
                this.filteredMeetings = this.meetings;
                console.log('[Meetings] Loaded', this.meetings.length, 'meetings');
                this.renderStats(response.statistics);
                this.renderAuthStatus(response.authenticated);
                
                // Render dev table if in development mode
                if (CONFIG.ENV === 'development') {
                    this.renderDevTable();
                }
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

        let html = '';

        if (isAuthenticated) {
            html += `
                <span class="auth-badge authenticated">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 11 12 14 16 10"/>
                    </svg>
                    Authenticated - Viewing all meetings
                </span>
            `;
        } else {
            html += `
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

        statusEl.innerHTML = html;
    }

    /**
     * Render dev table (development mode only)
     * Shows ALL meetings from API in a compact table format
     */
    renderDevTable() {
        // Check if table container already exists
        let container = document.getElementById('devTableContainer');
        if (!container) {
            // Create container after the auth status
            const authStatus = document.getElementById('authStatus');
            if (!authStatus) return;
            
            container = document.createElement('div');
            container.id = 'devTableContainer';
            container.style.cssText = 'margin: 20px 0; padding: 16px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px;';
            authStatus.parentNode.insertBefore(container, authStatus.nextSibling);
        }

        const publicCount = this.originalMeetings.filter(m => m.visibility === 'public').length;
        const membersCount = this.originalMeetings.length - publicCount;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 16px; color: #495057;">
                    🔧 Dev Mode - All Meetings (${this.originalMeetings.length})
                </h3>
                <button id="toggleDevTable" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Hide</button>
            </div>
            <div style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">
                <strong>Main view shows:</strong> ${this.meetings.length} meetings (${this.isAuthenticated ? 'all - authenticated' : 'public only - not authenticated'})
                <br>
                <strong>Total in API:</strong> ${publicCount} public + ${membersCount} members-only = ${this.originalMeetings.length} total
            </div>
            <div id="devTableContent" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white;">
                    <thead>
                        <tr style="background: #e9ecef; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 8px; text-align: left; font-weight: 600;">Date</th>
                            <th style="padding: 8px; text-align: left; font-weight: 600;">Title</th>
                            <th style="padding: 8px; text-align: left; font-weight: 600;">Type</th>
                            <th style="padding: 8px; text-align: center; font-weight: 600;">Visibility</th>
                            <th style="padding: 8px; text-align: center; font-weight: 600;">Resources</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.originalMeetings.map(meeting => `
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 8px; white-space: nowrap;">${this.formatDate(meeting.date)}</td>
                                <td style="padding: 8px;">
                                    <a href="${meeting.share_url}" style="color: #0033cc; text-decoration: none;">
                                        ${meeting.title}
                                    </a>
                                </td>
                                <td style="padding: 8px;">
                                    <span style="
                                        display: inline-block;
                                        padding: 2px 8px;
                                        background: ${this.getTypeBadgeColor(meeting.type)};
                                        color: white;
                                        border-radius: 4px;
                                        font-size: 11px;
                                        text-transform: uppercase;
                                    ">${meeting.type}</span>
                                </td>
                                <td style="padding: 8px; text-align: center;">
                                    ${meeting.visibility === 'public' 
                                        ? '<span style="color: #28a745; font-weight: 600;">✓ Public</span>' 
                                        : '<span style="color: #ffc107; font-weight: 600;">🔒 Members</span>'}
                                </td>
                                <td style="padding: 8px; text-align: center; font-size: 11px;">
                                    ${meeting.hasRecording ? '📹' : ''}
                                    ${meeting.hasTranscript ? '📝' : ''}
                                    ${meeting.hasNotes ? '📋' : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Toggle visibility
        const toggleBtn = document.getElementById('toggleDevTable');
        const content = document.getElementById('devTableContent');
        if (toggleBtn && content) {
            toggleBtn.onclick = () => {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
            };
        }
    }

    /**
     * Format date for dev table
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    /**
     * Get badge color for meeting type
     */
    getTypeBadgeColor(type) {
        const colors = {
            'open': '#28a745',
            'executive': '#dc3545',
            'general': '#007bff',
            'powwow': '#6f42c1',
            'special': '#fd7e14'
        };
        return colors[type] || '#6c757d';
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
