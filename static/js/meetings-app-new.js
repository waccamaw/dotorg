// New renderMeetings method for injection approach
// Replace the renderMeetings() method in meetings-app.js with this

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

    // Find the legacy meetings container
    const legacyContainer = document.getElementById('legacyMeetingsList');
    
    if (!legacyContainer) {
        // Fallback: render standalone if no legacy container exists
        listEl.innerHTML = years.map((year) => {
            const yearMeetings = byYear[year];
            const isExpanded = year === currentYear;
            
            return `
                <div class="meetings-year" data-year="${year}">
                    <h2 class="year-heading accordion-header ${isExpanded ? 'expanded' : ''}" 
                        onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('collapsed');"
                        style="cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; padding: 1rem; margin-bottom: 0; background: var(--bg-secondary, #fff5eb); border-radius: 8px; transition: all 0.2s ease;"
                        onmouseover="this.style.background='#f0e6dc';"
                        onmouseout="this.style.background='var(--bg-secondary, #fff5eb)';">
                        <span>${year} Meetings <span style="color: var(--text-light, #6c757d); font-weight: normal; font-size: 0.9em;">(${yearMeetings.length} API)</span></span>
                        <svg class="accordion-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </h2>
                    <div class="year-meetings ${isExpanded ? '' : 'collapsed'}">
                        ${yearMeetings.map(meeting => this.renderMeetingCard(meeting)).join('')}
                    </div>
                </div>
            `;
        }).join('');
        return;
    }

    // Inject API meetings into existing Hugo accordions or create new ones
    years.forEach(year => {
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
                
                // Update the count in the heading
                const heading = existingYearSection.querySelector('.year-heading span');
                if (heading) {
                    const hugoCount = yearMeetingsContainer.querySelectorAll('.meeting-item').length - yearMeetings.length;
                    const apiCountSpan = document.createElement('span');
                    apiCountSpan.style.cssText = 'color: var(--text-light, #6c757d); font-weight: normal; font-size: 0.9em;';
                    apiCountSpan.textContent = ` (${yearMeetings.length} API + ${hugoCount} legacy)`;
                    heading.appendChild(apiCountSpan);
                }
            }
        } else {
            // Create new accordion for this year (Hugo doesn't have it)
            const isExpanded = year === currentYear;
            const newAccordion = document.createElement('div');
            newAccordion.className = 'meetings-year';
            newAccordion.setAttribute('data-year', year);
            newAccordion.innerHTML = `
                <h2 class="year-heading accordion-header ${isExpanded ? 'expanded' : ''}" 
                    onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('collapsed');"
                    style="cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; padding: 1rem; margin-bottom: 0; background: var(--bg-secondary, #fff5eb); border-radius: 8px; transition: all 0.2s ease;"
                    onmouseover="this.style.background='#f0e6dc';"
                    onmouseout="this.style.background='var(--bg-secondary, #fff5eb)';">
                    <span>${year} Meetings <span style="color: var(--text-light, #6c757d); font-weight: normal; font-size: 0.9em;">(${yearMeetings.length} from API)</span></span>
                    <svg class="accordion-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </h2>
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

    // Clear the API-only container since we're injecting into legacy
    listEl.innerHTML = `
        <div class="info-state" style="background: #e7f3ff; border-color: #0066cc; color: #004080; padding: 1.5rem; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 1rem;">
                ✅ <strong>${this.filteredMeetings.length} API meetings</strong> loaded and merged into the archive below
            </p>
        </div>
    `;
}
