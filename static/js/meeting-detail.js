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

            ${this.renderContentTabs()}

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

        // Setup tab switching after rendering
        setTimeout(() => this.setupTabs(), 0);
    }

    renderContentTabs() {
        const tabs = [];
        
        // Recording tab (always first if available)
        if (this.meeting.hasRecording) {
            tabs.push({
                id: 'recording',
                label: '📹 Recording',
                content: `
                    <div class="tab-content-recording">
                        <div class="recording-embed">
                            <a href="${this.meeting.share_url}" target="_blank" class="btn-primary btn-large" style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 24px; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                                Watch Recording on Zoom
                            </a>
                            <p style="margin-top: 16px; color: var(--text-light); font-size: 14px;">Duration: ${this.meeting.duration} minutes</p>
                        </div>
                    </div>
                `
            });
        }

        // Transcript tab
        if (this.meeting.hasTranscript) {
            tabs.push({
                id: 'transcript',
                label: '📝 Transcript',
                content: `
                    <div class="tab-content-transcript">
                        ${this.meeting.transcript ? `
                            <div class="transcript-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color); max-height: 600px; overflow-y: auto;">
                                <pre style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; margin: 0; font-size: 14px;">${this.escapeHtml(this.meeting.transcript)}</pre>
                            </div>
                        ` : '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">Transcript is being processed and will be available soon.</p>'}
                    </div>
                `
            });
        }

        // Notes tab
        if (this.meeting.hasNotes) {
            tabs.push({
                id: 'notes',
                label: '📋 Notes',
                content: `
                    <div class="tab-content-notes">
                        ${this.meeting.notes ? `
                            <div class="notes-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color);">
                                ${this.renderMarkdown(this.meeting.notes)}
                            </div>
                        ` : '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">Meeting notes are being compiled and will be available soon.</p>'}
                    </div>
                `
            });
        }

        // Chat tab
        if (this.meeting.hasChat) {
            tabs.push({
                id: 'chat',
                label: '💬 Chat',
                content: `
                    <div class="tab-content-chat">
                        ${this.meeting.chat ? `
                            <div class="chat-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color);">
                                <pre style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; font-size: 14px; margin: 0;">${this.escapeHtml(this.meeting.chat)}</pre>
                            </div>
                        ` : '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">Chat log is being processed and will be available soon.</p>'}
                    </div>
                `
            });
        }

        if (tabs.length === 0) {
            return '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">No additional resources available for this meeting.</p>';
        }

        return `
            <div class="meeting-content-tabs" style="margin-top: 2rem;">
                <div class="tab-nav" style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; overflow-x: auto;">
                    ${tabs.map((tab, index) => `
                        <button class="tab-btn ${index === 0 ? 'active' : ''}" data-tab="${tab.id}" style="
                            padding: 12px 20px;
                            background: ${index === 0 ? 'var(--primary-color)' : 'transparent'};
                            color: ${index === 0 ? 'white' : 'var(--text-color)'};
                            border: none;
                            border-bottom: 3px solid ${index === 0 ? 'var(--primary-color)' : 'transparent'};
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 15px;
                            transition: all 0.2s;
                            white-space: nowrap;
                            border-radius: 8px 8px 0 0;
                        ">
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>
                <div class="tab-panels">
                    ${tabs.map((tab, index) => `
                        <div class="tab-panel ${index === 0 ? 'active' : ''}" data-panel="${tab.id}" style="display: ${index === 0 ? 'block' : 'none'};">
                            ${tab.content}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--text-color)';
                    btn.style.borderBottom = '3px solid transparent';
                });
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                });

                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                button.style.background = 'var(--primary-color)';
                button.style.color = 'white';
                button.style.borderBottom = '3px solid var(--primary-color)';
                
                const panel = document.querySelector(`.tab-panel[data-panel="${tabId}"]`);
                if (panel) {
                    panel.classList.add('active');
                    panel.style.display = 'block';
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderMarkdown(markdown) {
        // Simple markdown rendering
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--text-color);">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin-top: 32px; margin-bottom: 16px; color: var(--text-color); border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="margin-top: 0; margin-bottom: 20px; color: var(--text-color);">$1</h1>');
        
        // Checkboxes
        html = html.replace(/- \[ \] (.+)$/gm, '<div style="margin: 8px 0;"><input type="checkbox" disabled style="margin-right: 8px;"> <span>$1</span></div>');
        html = html.replace(/- \[x\] (.+)$/gm, '<div style="margin: 8px 0;"><input type="checkbox" checked disabled style="margin-right: 8px;"> <span>$1</span></div>');
        
        // Regular list items (that aren't checkboxes)
        html = html.replace(/^- (?!\[)(.+)$/gm, '<li style="margin: 4px 0;">$1</li>');
        
        // Wrap lists
        html = html.replace(/(<li.*?>.*?<\/li>\n?)+/g, '<ul style="margin: 12px 0; padding-left: 24px;">$&</ul>');
        
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n/g, '<br>');
        
        return html;
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
