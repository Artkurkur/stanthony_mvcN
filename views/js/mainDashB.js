// mainDashB.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Redirect to login page if token or user data is missing
  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  // 🔹 Check if JWT is expired before using it
  if (isTokenExpired(token)) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return;
  }

  // Parse stored user info
  const user = JSON.parse(userData);

  // Display user's name and role
  const nameDisplay = document.getElementById("userName");
  const roleDisplay = document.getElementById("userRole");

  if (nameDisplay) nameDisplay.textContent = `${user.fname} ${user.lname}`;
  if (roleDisplay) {
    // Role mapping based on your roles table
    const roles = {
      1: "Admin",
      2: "Guest",
      3: "Member",
      4: "Organizer",
      5: "Officer",
      6: "School Staff",
      7: "Cashier",
    };
    roleDisplay.textContent = roles[user.role_id] || "Member";
  }

  // ✅ Apply RBAC - Show/Hide cards based on role
  applyRoleBasedAccess(user.role_id);

  // Attach logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Call logout API to log action
      fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).finally(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
      });
    });
  }

  // Optional: fetch fresh user data from backend using JWT
  fetchUserProfile(token, user.member_id);

  // Check for Unread Notifications
  checkForUnreadNotifications(token);
});

function checkForUnreadNotifications(token) {
  // Mode=user ensures we get personal notifications even if Admin
  fetch('http://localhost:8000/api/notifications?mode=user', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        // Count unread (is_read is 0 or "0")
        const unreadCount = data.filter(n => n.is_read == 0).length;

        if (unreadCount > 0) {
          // 1. Trigger Push/Toast
          showPushNotification(unreadCount);

          // 2. Update UI Badge on Card
          const cardText = document.querySelector('.notification-card .card-text strong');
          if (cardText) {
            const badge = document.createElement('span');
            badge.style.color = 'white';
            badge.style.backgroundColor = 'red';
            badge.style.borderRadius = '50%';
            badge.style.padding = '2px 6px';
            badge.style.marginLeft = '8px';
            badge.style.fontSize = '12px';
            badge.textContent = unreadCount;
            cardText.appendChild(badge);
          }
        }
      }
    })
    .catch(err => console.error("Notification check failed:", err));
}

function showPushNotification(count) {
  // Check if browser supports notifications
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    createNotification(count);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        createNotification(count);
      }
    });
  }
}

function createNotification(count) {
  new Notification("SAA Reunite", {
    body: `You have ${count} unread notification${count > 1 ? 's' : ''}.`,
    icon: "../asset/LogoSAA.png"
  });
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Apply Role-Based Access Control to dashboard cards
 * @param {number} roleId - User's role_id
 */
function applyRoleBasedAccess(roleId) {
  // Get all category cards
  const cards = document.querySelectorAll('.category-card');

  // Define which cards to show for each role
  const rolePermissions = {
    1: ['events', 'announcements', 'fundraising', 'reports', 'account', 'rsvp', 'notification', 'logs'], // Admin - All
    2: [], // Guest - None
    3: ['events', 'announcements', 'fundraising', 'rsvp', 'notification'], // Member
    4: ['events', 'announcements', 'fundraising', 'reports', 'rsvp', 'notification'], // Organizer
    5: ['events', 'announcements', 'fundraising', 'reports', 'rsvp', 'notification'], // Officer
    6: ['events', 'announcements', 'fundraising', 'rsvp', 'notification'], // School Staff
    7: ['events', 'announcements', 'fundraising', 'reports', 'rsvp', 'notification'], // Cashier
  };

  // Get allowed cards for this role
  const allowedCards = rolePermissions[roleId] || [];

  // Map card buttons to their identifiers
  const cardMapping = {
    'EVENTS': 'events',
    'ANNOUNCEMENTS': 'announcements',
    'FUNDRAISING': 'fundraising',
    'REPORTS': 'reports',
    'ACCOUNT MANAGEMNT': 'account',
    'RSVP': 'rsvp',
    'NOTIFICATION': 'notification',
    'LOGS': 'logs'
  };

  // Hide/Show cards based on permissions
  cards.forEach(card => {
    const button = card.querySelector('button');
    if (button) {
      const buttonText = button.textContent.trim();
      const cardIdentifier = cardMapping[buttonText];

      if (cardIdentifier && !allowedCards.includes(cardIdentifier)) {
        card.style.display = 'none'; // Hide card
      } else {
        card.style.display = ''; // Show card
      }
    }
  });

  // Show message if user is Guest (no cards visible)
  if (roleId === 2) {
    const dashboardBody = document.querySelector('.dashboard-body');
    const categoryContainer = document.querySelector('.category-container');

    if (categoryContainer && dashboardBody) {
      // Create a message for guests
      const guestMessage = document.createElement('div');
      guestMessage.style.textAlign = 'center';
      guestMessage.style.padding = '40px';
      guestMessage.style.color = '#666';
      guestMessage.innerHTML = `
        <h3>Welcome, Guest!</h3>
        <p>Your account is pending approval. Please contact the administrator for access.</p>
      `;
      categoryContainer.innerHTML = '';
      categoryContainer.appendChild(guestMessage);
    }
  }
}

/**
 * Fetches the user's profile from the protected API endpoint
 * @param {string} token - JWT token
 * @param {number} memberId - user's member_id
 */
async function fetchUserProfile(token, memberId) {
  try {
    const response = await fetch(`http://localhost:8000/api/alumni/${memberId}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userProfile = await response.json();

      // Update displayed data if needed (optional)
      console.log("Fetched profile:", userProfile);
      // Example: document.getElementById("userEmail").textContent = userProfile.email;

    } else if (response.status === 401 || response.status === 403) {
      alert("Session expired or invalid. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    } else {
      console.warn("Failed to fetch profile:", response.status);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}