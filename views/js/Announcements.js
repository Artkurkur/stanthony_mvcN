let allAnnouncements = [];

document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view announcements.");
        window.location.href = "login.html";
        return;
    }

    // Role Validation for Create Announcement Button
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Allowed Roles: 1 (Admin), 4 (Organizer)
            if ([1, 4].includes(parseInt(user.role_id))) {
                const createBtn = document.getElementById("createAnnouncementBtn");
                if (createBtn) {
                    createBtn.style.display = "flex"; // Restore display
                }
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }

    // Fetch announcements from API
    await fetchAnnouncements();

    // "+" navigates to create page
    const createBtn = document.querySelector(".Create-announcement");
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            window.location.href = "CreateAnnouncement.html";
        });
    }

    // Search Functionality
    const searchInput = document.querySelector('.Search');
    const searchForm = document.querySelector('.search-form');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                renderAnnouncements(allAnnouncements);
                return;
            }

            const filtered = allAnnouncements.filter(a =>
                (a.title && a.title.toLowerCase().includes(query)) ||
                (a.message && a.message.toLowerCase().includes(query))
            );
            renderAnnouncements(filtered);
        });
    }
});

// Function to create announcement card
function createAnnouncementCard({ id, title, description }, listId) {
    const list = document.getElementById(listId);

    if (!list) {
        console.error(`List with id "${listId}" not found`);
        return;
    }

    const card = document.createElement("div");
    card.className = "announcement-card";

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    card.innerHTML = `
    <div class="announcement-content">
      <p><b>${escapeHtml(title)}</b></p>
      <p>- ${escapeHtml(description)}</p>
    </div>
    <div class="announcement-actions">
      <button class="details-btn" data-id="${id}">📄</button>
      <i class="fa-solid fa-bars"></i>
    </div>
  `;

    // Add event listener for the details button
    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => {
        console.log('Details button clicked for ID:', id); // Debug log
        console.log('Redirecting to:', `AnnouncementDet.html?id=${id}`); // Debug log
        window.location.href = `AnnouncementDet.html?id=${id}`;
    });

    list.appendChild(card);
}

// Fetch announcements from API
// Fetch announcements from API
async function fetchAnnouncements() {
    const newPostList = document.getElementById("newPostList");
    const prevPostList = document.getElementById("prevPostList");
    const token = localStorage.getItem("token");

    try {
        // Show loading state
        newPostList.innerHTML = '<p class="loading">Loading new posts...</p>';
        prevPostList.innerHTML = '<p class="loading">Loading previous posts...</p>';

        const response = await fetch("http://localhost:8000/api/announcements", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            alert("You don't have permission to view announcements.");
            window.location.href = "mainDashB.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const announcements = await response.json();
        console.log("Fetched announcements:", announcements);

        if (!announcements || announcements.length === 0) {
            allAnnouncements = [];
        } else {
            // Sort by date (newest first)
            announcements.sort((a, b) => new Date(b.date_posted) - new Date(a.date_posted));
            allAnnouncements = announcements;
        }

        renderAnnouncements(allAnnouncements);

    } catch (error) {
        console.error("Error fetching announcements:", error);
        newPostList.innerHTML = `<p class="error">Failed to load announcements. Please try again later.</p>`;
        prevPostList.innerHTML = '';
    }
}

function renderAnnouncements(announcements) {
    const newPostList = document.getElementById("newPostList");
    const prevPostList = document.getElementById("prevPostList");

    // Clear lists
    newPostList.innerHTML = '';
    prevPostList.innerHTML = '';

    if (!announcements || announcements.length === 0) {
        newPostList.innerHTML = '<p class="no-data">No announcements found.</p>';
        return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newPosts = [];
    const prevPosts = [];

    announcements.forEach(announcement => {
        const postDate = new Date(announcement.date_posted);
        const postMonth = postDate.getMonth();
        const postYear = postDate.getFullYear();

        const post = {
            id: announcement.announcement_id,
            title: announcement.title,
            description: announcement.message
        };

        if (postMonth === currentMonth && postYear === currentYear) {
            newPosts.push(post);
        } else {
            prevPosts.push(post);
        }
    });

    if (newPosts.length > 0) {
        newPosts.forEach(post => createAnnouncementCard(post, "newPostList"));
    } else {
        newPostList.innerHTML = '<p class="no-data">No new posts.</p>';
    }

    if (prevPosts.length > 0) {
        prevPosts.forEach(post => createAnnouncementCard(post, "prevPostList"));
    } else {
        prevPostList.innerHTML = '<p class="no-data">No previous posts.</p>';
    }
}