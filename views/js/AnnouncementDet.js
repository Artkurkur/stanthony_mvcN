document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view announcement details.");
        window.location.href = "login.html";
        return;
    }

    // Get announcement ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("No announcement ID provided.");
        return;
    }

    // Fetch announcement details
    await fetchAnnouncementDetails(id, token);
});

async function fetchAnnouncementDetails(id, token) {
    const container = document.getElementById("announcement-container");

    try {
        // Show loading state
        container.innerHTML = '<p style="text-align:center;">Loading announcement details...</p>';

        const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
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
            alert("You don't have permission to view this announcement.");
            window.location.href = "Announcements.html";
            return;
        }

        if (response.status === 404) {
            showError("Announcement not found.");
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const announcement = await response.json();
        console.log("Fetched announcement details:", announcement);

        // Display announcement details
        createAnnouncementDetails(announcement);

    } catch (error) {
        console.error("Error fetching announcement details:", error);
        showError("Failed to load announcement details. Please try again later.");
    }
}

// Global variable to store current announcement data accessible to modal
let currentAnnouncementData = null;

function createAnnouncementDetails(announcement) {
    currentAnnouncementData = announcement; // Store for modal
    const container = document.getElementById("announcement-container");

    // Parse the date_posted field
    const datePosted = new Date(announcement.date_posted);
    const formattedDate = datePosted.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const formattedTime = datePosted.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Check User Role for Edit Button
    let editButtonHtml = '';
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Allowed Roles: 1 (Admin), 4 (Organizer)
            if ([1, 4].includes(parseInt(user.role_id))) {
                editButtonHtml = `<button class="Edit-announcement" title="Edit"></button>`;
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }

    container.innerHTML = `
    <div class="Container-header">
      <div class="Announcement-title">"${escapeHtml(announcement.title)}"</div>

      <div class="details-header">
        <div class="date-time">
          <p><strong>Posted On:</strong> ${formattedDate} at ${formattedTime}</p>
          <p><strong>Category:</strong> ${announcement.category || announcement.event_name || 'General'}</p>
        </div>
        ${editButtonHtml}
      </div>
    </div>

    <label for="Description" class="details-label">Full Details:</label>
    <div class="Description">${escapeHtml(announcement.message)}</div>

    <button class="Back-announcement" id="back-btn">Back to Announcements</button>
  `;

    // Back button event
    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "Announcements.html";
    });

    // Edit button event - Open Modal
    const editBtn = container.querySelector(".Edit-announcement");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            openEditModal(announcement);
        });
    }

    // Setup Modal Event Listeners (Once)
    if (!window.modalListenersAttached) {
        setupModalListeners();
        window.modalListenersAttached = true;
    }
}

function openEditModal(announcement) {
    const modal = document.getElementById("editModalOverlay");

    // Parse date for input fields
    const dateObj = new Date(announcement.date_posted);
    const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Populate Fields
    document.getElementById("edit-title").value = announcement.title;
    document.getElementById("edit-date").value = dateStr; // Just for display/reference usually, or editable if backend supports
    document.getElementById("edit-time").value = timeStr;
    document.getElementById("edit-category").value = announcement.category || 'General';
    document.getElementById("edit-message").value = announcement.message;

    modal.style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModalOverlay").style.display = "none";
}

function setupModalListeners() {
    document.getElementById("cancelBtn").addEventListener("click", closeEditModal);

    document.getElementById("postBtn").addEventListener("click", async (e) => {
        e.preventDefault();

        if (!currentAnnouncementData) return;

        const id = currentAnnouncementData.announcement_id;
        const updatedTitle = document.getElementById("edit-title").value;
        const updatedMessage = document.getElementById("edit-message").value;
        const updatedCategory = document.getElementById("edit-category").value;

        // Note: Date/Time editing might require parsing back to DB format if supported. 
        // For now, we update Title, Message, Category as they are the main content.

        const payload = {
            title: updatedTitle,
            message: updatedMessage,
            category: updatedCategory
            // date_posted: ... if we want to update timestamp
        };

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Announcement updated successfully!");
                closeEditModal();
                // Refresh data
                fetchAnnouncementDetails(id, token);
            } else {
                const err = await response.json();
                alert("Failed to update: " + (err.error || err.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("An error occurred while updating.");
        }
    });

    // Close on click outside
    document.getElementById("editModalOverlay").addEventListener("click", (e) => {
        if (e.target.id === "editModalOverlay") {
            closeEditModal();
        }
    });
}

function showError(message) {
    const container = document.getElementById("announcement-container");
    container.innerHTML = `
    <p style="text-align:center; color:red; font-weight:bold;">
      ${message}
    </p>
    <button class="Back-announcement" onclick="window.location.href='Announcements.html'">
      Back to Announcements
    </button>
  `;
}