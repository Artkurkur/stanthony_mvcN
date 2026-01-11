// EventManager.js - Combined event management module

// EventManager.js - Combined event management module

function createEventCard(event) {
    const eventsList = document.getElementById("eventsList");

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Create card container
    const card = document.createElement("div");
    card.className = "event-card";
    card.dataset.eventId = event.event_id;

    // Card inner HTML
    card.innerHTML = `
    <div class="event-info">
      <div class="event-text">
        <h3 class="event-title">${escapeHtml(event.event_name)}</h3>
        <div class="event-details">
          <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(event.location)}</span>
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(event.event_date)}</span>
        </div>
       
      </div>

      <!-- Action button on the right -->
      <button class="event-action-btn" title="Event Details" onclick="window.location.href='EventDet.html?id=${event.event_id}'">
        📄
      </button>
    </div>

  `;

    // Append card
    eventsList.appendChild(card);
}

function initializeEvents(events = []) {
    const eventsList = document.getElementById("eventsList");

    // Clear existing content
    eventsList.innerHTML = '';

    if (events.length === 0) {
        eventsList.innerHTML = '<div style="text-align:center; padding:40px; color:#666;"><h3>No events found</h3><p>Create your first event by clicking the + button.</p></div>';
        return;
    }

    // Generate each event
    events.forEach(event => createEventCard(event));

    // Add event when "+" is clicked (if button exists)
    const createBtn = document.querySelector(".Create-event");
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            window.location.href = "CreateNewEvent.html";
        });
    }
}

// Fetch events from API
async function fetchEvents() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No authentication token found");
        return [];
    }

    try {
        console.log("Fetching events from API...");
        const response = await fetch('http://localhost:8000/api/events', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        console.log("Response status:", response.status);

        if (response.status === 401) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return [];
        }

        if (!response.ok) {
            const text = await response.text();
            console.error("API Error Body:", text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const events = await response.json();
        console.log("Events data received:", events);

        if (!Array.isArray(events)) {
            console.error("Expected array but got:", events);
            throw new Error("Invalid data format received from server");
        }

        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        alert(`Error loading events: ${error.message}`);
        return [];
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM Content Loaded - Starting event initialization");

    // Check authentication
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);

    if (!token) {
        console.error("No token found, redirecting to login");
        alert("Please login to view events.");
        window.location.href = "login.html";
        return;
    }

    // Role Validation for Create Event Button
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log("Current User Role:", user.role_id);
            // Allowed Roles: 1 (Admin), 4 (Organizer)
            if ([1, 4].includes(parseInt(user.role_id))) {
                const createBtn = document.getElementById("createEventBtn");
                if (createBtn) {
                    createBtn.style.display = "flex"; // Restore display (assuming flex or block, centered + uses flex usually)
                }
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }

    // Show loading state
    const eventsList = document.getElementById("eventsList");
    console.log("Events list element found:", !!eventsList);

    if (eventsList) {
        eventsList.innerHTML = '<p style="text-align:center; padding: 20px; color: #333; font-size: 16px;">Loading events... Please wait.</p>';
    } else {
        console.error("Could not find element with id 'eventsList'");
        return;
    }

    // Fetch and display events
    console.log("Fetching events...");
    const events = await fetchEvents();
    console.log("Events fetched, count:", events.length);
    console.log("Event data:", events);

    initializeEvents(events);
    console.log("Events initialized");
});