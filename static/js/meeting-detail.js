/**
 * Meeting Detail Page
 * Fetches and displays a single meeting from the API
 */

console.log('[Meeting Detail] Script loaded');

class MeetingDetailApp {
    constructor() {
        this.api = new MeetingsAPIClient();
        this.meeting = null;
        
        // Get meeting ID from URL query parameter
        const params = new URLSearchParams(window.location.search);
        this.meetingId = params.get('id');
        
        if (this.meetingId) {
            console.log('[Meeting Detail] Meeting ID:', this.meetingId);
            this.init();
        } else {
            console.error('[Meeting Detail] No meeting ID found in URL');
            this.renderError('Invalid meeting URL - no ID provided');
        }
    }

    async init() {
        await this.loadMeeting();
    }

    async loadMeeting() {
        try {
            const response = await this.api.getMeetingById(this.meetingId);
            console.log('[Meeting Detail] API Response:', response);
            
            if (response.success && response.meeting) {
                this.meeting = response.meeting;
                this.isExecutiveLeadership = response.isExecutiveLeadership || false;
                console.log('[Meeting Detail] Meeting object:', this.meeting);
                console.log('[Meeting Detail] Is Executive Leadership:', this.isExecutiveLeadership);
                console.log('[Meeting Detail] Has content?', this.meeting.content ? 'YES' : 'NO');
                console.log('[Meeting Detail] Content keys:', this.meeting.content ? Object.keys(this.meeting.content) : 'none');
                console.log('[Meeting Detail] hasTranscript flag:', this.meeting.hasTranscript);
                console.log('[Meeting Detail] hasRecording flag:', this.meeting.hasRecording);
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
            <div class="meeting-breadcrumb" style="margin-bottom: 1.5rem;">
                <a href="/meetings/" style="color: var(--primary-color); text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back to All Meetings
                </a>
            </div>

            ${this.renderRecordingEmbed()}

            <div class="meeting-detail-header" style="margin-bottom: 2rem;">
                ${this.meeting.visibility === 'members-only' ? '<div style="margin-bottom: 0.75rem;"><span class="badge visibility-badge" style="padding: 6px 12px; border-radius: 4px; font-size: 13px; background: var(--text-color); color: white;">Members Only</span></div>' : ''}
                
                <h1 class="meeting-title" style="font-size: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; color: var(--text-color); font-weight: 600;">${this.meeting.title}</h1>
                
                <div class="meeting-meta" style="display: flex; flex-wrap: wrap; gap: 20px; color: var(--text-light); font-size: 14px; align-items: center;">
                    <div class="meta-item" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateFormatted}
                    </div>
                    <div class="meta-item" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${timeFormatted}
                    </div>
                    <div class="meta-item" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                            <path d="M12 2v20M2 12h20"></path>
                        </svg>
                        ${duration}
                    </div>
                    ${this.isExecutiveLeadership ? `
                    <div class="meta-item" style="margin-left: auto; display: flex; gap: 8px;">
                        <a href="${this.getGitHubViewUrl()}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           title="View meeting directory in GitHub"
                           style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s;"
                           onmouseover="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--primary-color)';"
                           onmouseout="this.style.background='var(--bg-white)'; this.style.borderColor='var(--border-color)';">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink: 0;">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            View
                        </a>
                        <a href="${this.getGitHubEditUrl()}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           title="Edit meeting notes in GitHub"
                           style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s;"
                           onmouseover="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--primary-color)';"
                           onmouseout="this.style.background='var(--bg-white)'; this.style.borderColor='var(--border-color)';">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Notes
                        </a>
                    </div>
                    ` : ''}
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

    renderRecordingEmbed() {
        if (!this.meeting.hasRecording) return '';
        
        // Extract video URL from README frontmatter
        const readme = this.meeting.content?.readme || '';
        const videoUrlMatch = readme.match(/video_url:\s*"([^"]+)"/);
        const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null;
        
        if (!videoUrl) return '';
        
        return `
            <div style="margin: 2rem 0; background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="position: relative; padding-bottom: 62%; height: 0; overflow: hidden; border-radius: 8px;">
                    <iframe 
                        src="${videoUrl}" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        scrolling="no"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
    }

    renderContentTabs() {
        const tabs = [];

        // Notes tab (first - default active)
        if (this.meeting.hasNotes) {
            const notes = this.meeting.content?.notes || this.meeting.notes;
            tabs.push({
                id: 'notes',
                label: '📋 Notes',
                content: `
                    <div class="tab-content-notes">
                        ${notes ? `
                            <div class="notes-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color);">
                                ${this.renderMarkdown(notes)}
                            </div>
                        ` : '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">Meeting notes are being compiled and will be available soon.</p>'}
                    </div>
                `
            });
        }

        // Transcript tab
        if (this.meeting.hasTranscript) {
            const transcript = this.meeting.content?.transcript || this.meeting.transcript;
            tabs.push({
                id: 'transcript',
                label: '📝 Transcript',
                content: `
                    <div class="tab-content-transcript">
                        ${transcript ? `
                            <div class="transcript-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color); max-height: 600px; overflow-y: auto;">
                                ${this.renderTranscript(transcript)}
                            </div>
                        ` : '<p class="empty-state" style="text-align: center; color: var(--text-light); padding: 48px;">Transcript is being processed and will be available soon.</p>'}
                    </div>
                `
            });
        }

        // Chat tab
        if (this.meeting.hasChat) {
            const chat = this.meeting.content?.chat || this.meeting.chat;
            tabs.push({
                id: 'chat',
                label: '💬 Chat',
                content: `
                    <div class="tab-content-chat">
                        ${chat ? `
                            <div class="chat-content" style="background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color); max-height: 600px; overflow-y: auto;">
                                ${this.renderChat(chat)}
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
                <div class="tab-nav" style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-color); margin-bottom: 0; overflow-x: auto;">
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
                        <div class="tab-panel ${index === 0 ? 'active' : ''}" data-tab="${tab.id}" style="display: ${index === 0 ? 'block' : 'none'};">
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
                
                const panel = document.querySelector(`.tab-panel[data-tab="${tabId}"]`);
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

    renderChat(chat) {
        // Format chat messages with timestamps and usernames
        // Normalize line endings (remove \r) before splitting
        const lines = chat.replace(/\r/g, '').split('\n').filter(line => line.trim());
        const formattedMessages = lines.map(line => {
            // Match format: "HH:MM:SS	Username:	Message" or "HH:MM:SS	Username:	Reacted to ..."
            const match = line.match(/^(\d{2}:\d{2}:\d{2})\t([^:]+):\t(.+)$/);
            if (match) {
                const [_, timestamp, username, message] = match;
                const isReaction = message.startsWith('Reacted to');
                
                if (isReaction) {
                    return `
                        <div style="margin-bottom: 8px; padding: 6px 12px; background: rgba(0, 51, 204, 0.05); border-radius: 6px; border-left: 2px solid var(--primary-color); font-size: 13px; color: var(--text-light);">
                            <span style="font-size: 11px; color: var(--text-light);">${timestamp}</span>
                            <span style="font-weight: 500; color: var(--primary-color); margin-left: 8px;">${this.escapeHtml(username)}</span>
                            <span style="margin-left: 8px; font-style: italic;">${this.escapeHtml(message)}</span>
                        </div>
                    `;
                } else {
                    return `
                        <div style="margin-bottom: 12px; padding: 10px 14px; background: white; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                <span style="background: var(--primary-color); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">${timestamp}</span>
                                <span style="font-weight: 600; color: var(--primary-color); font-size: 14px;">${this.escapeHtml(username)}</span>
                            </div>
                            <div style="color: var(--text-color); line-height: 1.6; font-size: 14px;">${this.escapeHtml(message)}</div>
                        </div>
                    `;
                }
            }
            return '';
        }).join('');
        
        return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${formattedMessages}</div>`;
    }

    renderTranscript(markdown) {
        // Enhanced transcript rendering with speaker highlighting and timestamps
        let html = this.escapeHtml(markdown);
        
        // Format speaker lines with timestamps: **[HH:MM:SS] Speaker Name:**
        html = html.replace(/\*\*\[(\d{2}:\d{2}:\d{2})\] ([^:]+):\*\*/g, 
            '<div style="margin-top: 16px; margin-bottom: 4px;"><span style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 8px;">$1</span><strong style="color: var(--primary-color); font-size: 15px;">$2</strong></div>');
        
        // Convert newlines to breaks
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n/g, '<br>');
        
        return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; font-size: 14px; color: var(--text-color);">${html}</div>`;
    }

    renderMarkdown(markdown) {
        // Enhanced markdown rendering with better styling
        let html = this.escapeHtml(markdown);
        
        // Normalize line endings first
        html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Remove frontmatter if present (match --- ... --- at start)
        html = html.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        // Remove HTML comments
        html = html.replace(/<!--[\s\S]*?-->/g, '');
        
        // Headers with improved styling
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin-top: 28px; margin-bottom: 14px; color: var(--text-color); font-weight: 600; font-size: 18px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin-top: 36px; margin-bottom: 16px; color: var(--primary-color); font-weight: 700; font-size: 22px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="margin-top: 0; margin-bottom: 24px; color: var(--text-color); font-weight: 700; font-size: 28px;">$1</h1>');
        
        // Bold text
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600; color: var(--text-color);">$1</strong>');
        
        // Italic text
        html = html.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: var(--text-light);">$1</em>');
        
        // Checkboxes with better styling
        html = html.replace(/- \[ \] (.+)$/gm, '<div style="margin: 10px 0; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid var(--border-color);"><input type="checkbox" disabled style="margin-right: 10px; transform: scale(1.1);"> <span style="color: var(--text-color);">$1</span></div>');
        html = html.replace(/- \[x\] (.+)$/gm, '<div style="margin: 10px 0; padding: 8px 12px; background: rgba(0, 51, 204, 0.05); border-radius: 6px; border: 1px solid var(--primary-color);"><input type="checkbox" checked disabled style="margin-right: 10px; transform: scale(1.1);"> <span style="color: var(--text-color); text-decoration: line-through; opacity: 0.7;">$1</span></div>');
        
        // Regular list items (that aren't checkboxes)
        html = html.replace(/^- (?!\[)(.+)$/gm, '<li style="margin: 8px 0; line-height: 1.7; color: var(--text-color);">$1</li>');
        
        // Wrap consecutive list items in ul with better styling
        html = html.replace(/(<li.*?>.*?<\/li>\n?)+/g, '<ul style="margin: 16px 0; padding-left: 28px; list-style-type: disc; background: white; padding: 16px 16px 16px 44px; border-radius: 8px; border: 1px solid var(--border-color);">$&</ul>');
        
        // Blockquotes
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="margin: 16px 0; padding: 12px 20px; border-left: 4px solid var(--primary-color); background: var(--bg-secondary); border-radius: 4px; font-style: italic; color: var(--text-color);">$1</blockquote>');
        
        // Code blocks (inline)
        html = html.replace(/`([^`]+)`/g, '<code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 13px; color: var(--primary-color);">$1</code>');
        
        // Line breaks - convert double newlines to paragraph breaks
        html = html.replace(/\n\n+/g, '</p><p style="margin: 14px 0; line-height: 1.7;">');
        html = html.replace(/\n/g, '<br>');
        
        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<div')) {
            html = '<p style="margin: 14px 0; line-height: 1.7;">' + html + '</p>';
        }
        
        return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: var(--text-color); line-height: 1.7;">${html}</div>`;
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

    getGitHubViewUrl() {
        if (!this.meeting || !this.meeting.githubPath) {
            return '#';
        }

        // View the meeting directory in GitHub
        return `https://github.com/waccamaw/meetings-service/tree/main/${this.meeting.githubPath}`;
    }

    getGitHubEditUrl() {
        if (!this.meeting || !this.meeting.githubPath) {
            return '#';
        }

        // Direct link to edit notes.md
        return `https://github.com/waccamaw/meetings-service/edit/main/${this.meeting.githubPath}/notes.md`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('meetingDetail');
    if (element) {
        new MeetingDetailApp();
    } else {
        console.warn('[Meeting Detail] meetingDetail element not found!');
    }
});
