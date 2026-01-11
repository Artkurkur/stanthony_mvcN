document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view event details.");
        window.location.href = "login.html";
        return;
    }

    // Get event ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("No event ID provided.");
        return;
    }

    // Fetch event details
    await fetchEventDetails(id, token);

    // Setup modal event listeners
    setupModalListeners();
});

async function fetchEventDetails(id, token) {
    // Target the existing sub-banner in EventDet.html
    let container = document.getElementById("eventSubBanner");
    if (!container) {
        console.error("Container 'eventSubBanner' not found");
        return;
    }

    try {
        // Show loading state
        container.innerHTML = '<p style="text-align:center;">Loading event details...</p>';

        const response = await fetch(`http://localhost:8000/api/events/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        // Handle unauthorized/forbidden responses
        if (response.status === 401) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            alert("You don't have permission to view this event.");
            window.location.href = "Events.html";
            return;
        }

        if (response.status === 404) {
            showError("Event not found.");
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const event = await response.json();
        console.log("Fetched event details:", event);

        // Display event details
        createEventDetails(event);

    } catch (error) {
        console.error("Error fetching event details:", error);
        showError("Failed to load event details. Please try again later.");
    }
}

function createEventDetails(event) {
    const container = document.getElementById("eventSubBanner");

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeStr) => {
        if (!timeStr) return 'TBA';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Format datetime
    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Check User Role for Edit Button
    let editButtonHtml = '';
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Allowed Roles: 1 (Admin), 4 (Organizer)
            if ([1, 4].includes(parseInt(user.role_id))) {
                editButtonHtml = `<button class="edit-btn" title="Edit"></button>`;
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }

    // Render HTML
    // Render HTML matching the reference image layout
    container.innerHTML = `
    <div style="position: relative; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 class="Event-title" style="margin: 0; font-size: 1.8rem; font-weight: bold;">${escapeHtml(event.event_name)}</h2>
            ${editButtonHtml}
        </div>

        <div class="event-details-list" style="margin-bottom: 20px;">
            <div class="detail-row"><strong>Location :</strong> ${escapeHtml(event.location)}</div>
            <div class="detail-row"><strong>Deadline :</strong> ${event.contribution_deadline ? formatDate(event.contribution_deadline) : 'No deadline'}</div>
            <div class="detail-row"><strong>Date :</strong> ${formatDate(event.event_date)}</div>
            <div class="detail-row"><strong>Time :</strong> ${formatTime(event.start_time)}${event.end_time ? ' - ' + formatTime(event.end_time) : ''}</div>
            <div class="detail-row"><strong>Hosted By :</strong> ${escapeHtml(event.hosted_by || 'SAA')}</div>
            <div class="detail-row"><strong>Status :</strong> ${escapeHtml(event.status)}</div>
            <div class="detail-row"><strong>Event Type :</strong> ${escapeHtml(event.type_name || event.event_type || 'General')}</div>
            <div class="detail-row"><strong>Batch :</strong> ${escapeHtml(event.batch_year || 'All Batches')}</div>
        </div>

        <div class="event-description-section">
            <h3 style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">Event Description:</h3>
            <div class="description-box" style="border-left: 3px solid #000; padding-left: 15px; margin-left: 5px; font-size: 0.95rem; color: #333;">
                ${escapeHtml(event.description) || 'No description available.'}
            </div>
        </div>

        <div class="button-container" style="text-align: right; margin-top: 30px;">
            <button class="Back-event" id="back-btn">Back to Events</button>
        </div>
    </div>
  `;

    // Back button event
    // The element exists in the just-rendered HTML, so we can find it
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "Events.html";
        });
    }

    // Edit button event - Open modal instead of redirecting
    const editBtn = container.querySelector(".edit-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            openUpdateModal(event);
        });
    }

    // Attend button event
    const attendBtn = document.getElementById("attend-btn");
    if (attendBtn) {
        attendBtn.addEventListener("click", () => {
            window.location.href = `EventAttendance.html?id=${event.event_id}`;
        });
    }
}

function calculateProgress(current, target) {
    if (!target || target === 0) return 0;
    const progress = (parseFloat(current) / parseFloat(target)) * 100;
    return Math.min(progress, 100).toFixed(1);
}

function showError(message) {
    const container = document.getElementById("eventSubBanner") || document.body;
    container.innerHTML = `
    <p style="text-align:center; color:red; font-weight:bold;">
      ${message}
    </p>
    <button class="Back-event" onclick="window.location.href='Events.html'">
      Back to Events
    </button>
  `;
}

// Modal Functions
function openUpdateModal(event) {
    const modal = document.getElementById("updateEventModal");
    const modalTitleDisplay = document.getElementById("modalTitleDisplay");

    // Populate the modal title display
    modalTitleDisplay.textContent = event.event_name || "Event Name";

    // Populate form fields with current event data
    document.getElementById("eventName").value = event.event_name || "";
    document.getElementById("eventDescription").value = event.description || "";
    document.getElementById("eventDate").value = event.event_date || "";
    document.getElementById("contributionDeadline").value = event.contribution_deadline || "";
    document.getElementById("startTime").value = event.start_time || "";
    document.getElementById("endTime").value = event.end_time || "";
    document.getElementById("eventType").value = event.type_name || event.event_type || "";
    document.getElementById("location").value = event.location || "";
    document.getElementById("batch").value = event.batch_year || "";

    // Show modal
    modal.style.display = "block";

    // Update modal title display when event name changes
    document.getElementById("eventName").addEventListener("input", (e) => {
        modalTitleDisplay.textContent = e.target.value || "Event Name";
    });
}

function closeUpdateModal() {
    const modal = document.getElementById("updateEventModal");
    modal.style.display = "none";
}

function setupModalListeners() {
    // Close modal when clicking X
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeUpdateModal);
    }

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("updateEventModal");
        if (event.target === modal) {
            closeUpdateModal();
        }
    });

    // Cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeUpdateModal);
    }

    // Handle form submission
    const updateForm = document.getElementById("updateEventForm");
    if (updateForm) {
        updateForm.addEventListener("submit", handleUpdateEvent);
    }
}

async function handleUpdateEvent(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!token || !eventId) {
        alert("Authentication error. Please login again.");
        return;
    }

    // Gather form data
    const formData = {
        event_name: document.getElementById("eventName").value,
        description: document.getElementById("eventDescription").value,
        event_date: document.getElementById("eventDate").value,
        contribution_deadline: document.getElementById("contributionDeadline").value || null,
        start_time: document.getElementById("startTime").value,
        end_time: document.getElementById("endTime").value || null,
        event_type: document.getElementById("eventType").value,
        location: document.getElementById("location").value,
        batch_year: document.getElementById("batch").value || null
    };

    try {
        const response = await fetch(`http://localhost:8000/api/events/${eventId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.status === 401) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert("Event updated successfully!");
        closeUpdateModal();

        // Refresh the page to show updated data
        await fetchEventDetails(eventId, token);

    } catch (error) {
        console.error("Error updating event:", error);
        alert("Failed to update event. Please try again.");
    }
}