/**
 * Meeting Detail Page
 * Fetches and displays a single meeting from the API
 */

console.log('[Meeting Detail] Script loaded');

class MeetingDetailApp {
    constructor() {
        this.api = new MeetingsAPIClient();
        this.meeting = null;
        
        // Get meeting path from URL
        const path = window.location.pathname;
        const match = path.match(/\/meetings\/([^/]+)\/(\d{4})\/(\d{2})\/(\d{2})\/?$/);
        
        if (match) {
            this.type = match[1];
            this.year = match[2];
            this.month = match[3];
            this.day = match[4];
            
            console.log('[Meeting Detail] Meeting path:', { type: this.type, year: this.year, month: this.month, day: this.day });
            this.init();
        } else {
            console.error('[Meeting Detail] Could not parse meeting path from URL:', path);
            this.renderError('Invalid meeting URL');
        }
    }

    async init() {
        await this.loadMeeting();
    }

    async loadMeeting() {
        console.log('[Meeting Detail] Loading meeting from API...');
        try {
            const response = await this.api.getMeeting(this.type, this.year, this.month, this.day);
            console.log('[Meeting Detail] API Response:', response);
            
            if (response.success && response.meeting) {
                this.meeting = response.meeting;
                this.renderMeeting();
            } else {
                this.renderError('Meeting not found');
            }
        } catch (error) {
            console.error('[Meeting Detail] Error loading meeting:', error);
            this.renderError(error.message);
        }
    }

    renderMeeting() {
        console.log('[Meeting Detail] Rendering meeting:', this.meeting);
        
        const container = document.getElementById('meetingDetail');
        if (!container) {
            console.error('[Meeting Detail] Container #meetingDetail not found');
            return;
        }

        const date = new Date(this.meeting.date);
        const dateFormatted = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeFormatted = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const typeDisplay = this.api.getTypeDisplayName(this.meeting.type);
        const typeBadge = this.api.getTypeBadgeClass(this.meeting.type);

        // Duration in minutes
        const duration = this.meeting.duration ? `${this.meeting.duration} minutes` : 'Duration not recorded';

        container.innerHTML = `
            <div class="meeting-detail-header">
                <div class="meeting-breadcrumb">
                    <a href="/meetings/">← All Meetings</a>
                </div>
                
                <div class="meeting-type-badge">
                    <span class="badge ${typeBadge}">${typeDisplay}</span>
                    ${this.meeting.visibility === 'members-only' ? '<span class="badge visibility-badge">Members Only</span>' : '<span class="badge visibility-badge public">Public</span>'}
                </div>
                
                <h1 class="meeting-title">${this.meeting.title}</h1>
                
                <div class="meeting-meta">
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateFormatted}
                    </div>
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${timeFormatted}
                    </div>
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20"></path>
                        </svg>
                        ${duration}
                    </div>
                </div>
            </div>

            <div class="meeting-resources">
                <h2>Available Resources</h2>
                <div class="resources-grid">
                    ${this.meeting.hasRecording ? `
                        <a href="${this.meeting.share_url}" target="_blank" class="resource-card recording">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                            <span>Watch Recording</span>
                        </a>
                    ` : ''}
                    
                    ${this.meeting.hasTranscript ? `
                        <div class="resource-card transcript">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span>Transcript Available</span>
                        </div>
                    ` : ''}
                    
                    ${this.meeting.hasNotes ? `
                        <div class="resource-card notes">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Meeting Notes</span>
                        </div>
                    ` : ''}
                    
                    ${this.meeting.hasChat ? `
                        <div class="resource-card chat">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Chat Log</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${this.meeting.visibility === 'members-only' && !this.api.isAuthenticated() ? `
                <div class="auth-notice">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h3>Members-Only Meeting</h3>
                    <p>This meeting is restricted to tribal members. <a href="/members/">Sign in</a> to access the full content including transcript, notes, and chat log.</p>
                </div>
            ` : ''}
        `;
    }

    renderError(message) {
        const container = document.getElementById('meetingDetail');
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>Unable to Load Meeting</h3>
                <p>${message}</p>
                <a href="/meetings/" class="btn-primary">← Back to All Meetings</a>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Meeting Detail] DOM ready, checking for meetingDetail element...');
    const element = document.getElementById('meetingDetail');
    console.log('[Meeting Detail] meetingDetail element:', element);
    if (element) {
        console.log('[Meeting Detail] Creating MeetingDetailApp instance...');
        new MeetingDetailApp();
    } else {
        console.warn('[Meeting Detail] meetingDetail element not found!');
    }
});
