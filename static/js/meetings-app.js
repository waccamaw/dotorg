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
        
        // Check for expired session before loading anything
        if (this.api.isTokenExpired()) {
            console.log('[Meetings] Session expired, clearing stale session data');
            this.api.clearSession();
        }
        
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
                
                // Detect stale session: we have a token but API says not authenticated
                const hasToken = !!this.api.getSessionToken();
                if (hasToken && !response.authenticated) {
                    console.log('[Meetings] Stale session detected (have token but not authenticated)');
                    this.api.clearSession();
                }
                
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
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 24px;
                    margin-bottom: 32px;
                    padding: 20px;
                    background: #ffffff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="22"/>
                        </svg>
                        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #2a2a2a;">Listen to Public Meetings</h3>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #6b6b6b;">Subscribe to our podcast feed to listen to tribal meetings on your favorite podcast app:</p>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; justify-content: center;">
                        <a href="https://meetings.waccamaw.org/podcasts/feed.xml" target="_blank" style="
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 8px 16px;
                            background: #0033cc;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#0028a3'" onmouseout="this.style.background='#0033cc'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 11a9 9 0 0 1 9 9"/>
                                <path d="M4 4a16 16 0 0 1 16 16"/>
                                <circle cx="5" cy="19" r="1"/>
                            </svg>
                            RSS Feed
                        </a>
                        <a href="https://podcasts.apple.com/us/podcast/waccamaw-public-meetings/id1863314453" target="_blank" style="
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 8px 16px;
                            background: #0033cc;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#0028a3'" onmouseout="this.style.background='#0033cc'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            Apple Podcasts
                        </a>
                        <span style="
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 8px 16px;
                            background: #f0f0f0;
                            color: #999;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                        ">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Spotify (Coming Soon)
                        </span>
                    </div>
                </div>
                
                <span class="auth-badge unauthenticated" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 20px;
                    background: #fff3cd;
                    border: 2px solid #ffc107;
                    border-radius: 8px;
                    color: #856404;
                    font-weight: 500;
                    font-size: 15px;
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Viewing public meetings only - <a href="/members/" style="color: #0033cc; font-weight: 600; text-decoration: underline;">Sign in</a> to see all
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
            // Create container at the end of main content
            const mainElement = document.querySelector('main');
            if (!mainElement) return;
            
            container = document.createElement('div');
            container.id = 'devTableContainer';
            container.style.cssText = 'margin: 60px 0 20px; padding: 16px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px;';
            mainElement.appendChild(container);
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
        
        // Also render category filter
        this.renderCategoryFilter();
    }

    /**
     * Render category filter buttons
     */
    renderCategoryFilter() {
        const container = document.getElementById('categoryButtons');
        if (!container) return;

        // Get unique types from meetings
        const types = new Set();
        this.meetings.forEach(meeting => {
            if (meeting.type) types.add(meeting.type);
        });

        // Define type metadata
        const typeInfo = {
            'open': { label: 'Open Meetings', icon: '🏛️', color: '#28a745' },
            'executive': { label: 'Executive Sessions', icon: '🔒', color: '#dc3545' },
            'general': { label: 'General Meetings', icon: '👥', color: '#007bff' },
            'powwow': { label: 'Pow Wow', icon: '🪶', color: '#6f42c1' },
            'special': { label: 'Special Events', icon: '⭐', color: '#fd7e14' },
            'committee': { label: 'Committee', icon: '📋', color: '#20c997' }
        };

        // Sort types for consistent order
        const sortedTypes = Array.from(types).sort();
        
        container.innerHTML = sortedTypes.map(type => {
            const info = typeInfo[type] || { label: type, icon: '📄', color: '#6c757d' };
            const count = this.meetings.filter(m => m.type === type).length;
            
            return `
                <button 
                    class="category-btn" 
                    data-type="${type}"
                    style="
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1.25rem;
                        background: white;
                        border: 2px solid ${info.color};
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.95rem;
                        font-weight: 500;
                        color: var(--text-color);
                        transition: all 0.2s ease;
                    "
                    onmouseover="this.style.background='${info.color}'; this.style.color='white';"
                    onmouseout="if(!this.classList.contains('active')) { this.style.background='white'; this.style.color='var(--text-color)'; }"
                >
                    <span style="font-size: 1.2rem;">${info.icon}</span>
                    <span>${info.label}</span>
                    <span style="
                        display: inline-block;
                        padding: 0.15rem 0.5rem;
                        background: rgba(0,0,0,0.1);
                        border-radius: 12px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    ">${count}</span>
                </button>
            `;
        }).join('');

        // Add click handlers
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.filterByType(type);
                
                // Update button states
                container.querySelectorAll('.category-btn').forEach(b => {
                    const info = typeInfo[b.dataset.type] || { color: '#6c757d' };
                    if (b === btn) {
                        b.classList.add('active');
                        b.style.background = info.color;
                        b.style.color = 'white';
                    } else {
                        b.classList.remove('active');
                        b.style.background = 'white';
                        b.style.color = 'var(--text-color)';
                    }
                });
                
                // Show reset button
                const resetBtn = document.getElementById('resetFilter');
                if (resetBtn) resetBtn.style.display = 'inline-block';
            });
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

        const homeButton = document.getElementById('homeButton');
        if (homeButton) homeButton.style.display = 'inline-block';

        const showAllButton = document.getElementById('showAllButton');
        if (showAllButton) showAllButton.style.display = 'none';

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
        
        const homeButton = document.getElementById('homeButton');
        if (homeButton) homeButton.style.display = 'inline-block';

        const showAllButton = document.getElementById('showAllButton');
        if (showAllButton) showAllButton.style.display = 'none';
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
     * Go back to home view (last 2 years)
     */
    goHome() {
        this.currentYear = null;
        this.currentType = null;
        this.showAll = false;
        this.filteredMeetings = this.meetings;

        // Reset UI
        document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
            btn.style.color = 'var(--text-color)';
        });
        
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.value = '';
        
        const homeButton = document.getElementById('homeButton');
        if (homeButton) homeButton.style.display = 'none';

        const showAllButton = document.getElementById('showAllButton');
        if (showAllButton) showAllButton.style.display = 'inline-block';

        const selectedYearText = document.getElementById('selectedYearText');
        if (selectedYearText) selectedYearText.textContent = '';

        // Re-render to show last 2 years
        this.renderMeetings();
        
        const displayedCount = document.getElementById('displayedCount');
        if (displayedCount) displayedCount.textContent = this.filteredMeetings.length;
    }

    /**
     * Show all years
     */
    showAllYears() {
        this.showAll = true;
        this.currentYear = null;
        this.currentType = null;
        this.filteredMeetings = this.meetings;

        // Reset filter UI
        document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
            btn.style.color = 'var(--text-color)';
        });
        
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.value = '';

        const homeButton = document.getElementById('homeButton');
        if (homeButton) homeButton.style.display = 'inline-block';

        const showAllButton = document.getElementById('showAllButton');
        if (showAllButton) showAllButton.style.display = 'none';

        const selectedYearText = document.getElementById('selectedYearText');
        if (selectedYearText) selectedYearText.textContent = '';

        // Re-render to show all years
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
     * Render meetings list - inject into Hugo accordions or create new ones
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
        const currentYear = new Date().getFullYear().toString();
        // Expand the last 2 years by default
        const lastTwoYears = years.slice(0, 2);
        // Only show last 2 years unless showAll is true or filters are active
        const yearsToShow = (this.showAll || this.currentYear || this.currentType) ? years : lastTwoYears;

        // Find the legacy meetings container
        const legacyContainer = document.getElementById('legacyMeetingsList');
        
        if (!legacyContainer) {
            // Fallback: render standalone if no legacy container exists
            listEl.innerHTML = yearsToShow.map((year) => {
                const yearMeetings = byYear[year];
                const isExpanded = lastTwoYears.includes(year);
                
                return `
                    <div class="meetings-year" data-year="${year}">
                        <div class="year-heading accordion-header ${isExpanded ? 'expanded' : ''}" 
                            onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('collapsed');"
                            style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); transition: all 0.15s ease;">
                            <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.2s ease;">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            <span style="font-size: 1.1rem; font-weight: 600; color: var(--text-color);">${year}</span>
                            <span style="font-size: 0.85rem; color: var(--text-light); font-weight: 400;">${yearMeetings.length} meeting${yearMeetings.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="year-meetings ${isExpanded ? '' : 'collapsed'}">
                            ${yearMeetings.map(meeting => this.renderMeetingCard(meeting)).join('')}
                        </div>
                    </div>
                `;
            }).join('');
            return;
        }

        // Inject API meetings into existing Hugo accordions or create new ones
        yearsToShow.forEach(year => {
            const yearMeetings = byYear[year];
            
            // Look for existing Hugo accordion for this year
            const existingYearSection = legacyContainer.querySelector(`.meetings-year[data-year="${year}"]`);
            
            if (existingYearSection) {
                // Inject into existing Hugo accordion
                const yearMeetingsContainer = existingYearSection.querySelector('.year-meetings');
                if (yearMeetingsContainer) {
                    // Prepend API meetings to the top of the year (before Hugo meetings)
                    const apiMeetingsHTML = yearMeetings.map(meeting => this.renderMeetingCard(meeting)).join('');
                    yearMeetingsContainer.insertAdjacentHTML('afterbegin', apiMeetingsHTML);
                }
            } else {
                // Create new accordion for this year (Hugo doesn't have it)
                const isExpanded = lastTwoYears.includes(year);
                const newAccordion = document.createElement('div');
                newAccordion.className = 'meetings-year';
                newAccordion.setAttribute('data-year', year);
                newAccordion.innerHTML = `
                    <div class="year-heading accordion-header ${isExpanded ? 'expanded' : ''}" 
                        onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('collapsed');"
                        style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); transition: all 0.15s ease;">
                        <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.2s ease;">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 600; color: var(--text-color);">${year}</span>
                        <span style="font-size: 0.85rem; color: var(--text-light); font-weight: 400;">${yearMeetings.length} meeting${yearMeetings.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="year-meetings ${isExpanded ? '' : 'collapsed'}">
                        ${yearMeetings.map(meeting => this.renderMeetingCard(meeting)).join('')}
                    </div>
                `;
                
                // Insert in correct position (descending year order)
                const allYearSections = Array.from(legacyContainer.querySelectorAll('.meetings-year'));
                let inserted = false;
                
                for (let i = 0; i < allYearSections.length; i++) {
                    const existingYear = allYearSections[i].getAttribute('data-year');
                    if (year > existingYear) {
                        allYearSections[i].insertAdjacentElement('beforebegin', newAccordion);
                        inserted = true;
                        break;
                    }
                }
                
                // If not inserted (year is oldest), append to end
                if (!inserted) {
                    legacyContainer.appendChild(newAccordion);
                }
            }
        });

        // Update stats to include API meetings
        const totalCountEl = document.getElementById('legacyTotalCount');
        const displayedCountEl = document.getElementById('legacyDisplayedCount');
        if (totalCountEl && displayedCountEl) {
            const currentTotal = parseInt(totalCountEl.textContent) || 0;
            const currentDisplayed = parseInt(displayedCountEl.textContent) || 0;
            totalCountEl.textContent = currentTotal + this.meetings.length;
            displayedCountEl.textContent = currentDisplayed + this.filteredMeetings.length;
        }

        // Clear the API-only container since we're injecting into legacy
        listEl.innerHTML = '';
    }

    /**
     * Render single meeting card
     */
    renderMeetingCard(meeting) {
        const { pathComponents, title, date, type, visibility, hasTranscript, hasRecording, hasNotes } = meeting;
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('en-US', { month: 'long' });
        const year = dateObj.getFullYear();
        const typeDisplay = this.api.getTypeDisplayName(type);
        const typeBadge = this.api.getTypeBadgeClass(type);

        // Build standardized title: "December 2025 Open Meeting"
        const meetingTitle = `${month} ${year} ${typeDisplay}`;

        // Build meeting URL using ID
        const meetingUrl = `/meetings-detail/?id=${encodeURIComponent(meeting.id)}`;

        return `
            <a href="${meetingUrl}" class="meeting-item" data-year="${pathComponents.year}" data-type="${type}">
                <div class="meeting-info">
                    <h3 class="meeting-title">
                        ${meetingTitle}
                        ${visibility === 'members-only' ? '<span class="lock-icon" title="Members only">🔒</span>' : ''}
                    </h3>
                    <div class="meeting-meta">
                        <span class="meeting-date">${this.api.formatDate(date)}</span>
                    </div>
                    <div class="meeting-features">
                        <span class="calendar-badge">${month.toUpperCase()} ${typeDisplay.toUpperCase()}</span>
                        ${hasRecording ? '<span class="feature-badge">▶ Recording</span>' : ''}
                        ${hasTranscript ? '<span class="feature-badge">⎙ Transcript</span>' : ''}
                        ${hasNotes ? '<span class="feature-badge">◉ Notes</span>' : ''}
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
        window.meetingsApp = new MeetingsApp();
    } else {
        console.warn('[Meetings] meetingsList element not found!');
    }
});
