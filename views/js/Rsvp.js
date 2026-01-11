// SVG Icon Constant (Clock with Checkmark)
const ICON_SVG = `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Orange Ring -->
    <circle cx="20" cy="20" r="18" stroke="#F5A623" stroke-width="3" fill="white"/>
    <!-- Inner Grey Circle/Clock Face -->
    <circle cx="20" cy="20" r="14" fill="#6B6B6B" opacity="0.2"/>
    <!-- Clock Hands (Stylized) -->
    <path d="M20 10V20L26 24" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
    <!-- Green Checkmark Circle Overlay -->
    <circle cx="28" cy="28" r="10" fill="white"/>
    <path d="M24 28L26.5 30.5L32 25" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// API Configuration
const EVENTS_API_URL = 'http://localhost:8000/api/events';
const RSVP_API_URL = 'http://localhost:8000/api/rsvp';
const PROFILE_API_URL = 'http://localhost:8000/api/profile';

// State management
let announcements = [];
let currentAnnouncement = null;
let currentUser = null;

// DOM Elements
const dashboardPage = document.getElementById('dashboardPage');
const detailPage = document.getElementById('detailPage');
const announcementList = document.getElementById('announcementList');
const eventDetails = document.getElementById('eventDetails');
const rsvpForm = document.getElementById('rsvpForm');
const eventField = document.getElementById('eventField');
const eventFieldDisplay = document.getElementById('eventFieldDisplay');
const remarksField = document.getElementById('remarks');
const responseField = document.getElementById('response');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize the application
function init() {
    fetchAuthenticatedUser().then(() => {
        fetchAnnouncements();
        setupEventListeners();
    });
}

// Helper for Auth Headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Fetch authenticated user profile
function fetchAuthenticatedUser() {
    return fetch(PROFILE_API_URL, {
        headers: getAuthHeaders()
    })
        .then(response => {
            if (!response.ok) throw new Error("Not logged in");
            return response.json();
        })
        .then(data => {
            if (data.member_id) {
                currentUser = data;
                console.log("Logged in as:", currentUser.username);
            }
        })
        .catch(error => {
            console.warn("User not logged in or profile fetch failed:", error);
        });
}

// Fetch announcements (events) from API
function fetchAnnouncements() {
    // Show loading state if needed
    if (announcementList) announcementList.innerHTML = '<p style="color:black;text-align:center;padding:20px;">Loading events...</p>';

    fetch(EVENTS_API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                // Map API data (events table) to frontend structure
                announcements = data.map(item => ({
                    id: item.event_id,
                    title: item.event_name,
                    subtitle: `Batch ${item.batch_year} Event`,
                    date: item.event_date,
                    venue: item.location || 'TBA',
                    highlights: item.description ? item.description.substring(0, 50) + '...' : 'Join us!',
                    description: item.description || 'No description provided.',
                    fullDescription: item.description || '',
                    icon: ICON_SVG
                }));
                renderAnnouncementList();
            } else {
                console.error('API response is not an array:', data);
                if (announcementList) announcementList.innerHTML = '<p style="color:red;text-align:center;">Error loading events.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            if (announcementList) announcementList.innerHTML = `<p style="color:red;text-align:center;">Failed to connect to server.</p>`;
        });
}

// Render announcement list on dashboard
function renderAnnouncementList() {
    // Safety check
    if (!announcementList) return;

    if (announcements.length === 0) {
        announcementList.innerHTML = '<p style="text-align:center; padding:20px;">No upcoming events found.</p>';
        return;
    }

    announcementList.innerHTML = announcements.map(announcement => `
        <div class="announcement-card group" data-id="${announcement.id}">
             <!-- Bottom Purple Glow Strip Effect -->
            <div class="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#8888ff] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="announcement-icon-box">
                ${announcement.icon}
            </div>
            <div class="announcement-text-group">
                <div class="announcement-title">${announcement.title}</div>
                <div class="announcement-subtitle">${announcement.subtitle}</div>
            </div>
            ${currentUser && [1, 4, 5].includes(currentUser.role_id) ? '<div class="attendance-btn">Attendance</div>' : ''}
            <div class="announcement-view-btn">View</div>
        </div>
    `).join('');
}

// Render event details on detail page
function renderEventDetails(announcement) {
    if (!eventDetails) return;

    eventDetails.innerHTML = `
        <!-- Header: Icon + Title -->
        <div class="flex items-center gap-5 mb-5 md:mb-6">
             <div class="w-[50px] h-[50px] shrink-0">
                ${announcement.icon}
            </div>
            <div class="flex-1 min-w-0">
                <h2 class="detail-title">${announcement.title}</h2>
                <p class="detail-subtitle">${announcement.subtitle}</p>
            </div>
        </div>
        
        <!-- Description -->
        <div class="detail-text-body">
            ${announcement.description}
        </div>

        <!-- Metadata Grid -->
        <div class="detail-meta-row">
            <div><strong class="detail-meta-label">Date:</strong> <span class="detail-meta-value">${announcement.date}</span></div>
            <div><strong class="detail-meta-label">Venue:</strong> <span class="detail-meta-value">${announcement.venue}</span></div>
        </div>

        <!-- Full Description -->
        <div class="detail-text-footer">
            ${announcement.fullDescription}
        </div>
    `;

    // Update the event field in the RSVP form
    if (eventField) eventField.value = announcement.id; // Store ID for submission
    if (eventFieldDisplay) eventFieldDisplay.textContent = `Join This Event - ${announcement.title}`;
}

// Navigate to detail page
function showDetailPage(announcementId) {
    const id = parseInt(announcementId);
    currentAnnouncement = announcements.find(a => a.id === id);

    if (currentAnnouncement) {
        renderEventDetails(currentAnnouncement);

        if (dashboardPage) dashboardPage.classList.remove('active');
        if (detailPage) detailPage.classList.add('active');

        // Reset form
        if (remarksField) remarksField.value = '';
        if (responseField) responseField.value = 'Going';
    }
}

// Navigate back to dashboard
function showDashboard() {
    if (detailPage) detailPage.classList.remove('active');
    if (dashboardPage) dashboardPage.classList.add('active');

    currentAnnouncement = null;
}

// Setup event listeners
function setupEventListeners() {
    // View button clicks
    if (announcementList) {
        announcementList.addEventListener('click', (e) => {
            // Check for Attendance Button click
            if (e.target.classList.contains('attendance-btn')) {
                const card = e.target.closest('.announcement-card');
                if (card) {
                    window.location.href = `Attendance.html?id=${card.dataset.id}`;
                }
                e.stopPropagation(); // Prevent card click
                return;
            }

            // Default card click (View Details)
            const card = e.target.closest('.announcement-card');
            if (card) {
                showDetailPage(card.dataset.id);
            }
        });
    }

    // Cancel/Back button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            showDashboard();
        });
    }

    // Form submission
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentAnnouncement) return;

            if (!currentUser) {
                alert("You must be logged in to RSVP.");
                // Redirect to login if needed: window.location.href = '/login.html';
                return;
            }

            const payload = {
                event_id: currentAnnouncement.id,
                member_id: currentUser.member_id,
                response: responseField ? responseField.value : 'Maybe',
                remarks: remarksField ? remarksField.value.trim() : ''
            };

            // Log to console
            console.log('RSVP Submission Payload:', payload);

            // Send to Backend
            fetch(RSVP_API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }

                    // Show success alert
                    alert(`RSVP submitted successfully for ${currentAnnouncement.title}!`);

                    // Navigate back to dashboard
                    showDashboard();
                })
                .catch(error => {
                    console.error('Error submitting RSVP:', error);
                    alert("Failed to submit RSVP: " + error.message);
                });
        });
    }

    // Close buttons logic
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'reload') {
                window.location.reload();
            } else if (action === 'back') {
                showDashboard();
            } else {
                // Default fallback
                if (detailPage && detailPage.classList.contains('active')) {
                    showDashboard();
                } else {
                    window.location.href = 'mainDashB.html'; // Go back to main dashboard
                }
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
