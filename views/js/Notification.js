// Notification.js

// Configuration
const NOTIFICATION_API = 'http://localhost:8000/api/notifications';
const PROFILE_API_URL = 'http://localhost:8000/api/profile';

let currentUser = null;
let allNotifications = []; // Stores fetched items

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function init() {
    fetchAuthenticatedUser().then(() => {
        if (currentUser) {
            setupUI();
            fetchNotifications();
        } else {
            console.warn("User not logged in");
            // Optionally redirect
            // window.location.href = 'login.html';
        }
    });
}

function fetchAuthenticatedUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        return Promise.resolve(); // No token, resolve as not logged in
    }

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
                console.log("Logged in as:", currentUser.username, "Role:", currentUser.role_id);
            }
        })
        .catch(error => {
            console.warn("User fetch error:", error);
            localStorage.removeItem('token'); // Clear invalid token
        });
}

function setupUI() {
    // Inject Modal HTML dynamically if not present, or use existing
    // We'll perform existing setup listeners here

    // Header "Forward" button for Admins
    // Header "Forward" button logic REMOVED. 
    // It is fast-forwarded to individual item modals.

    // Modal Listeners
    const modal = document.getElementById('notification-modal');
    const modalCloseBtn = document.getElementById('modal-close');

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function fetchNotifications() {
    // 1. Fetch Feed (Left Column)
    // Admin gets feed of system activities (Drafts/Source)
    // User gets their own notifications
    const feedUrl = currentUser.role_id == 1
        ? `${NOTIFICATION_API}?mode=feed`
        : NOTIFICATION_API;

    // UI Loading state
    const feedContainer = document.getElementById('feed-list');
    if (feedContainer) feedContainer.innerHTML = '<p style="text-align:center; padding:20px;">Loading...</p>';

    if (document.getElementById('sent-list')) document.getElementById('sent-list').innerHTML = '<p style="text-align:center; padding:20px;">Loading...</p>';

    // Fetch Left Column
    fetch(feedUrl, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const list = Array.isArray(data) ? data : [];
            renderList(list, 'feed-list', 'draft');
            updateBadgeCount();
        })
        .catch(err => {
            console.error("Feed error:", err);
            if (feedContainer) feedContainer.innerHTML = '<p style="text-align:center; color:red;">Failed to load.</p>';
        });

    // 2. Fetch Sent History (Right Column) - ADMIN ONLY
    if (currentUser.role_id == 1) {
        fetch(`${NOTIFICATION_API}?mode=sent`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                renderList(list, 'sent-list', 'sent');
            })
            .catch(err => {
                console.error("Sent history error:", err);
                const sentContainer = document.getElementById('sent-list');
                if (sentContainer) sentContainer.innerHTML = '<p style="text-align:center; color:#999;">No history.</p>';
            });
    } else {
        // Hide right column for non-admin
        const rightSec = document.querySelector('.right-section');
        if (rightSec) rightSec.style.display = 'none';
        const leftSec = document.querySelector('.left-section');
        if (leftSec) {
            leftSec.style.borderRight = 'none';
            leftSec.parentElement.style.padding = '0'; // Use full width
        }
    }
}

function renderList(items, containerId, context) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (items.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No items found.</div>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'notification-row';

        // Ensure type exists
        item.type = item.type || 'info';

        let tagColor = item.category_color || 'tag-blue';
        if (item.type === 'event') tagColor = 'tag-blue';
        if (item.type === 'announcement') tagColor = 'tag-orange';
        if (item.type === 'info') tagColor = 'tag-green';

        // Context specific modifications
        let recipientInfo = '';
        if (context === 'sent' && item.recipient_count) {
            recipientInfo = `<div style="font-size:0.8rem; color:#666; margin-top:5px;"><i class="fa-solid fa-users"></i> Sent to ${item.recipient_count} recipients</div>`;
        }

        row.innerHTML = `
            <div class="icon-wrapper">
                <svg class="bell-icon" viewBox="0 0 512 512" width="30" height="30">
                     <path fill="url(#grad1)" filter="url(#shadow)" d="M256,48C141.1,48,48,141.1,48,256v48c0,13.3-10.7,24-24,24S0,338.7,0,352c0,13.3,10.7,24,24,24h464c13.3,0,24-10.7,24-24s-10.7-24-24-24s-24-10.7-24-24v-48C464,141.1,370.9,48,256,48z" />
                     <circle cx="256" cy="416" r="40" fill="#DAA520" />
                </svg>
            </div>
            <div class="content-wrapper">
                <span class="category-tag ${tagColor}">${item.category_tag || item.type}</span>
                <h3 class="notification-title" style="font-size:1rem;">${item.title}</h3>
                <p class="notification-snippet">${item.message.substring(0, 60)}${item.message.length > 60 ? '...' : ''}</p>
                ${recipientInfo}
            </div>
            <div class="meta-wrapper" style="flex-direction:column; align-items:flex-end; gap:5px;">
                <span class="timestamp" style="font-size:0.75rem;"><i class="fa-regular fa-clock"></i> ${formatDate(item.created_at)}</span>
                 ${context === 'draft' && currentUser.role_id == 1 ? '' : `<button class="close-btn" data-context="${context}"><i class="fa-solid fa-xmark"></i></button>`}
            </div>
        `;

        row.addEventListener('click', (e) => {
            // Check if delete button was clicked
            if (e.target.closest('.close-btn')) {
                deleteNotification(item, row, context);
                e.stopPropagation();
                return;
            }
            // Open Detail (Context aware?)
            openDetailModal(item);
        });

        listContainer.appendChild(row);
    });
}

function renderNotifications() {
    // Legacy stub
}

function openDetailModal(item) {
    const modal = document.getElementById('notification-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-description');
    const tag = document.getElementById('modal-tag');
    const date = document.getElementById('modal-date');

    const modalBody = document.querySelector('#notification-modal .modal-body');

    title.textContent = item.title;
    desc.textContent = item.message;
    tag.textContent = item.category_tag || item.type;
    date.textContent = formatDate(item.created_at);

    // Style tag
    tag.className = 'category-tag';
    if (item.type === 'event') tag.classList.add('tag-blue');
    else if (item.type === 'announcement') tag.classList.add('tag-orange');
    else tag.classList.add('tag-green');

    // Remove existing forward button if any (cleanup)
    const existingBtn = modalBody.querySelector('.forward-modal-btn');
    if (existingBtn) existingBtn.remove();

    // Add Forward Button if Admin
    if (currentUser.role_id == 1) {
        const btn = document.createElement('button');
        btn.className = 'forward-modal-btn';
        btn.innerHTML = '<i class="fa-solid fa-share-from-square"></i> Forward This';
        btn.style.marginTop = '20px';
        btn.style.padding = '10px 20px';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '8px';

        btn.onclick = () => {
            // Keep detail modal open or close? closing to focus on forward task
            closeModal();
            openForwardModal(item);
        };

        modalBody.appendChild(btn);
    }

    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeModal() {
    const modal = document.getElementById('notification-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function updateBadgeCount() {
    const badge = document.querySelector('.notification-badge');
    badge.textContent = allNotifications.length;
    badge.style.display = allNotifications.length ? 'flex' : 'none';
}

function deleteNotification(item, row, context) {
    // Only users delete their notifications
    if (!confirm("Remove this notification?")) return;

    if (context === 'sent') {
        // Delete Group logic
        fetch(`${NOTIFICATION_API}/delete-group`, {
            method: 'POST',
            body: JSON.stringify({
                title: item.title,
                message: item.message,
                type: item.type
            }),
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    // No badge update needed for history
                }, 300);
            })
            .catch(err => alert("Error: " + err.message));
    } else {
        // Standard Delete
        fetch(`${NOTIFICATION_API}/${item.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(() => {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    allNotifications = allNotifications.filter(n => n.id !== item.id);
                    updateBadgeCount();
                }, 300);
            })
            .catch(err => alert("Failed to delete"));
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- ADMIN FORWARD LOGIC ---

function openForwardModal(initialData = null) {
    // Create logic to show a modal for forwarding
    // Since we don't have separate HTML for it, we'll inject a sweetalert or a simple overlay form
    // Or reuse the existing modal structure by replacing body temporarily (simpler for now)

    const existingModalBody = document.querySelector('#notification-modal .modal-body').innerHTML;
    const modalTitle = document.getElementById('modal-title');

    // Save state to restore? Or just simple create a new overlay

    // Pre-fill data
    const preTitle = initialData ? initialData.title : '';
    const preMessage = initialData ? initialData.message : '';

    const modalHtml = `
        <div style="display:flex; flex-direction:column; gap:15px;">
            <div class="input-group">
                <label style="font-weight:bold; display:block; margin-bottom:5px;">Target Audience:</label>
                <select id="forward-target" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
                    <option value="all">All Users</option>
                    <option value="batch">Specific Batch</option>
                    <option value="user">Specific User (ID)</option>
                </select>
            </div>
            
            <div id="batch-input-group" class="input-group" style="display:none;">
                <label style="font-weight:bold; display:block; margin-bottom:5px;">Batch Year:</label>
                <input type="number" id="forward-batch" placeholder="e.g. 2020" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
            </div>

             <div id="user-input-group" class="input-group" style="display:none;">
                <label style="font-weight:bold; display:block; margin-bottom:5px;">Member ID:</label>
                <input type="number" id="forward-userid" placeholder="e.g. 101" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
            </div>

            <div class="input-group">
                <label style="font-weight:bold; display:block; margin-bottom:5px;">Title:</label>
                <input type="text" id="forward-title" value="${preTitle}" placeholder="Notification Title" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
            </div>
            
            <div class="input-group">
                 <label style="font-weight:bold; display:block; margin-bottom:5px;">Message:</label>
                 <textarea id="forward-message" rows="4" placeholder="Type your message..." style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc; font-family:inherit;">${preMessage}</textarea>
            </div>
            
            <button id="send-forward-btn" style="background:#4CAF50; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Send Notification</button>
        </div>
    `;

    // We can use a prompt, but let's build a quick overlay
    const overlay = document.createElement('div');
    overlay.id = 'forward-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '2000';

    overlay.innerHTML = `
        <div style="background:white; padding:30px; border-radius:12px; width:90%; max-width:500px; position:relative;">
            <button onclick="document.getElementById('forward-overlay').remove()" style="position:absolute; top:10px; right:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            <h2 style="margin-bottom:20px;">Forward Announcement</h2>
            ${modalHtml}
        </div>
    `;

    document.body.appendChild(overlay);

    // Logic for dropdown
    const targetSelect = document.getElementById('forward-target');
    const batchGroup = document.getElementById('batch-input-group');
    const userGroup = document.getElementById('user-input-group');

    targetSelect.addEventListener('change', () => {
        batchGroup.style.display = 'none';
        userGroup.style.display = 'none';
        if (targetSelect.value === 'batch') batchGroup.style.display = 'block';
        if (targetSelect.value === 'user') userGroup.style.display = 'block';
    });

    // Logic for Send
    document.getElementById('send-forward-btn').addEventListener('click', () => {
        const payload = {
            target: targetSelect.value,
            value: targetSelect.value === 'batch' ? document.getElementById('forward-batch').value :
                (targetSelect.value === 'user' ? document.getElementById('forward-userid').value : null),
            title: document.getElementById('forward-title').value,
            message: document.getElementById('forward-message').value,
            category: 'info'
        };

        if (!payload.title || !payload.message) {
            alert("Title and Message are required");
            return;
        }

        // Disable button
        const btn = document.getElementById('send-forward-btn');
        btn.disabled = true;
        btn.textContent = "Sending...";

        fetch(NOTIFICATION_API, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                alert("Sent successfully! Count: " + (data.details && data.details.count));
                document.getElementById('forward-overlay').remove();
            })
            .catch(err => {
                alert("Error sending: " + err.message);
                btn.disabled = false;
                btn.textContent = "Send Notification";
            });
    });
}
