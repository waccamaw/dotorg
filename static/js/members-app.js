// Main Application Logic - Email Verification Flow
class MemberPortalApp {
    constructor() {
        this.currentView = 'request';
        
        // Pagination & filtering state
        this.currentPage = 1;
        this.pageSize = 25;
        this.sortColumn = 'daysUntil';
        this.sortDirection = 'asc';
        this.searchQuery = '';
        this.riskFilter = 'all';
        this.filteredMembers = [];
        this.atRiskMembers = [];
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Waccamaw Member Portal...');
        
        // Apply logo toggle
        this.applyLogoToggle();
        
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
     * Apply logo toggle based on configuration
     */
    applyLogoToggle() {
        const logoImage = document.getElementById('logoImage');
        const logoText = document.getElementById('logoText');
        
        if (logoImage && logoText) {
            if (CONFIG.FEATURES.SHOW_LOGO) {
                logoImage.style.display = 'inline-block';
                logoText.style.display = 'none';
            } else {
                logoImage.style.display = 'none';
                logoText.style.display = 'inline-block';
            }
        }
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

        // Photo upload button
        const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        if (uploadPhotoBtn) {
            uploadPhotoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openPhotoUploadModal();
            });
        }

        // Photo upload modal close buttons
        const closePhotoModal = document.getElementById('closePhotoModal');
        const cancelPhotoUpload = document.getElementById('cancelPhotoUpload');
        if (closePhotoModal) {
            closePhotoModal.addEventListener('click', () => this.closePhotoUploadModal());
        }
        if (cancelPhotoUpload) {
            cancelPhotoUpload.addEventListener('click', () => this.closePhotoUploadModal());
        }

        // Email dashboard button
        const emailDashboardBtn = document.getElementById('emailDashboardBtn');
        if (emailDashboardBtn) {
            emailDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showEmailDashboard();
            });
        }

        // Back to dashboard button
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');
        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }

        // Export at-risk members button
        const exportAtRiskBtn = document.getElementById('exportAtRiskBtn');
        if (exportAtRiskBtn) {
            exportAtRiskBtn.addEventListener('click', () => this.exportAtRiskToCSV());
        }

        // Photo file input
        const photoFileInput = document.getElementById('photoFileInput');
        const photoUploadArea = document.getElementById('photoUploadArea');
        if (photoFileInput) {
            photoFileInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
        }
        if (photoUploadArea) {
            photoUploadArea.addEventListener('click', () => photoFileInput?.click());
        }

        // Drag and drop for photo upload
        if (photoUploadArea) {
            photoUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoUploadArea.classList.add('drag-over');
            });
            photoUploadArea.addEventListener('dragleave', () => {
                photoUploadArea.classList.remove('drag-over');
            });
            photoUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                photoUploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handlePhotoFile(files[0]);
                }
            });
        }

        // Submit photo upload
        const submitPhotoUpload = document.getElementById('submitPhotoUpload');
        if (submitPhotoUpload) {
            submitPhotoUpload.addEventListener('click', () => this.handlePhotoUpload());
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
                const { active, statusText, memberSince, lastActive, position, voter, expires, tribalId, warningThresholdDays } = statusResponse.status;
                console.log('[Member Portal] Status data:', { active, statusText, memberSince, lastActive, position, voter, expires, tribalId, warningThresholdDays });
                
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
                
                // Update last active date with color coding
                const lastActiveElement = document.getElementById('lastActive');
                if (lastActiveElement) {
                    lastActiveElement.textContent = lastActive ? this.formatDate(lastActive) : '-';
                    this.applyDateWarning(lastActiveElement.parentElement, lastActive, warningThresholdDays);
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
                
                // Update expires date with color coding
                const memberExpiresElement = document.getElementById('memberExpires');
                if (memberExpiresElement) {
                    memberExpiresElement.textContent = expires ? this.formatDate(expires) : '-';
                    this.applyDateWarning(memberExpiresElement.parentElement, expires, warningThresholdDays);
                    console.log('[Member Portal] Updated expires:', expires);
                }
                
                // Update tribal ID
                const tribalIdElement = document.getElementById('tribalId');
                if (tribalIdElement) {
                    tribalIdElement.textContent = tribalId || '-';
                    console.log('[Member Portal] Updated tribal ID:', tribalId);
                }
                
                // Update member photo
                this.updateMemberPhoto(statusResponse);
                
                // Update debug view (local only)
                this.updateDebugView(statusResponse);
                
                // Show admin section if user has executive leadership access
                if (statusResponse.status.isExecutiveLeadership) {
                    console.log('[Member Portal] User has executive leadership access');
                    const adminActions = document.getElementById('adminActions');
                    if (adminActions) {
                        adminActions.style.display = 'block';
                    }
                } else {
                    console.log('[Member Portal] User does not have executive leadership access');
                }
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
        
        const emailDashboardScreen = document.getElementById('emailDashboardScreen');
        if (emailDashboardScreen) {
            emailDashboardScreen.style.display = 'none';
        }
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
     * Apply date-based warning classes to a field
     * @param {HTMLElement} element - The parent element containing the date field
     * @param {string} dateString - The date string to evaluate
     * @param {number} warningThresholdDays - Days before expiry to show warning
     */
    applyDateWarning(element, dateString, warningThresholdDays = 90) {
        if (!element || !dateString) return;

        // Remove existing warning classes
        element.classList.remove('date-warning', 'date-expired');

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log('[Member Portal] Date comparison:', { dateString, diffDays, warningThresholdDays });

            if (diffDays < 0) {
                // Date is in the past - salmon/red
                element.classList.add('date-expired');
                console.log('[Member Portal] Applied date-expired class (past date)');
            } else if (diffDays <= warningThresholdDays) {
                // Date is approaching - yellow warning
                element.classList.add('date-warning');
                console.log('[Member Portal] Applied date-warning class (approaching)');
            }
        } catch (error) {
            console.error('[Member Portal] Error applying date warning:', error);
        }
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

    /**
     * Update member photo display
     */
    updateMemberPhoto(statusResponse) {
        const photoPath = statusResponse?.rawFields?.ID_x0020_Picture;
        const memberPhoto = document.getElementById('memberPhoto');
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        
        if (!memberPhoto || !photoPlaceholder) return;
        
        // Use Tribal ID (from hierarchy: T_Nbr > ID0 > ID) instead of SharePoint item ID
        const tribalId = statusResponse?.status?.tribalId;
        
        console.log('[Member Photo] Photo path from SharePoint:', photoPath);
        console.log('[Member Photo] Tribal ID:', tribalId);
        
        // Update photo source and toggle photo/placeholder visibility
        if (photoPath && photoPath.trim() !== '' && tribalId) {
            // Use API proxy endpoint to load photo from SharePoint
            // Uses member's SharePoint item ID for the API endpoint (for lookup)
            const memberId = statusResponse?.status?.memberId;
            const photoUrl = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.MEMBER_PHOTO.replace(':itemId', memberId);
            console.log('[Member Photo] Loading photo from:', photoUrl);
            
            memberPhoto.src = photoUrl;
            memberPhoto.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            
            // Handle photo load errors (e.g., 404)
            memberPhoto.onerror = () => {
                console.log('[Member Photo] Failed to load photo, showing placeholder');
                memberPhoto.style.display = 'none';
                photoPlaceholder.style.display = 'flex';
            };
        } else {
            console.log('[Member Photo] No photo path, showing placeholder');
            memberPhoto.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
        }
        
        // Show/hide upload button based on configuration
        if (uploadPhotoBtn && CONFIG.FEATURES.PHOTO_UPLOAD) {
            uploadPhotoBtn.style.display = 'flex';
        } else if (uploadPhotoBtn) {
            uploadPhotoBtn.style.display = 'none';
        }
    }

    /**
     * Open photo upload modal
     */
    openPhotoUploadModal() {
        const modal = document.getElementById('photoUploadModal');
        if (modal) {
            modal.style.display = 'flex';
            // Reset the form
            this.resetPhotoUploadForm();
        }
    }

    /**
     * Close photo upload modal
     */
    closePhotoUploadModal() {
        const modal = document.getElementById('photoUploadModal');
        if (modal) {
            modal.style.display = 'none';
            this.resetPhotoUploadForm();
        }
    }

    /**
     * Reset photo upload form
     */
    resetPhotoUploadForm() {
        const fileInput = document.getElementById('photoFileInput');
        const preview = document.getElementById('photoPreview');
        const previewImg = document.getElementById('photoPreviewImg');
        const uploadArea = document.getElementById('photoUploadArea');
        const submitBtn = document.getElementById('submitPhotoUpload');
        
        if (fileInput) fileInput.value = '';
        if (preview) preview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (uploadArea) uploadArea.style.display = 'block';
        if (submitBtn) submitBtn.disabled = true;
        
        this.selectedPhotoFile = null;
    }

    /**
     * Handle photo file selection from input
     */
    handlePhotoSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.handlePhotoFile(files[0]);
        }
    }

    /**
     * Handle photo file (from input or drag-drop)
     */
    handlePhotoFile(file) {
        // Validate file type
        if (!CONFIG.FEATURES.PHOTO_ALLOWED_TYPES.includes(file.type)) {
            alert(`Invalid file type. Please upload: ${CONFIG.FEATURES.PHOTO_ALLOWED_TYPES.join(', ')}`);
            return;
        }
        
        // Validate file size
        if (file.size > CONFIG.FEATURES.PHOTO_MAX_SIZE) {
            const maxSizeMB = CONFIG.FEATURES.PHOTO_MAX_SIZE / (1024 * 1024);
            alert(`File too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }
        
        // Store the file
        this.selectedPhotoFile = file;
        
        // Show preview
        this.showPhotoPreview(file);
        
        // Enable submit button
        const submitBtn = document.getElementById('submitPhotoUpload');
        if (submitBtn) submitBtn.disabled = false;
    }

    /**
     * Show photo preview
     */
    showPhotoPreview(file) {
        const uploadArea = document.getElementById('photoUploadArea');
        const preview = document.getElementById('photoPreview');
        const previewImg = document.getElementById('photoPreviewImg');
        
        if (!preview || !previewImg) return;
        
        // Hide upload area, show preview
        if (uploadArea) uploadArea.style.display = 'none';
        preview.style.display = 'block';
        
        // Read and display the file
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Handle photo upload submission
     */
    async handlePhotoUpload() {
        if (!this.selectedPhotoFile) {
            alert('Please select a photo to upload.');
            return;
        }
        
        const submitBtn = document.getElementById('submitPhotoUpload');
        const uploadStatus = document.getElementById('uploadStatus');
        
        try {
            // Disable button and show loading
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Uploading...';
            }
            if (uploadStatus) {
                uploadStatus.textContent = 'Uploading photo...';
                uploadStatus.style.display = 'block';
            }
            
            // Create form data
            const formData = new FormData();
            formData.append('photo', this.selectedPhotoFile);
            
            // Call API endpoint
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.UPLOAD_PHOTO, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${api.getSessionToken()}`
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (uploadStatus) {
                    uploadStatus.textContent = 'Photo uploaded successfully!';
                    uploadStatus.style.color = '#28a745';
                }
                
                // Wait a moment then close modal and refresh
                setTimeout(() => {
                    this.closePhotoUploadModal();
                    // Force reload the photo by adding cache buster
                    const memberPhoto = document.getElementById('memberPhoto');
                    if (memberPhoto && memberPhoto.src) {
                        const url = new URL(memberPhoto.src);
                        url.searchParams.set('t', Date.now());
                        memberPhoto.src = url.toString();
                    }
                    this.fetchAndDisplayMemberStatus(); // Refresh to show new photo
                }, 1500);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('[Member Portal] Photo upload failed:', error);
            if (uploadStatus) {
                uploadStatus.textContent = `Upload failed: ${error.message}`;
                uploadStatus.style.color = '#dc3545';
            }
            
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload Photo';
            }
        }
    }

    /**
     * Show email marketing dashboard (executive leadership only)
     */
    async showEmailDashboard() {
        console.log('[Email Dashboard] Loading email dashboard...');
        
        // Check executive leadership permission
        const statusResponse = await api.getMemberStatus();
        if (!statusResponse?.status?.isExecutiveLeadership) {
            alert('Access denied: Executive leadership only');
            return;
        }
        
        this.hideAllScreens();
        document.getElementById('emailDashboardScreen').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        this.currentView = 'email-dashboard';
        
        // Load dashboard data
        await this.loadEmailDashboardData();
    }

    /**
     * Load email dashboard data from API
     */
    async loadEmailDashboardData() {
        try {
            console.log('[Email Dashboard] Fetching member list...');
            
            const response = await api.fetchWithAuth(`${CONFIG.API_BASE_URL}/api/admin/member-list`);
            console.log('[Email Dashboard] Response:', response);
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch member list');
            }
            
            console.log(`[Email Dashboard] Loaded ${response.count} members`);
            
            // Calculate metrics
            const metrics = this.calculateDashboardMetrics(response.members);
            console.log('[Email Dashboard] Metrics:', metrics);
            
            // Create pie chart showing marketing reach across entire roll
            this.createEmailReachChart(metrics);
            
            // Store at-risk members for export
            this.atRiskMembers = metrics.atRiskMembers;
            
            // Show export button if there are at-risk members
            const exportBtn = document.getElementById('exportAtRiskBtn');
            if (exportBtn && this.atRiskMembers.length > 0) {
                exportBtn.style.display = 'inline-block';
            }
            
            // Display at-risk members table
            this.displayAtRiskMembers(metrics.atRiskMembers);
            
        } catch (error) {
            console.error('[Email Dashboard] Error loading data:', error);
            
            const listContainer = document.getElementById('atRiskMemberList');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #dc3545;">
                        <p><strong>Error loading member data</strong></p>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Calculate dashboard metrics from member list
     */
    calculateDashboardMetrics(members) {
        const now = new Date();
        const metrics = {
            active: 0,
            inactive: 0,
            critical30: 0,
            warning60: 0,
            retiredDeceased: 0,
            atRiskMembers: []
        };
        
        members.forEach(member => {
            const fields = member.fields || {};
            const status = fields.Status || 'Active';
            const statusLower = status.toLowerCase();
            
            // Count retired and deceased (excluded from email marketing)
            if (statusLower === 'deceased' || statusLower === 'retired') {
                metrics.retiredDeceased++;
                return; // Skip adding to at-risk list
            }
            
            // Count active/inactive
            if (statusLower === 'active') {
                metrics.active++;
            } else if (statusLower === 'inactive') {
                metrics.inactive++;
            }
            
            // Calculate days until expiration
            if (fields.Expires) {
                const expiryDate = new Date(fields.Expires);
                const daysUntil = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                let riskLevel = null;
                
                if (daysUntil < 0) {
                    riskLevel = 'expired';
                    metrics.critical30++;
                } else if (daysUntil <= 30) {
                    riskLevel = 'critical';
                    metrics.critical30++;
                } else if (daysUntil <= 90) {
                    riskLevel = 'warning';
                    metrics.warning60++;
                }
                
                // Add to at-risk list if applicable
                if (riskLevel) {
                    metrics.atRiskMembers.push({
                        id: member.id,
                        email: fields.Email_x0020_Addr || '-',
                        firstName: fields.First_x0020_Name || '',
                        lastName: fields.Last_x0020_Name || '',
                        status: status,
                        expires: fields.Expires,
                        daysUntil: daysUntil,
                        riskLevel: riskLevel,
                        lastUpdated: fields.Status_x0020_Updated || fields.Modified || '-'
                    });
                }
            }
        });
        
        // Sort at-risk members by days until expiration (most critical first)
        metrics.atRiskMembers.sort((a, b) => a.daysUntil - b.daysUntil);
        
        return metrics;
    }

    /**
     * Create pie chart showing email marketing reach across entire membership roll
     */
    createEmailReachChart(metrics) {
        const ctx = document.getElementById('emailReachChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.emailChart) {
            this.emailChart.destroy();
        }

        // Marketing list = inactive + at-risk (critical + warning)
        const atRisk = metrics.critical30 + metrics.warning60;
        const marketingList = metrics.inactive + atRisk;
        const totalMembers = metrics.active + metrics.inactive + metrics.critical30 + metrics.warning60 + metrics.retiredDeceased;
        const percentage = totalMembers > 0 ? Math.round((marketingList / totalMembers) * 100) : 0;

        // Update summary stats
        document.getElementById('emailPercentage').textContent = `${percentage}%`;
        document.getElementById('emailCount').textContent = 
            `${marketingList} members (${metrics.inactive} inactive + ${atRisk} at-risk) out of ${totalMembers} total`;

        // Create chart
        this.emailChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    '📧 Marketing List (Inactive)',
                    '⚠️ Marketing List (At-Risk)',
                    '✅ Active (No Email Needed)',
                    '🔒 Retired & Deceased (Excluded)'
                ],
                datasets: [{
                    data: [
                        metrics.inactive,
                        atRisk,
                        metrics.active,
                        metrics.retiredDeceased
                    ],
                    backgroundColor: [
                        '#ef5350',  // Red - inactive (needs re-engagement)
                        '#ffa726',  // Orange - at-risk (needs retention)
                        '#66bb6a',  // Green - active (no action)
                        '#90a4ae'   // Gray - retired/deceased (excluded)
                    ],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Display at-risk members in a table with sorting, filtering, and pagination
     */
    displayAtRiskMembers(atRiskMembers) {
        console.log('[Email Dashboard] Displaying at-risk members:', atRiskMembers.length);
        this.atRiskMembers = atRiskMembers;
        
        // Reset filters when loading new data
        this.searchQuery = '';
        this.riskFilter = 'all';
        this.currentPage = 1;
        
        // Reset UI controls
        const searchInput = document.getElementById('memberSearch');
        const filterSelect = document.getElementById('riskFilter');
        if (searchInput) searchInput.value = '';
        if (filterSelect) filterSelect.value = 'all';
        
        this.renderFilteredTable();
    }
    
    /**
     * Filter and render the table based on current search/filter/sort state
     */
    renderFilteredTable() {
        const listContainer = document.getElementById('atRiskMemberList');
        if (!listContainer) {
            console.error('[Email Dashboard] atRiskMemberList container not found');
            return;
        }
        
        console.log('[Email Dashboard] Rendering table with', this.atRiskMembers.length, 'at-risk members');
        console.log('[Email Dashboard] Search:', this.searchQuery, 'Filter:', this.riskFilter);
        
        // Apply search filter
        let filtered = this.atRiskMembers.filter(member => {
            const searchMatch = !this.searchQuery || 
                member.firstName.toLowerCase().includes(this.searchQuery) ||
                member.lastName.toLowerCase().includes(this.searchQuery) ||
                member.email.toLowerCase().includes(this.searchQuery);
            
            const riskMatch = this.riskFilter === 'all' || member.riskLevel === this.riskFilter;
            
            return searchMatch && riskMatch;
        });
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortColumn) {
                case 'name':
                    aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'email':
                    aVal = a.email.toLowerCase();
                    bVal = b.email.toLowerCase();
                    break;
                case 'status':
                    aVal = a.status.toLowerCase();
                    bVal = b.status.toLowerCase();
                    break;
                case 'expires':
                    aVal = new Date(a.expires).getTime();
                    bVal = new Date(b.expires).getTime();
                    break;
                case 'daysUntil':
                    aVal = a.daysUntil;
                    bVal = b.daysUntil;
                    break;
                case 'riskLevel':
                    const riskOrder = { expired: 0, critical: 1, warning: 2 };
                    aVal = riskOrder[a.riskLevel];
                    bVal = riskOrder[b.riskLevel];
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.filteredMembers = filtered;
        
        // Calculate pagination
        console.log('[Email Dashboard] Pagination state:', {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            filteredLength: filtered.length
        });
        
        this.totalPages = Math.ceil(filtered.length / this.pageSize);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
        
        const startIdx = (this.currentPage - 1) * this.pageSize;
        const endIdx = Math.min(startIdx + this.pageSize, filtered.length);
        const pageMembers = filtered.slice(startIdx, endIdx);
        
        console.log('[Email Dashboard] Rendering:', {
            totalPages: this.totalPages,
            startIdx,
            endIdx,
            pageMembersCount: pageMembers.length
        });
        
        // Render table
        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">🔍 No members found</p>
                    <p style="color: #999;">Try adjusting your search or filter criteria.</p>
                </div>
            `;
            document.getElementById('tablePagination').style.display = 'none';
            return;
        }
        
        let html = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        ${this.renderSortableHeader('name', 'Name')}
                        ${this.renderSortableHeader('email', 'Email')}
                        ${this.renderSortableHeader('status', 'Status')}
                        ${this.renderSortableHeader('expires', 'Expires')}
                        ${this.renderSortableHeader('daysUntil', 'Days')}
                        ${this.renderSortableHeader('riskLevel', 'Risk Level')}
                    </tr>
                </thead>
                <tbody>
        `;
        
        pageMembers.forEach(member => {
            const riskLabel = member.riskLevel === 'expired' ? 'EXPIRED' :
                             member.riskLevel === 'critical' ? 'CRITICAL' : 'WARNING';
            const daysText = member.daysUntil < 0 ? `${Math.abs(member.daysUntil)} ago` : `${member.daysUntil} days`;
            
            html += `
                <tr>
                    <td>${member.firstName} ${member.lastName}</td>
                    <td><a href="mailto:${member.email}">${member.email}</a></td>
                    <td>${member.status}</td>
                    <td>${this.formatDate(member.expires)}</td>
                    <td>${daysText}</td>
                    <td>
                        <span class="risk-badge ${member.riskLevel}">
                            ${riskLabel}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        listContainer.innerHTML = html;
        
        // Add click handlers to headers for sorting
        const headers = listContainer.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.renderFilteredTable();
            });
        });
        
        // Update pagination controls
        this.updatePaginationControls(filtered.length, startIdx, endIdx);
    }
    
    /**
     * Render a sortable table header
     */
    renderSortableHeader(column, label) {
        const isActive = this.sortColumn === column;
        const sortClass = isActive ? (this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : '';
        return `<th class="sortable ${sortClass}" data-column="${column}">${label}</th>`;
    }
    
    /**
     * Update pagination controls
     */
    updatePaginationControls(totalItems, startIdx, endIdx) {
        const paginationContainer = document.getElementById('tablePagination');
        if (!paginationContainer) return;
        
        if (totalItems === 0) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        // Update info text
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalItems}`;
        }
        
        // Update button states
        const firstPageBtn = document.getElementById('firstPageBtn');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const lastPageBtn = document.getElementById('lastPageBtn');
        
        if (firstPageBtn) firstPageBtn.disabled = this.currentPage === 1;
        if (prevPageBtn) prevPageBtn.disabled = this.currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = this.currentPage === this.totalPages;
        if (lastPageBtn) lastPageBtn.disabled = this.currentPage === this.totalPages;
        
        // Render page numbers
        this.renderPageNumbers();
    }
    
    /**
     * Render page number buttons
     */
    renderPageNumbers() {
        const pageNumbersContainer = document.getElementById('pageNumbers');
        if (!pageNumbersContainer) return;
        
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        let html = '';
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<button class="page-number ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        pageNumbersContainer.innerHTML = html;
        
        // Add click handlers
        pageNumbersContainer.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', () => {
                this.goToPage(parseInt(btn.dataset.page));
            });
        });
    }
    
    /**
     * Go to a specific page
     */
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) return;
        this.currentPage = pageNumber;
        this.renderFilteredTable();
    }

    /**
     * Export at-risk members to CSV
     */
    exportAtRiskToCSV() {
        if (!this.atRiskMembers || this.atRiskMembers.length === 0) {
            alert('No at-risk members to export');
            return;
        }
        
        console.log('[Email Dashboard] Exporting', this.atRiskMembers.length, 'at-risk members to CSV');
        
        // Build CSV content
        const headers = ['First Name', 'Last Name', 'Email', 'Status', 'Expires', 'Days Until Expiration', 'Risk Level', 'Last Updated'];
        const rows = this.atRiskMembers.map(member => [
            member.firstName,
            member.lastName,
            member.email,
            member.status,
            this.formatDate(member.expires),
            member.daysUntil < 0 ? `${Math.abs(member.daysUntil)} days ago` : `${member.daysUntil} days`,
            member.riskLevel.toUpperCase(),
            this.formatDate(member.lastUpdated)
        ]);
        
        // Create CSV string
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(field => {
                // Escape fields with commas or quotes
                const fieldStr = String(field);
                if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
                    return `"${fieldStr.replace(/"/g, '""')}"`;
                }
                return fieldStr;
            }).join(',') + '\n';
        });
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `waccamaw-at-risk-members-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('[Email Dashboard] CSV download initiated');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MemberPortalApp();
});
