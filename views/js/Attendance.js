// Configuration
const API_BASE = 'http://localhost:8000/api';
const EVENT_API = `${API_BASE}/events`;
const ATTENDANCE_API = `${API_BASE}/events`; // Will append /{id}/attendees

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('attendanceTable');
const closeBtn = document.querySelector('.close-btn');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        alert("No event specified.");
        // window.close(); // Browser might block this if not opened by script
        return;
    }

    // Setup UI Listeners
    setupSearch();
    setupClose();

    // Load Data
    loadEventDetails(eventId);
    loadAttendanceList(eventId);
}

function loadEventDetails(id) {
    fetch(`${EVENT_API}/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Event not found");
            return res.json();
        })
        .then(data => {
            if (data.event_id) {
                updateInfoHeader(data);
            }
        })
        .catch(err => {
            console.error("Error loading event:", err);
            document.querySelector('.header h1').textContent = "Event Not Found";
        });
}

function updateInfoHeader(event) {
    // Update Title
    document.querySelector('.header h1').textContent = `Attendance List - ${event.event_name}`;

    // Update Info Section
    const infoItems = document.querySelectorAll('.info-item');
    if (infoItems.length >= 2) {
        // Date
        const dateSpan = infoItems[0];
        dateSpan.innerHTML = `<strong>Date:</strong> ${formatDate(event.event_date)}`;

        // Location
        const locSpan = infoItems[1];
        locSpan.innerHTML = `<strong>Location:</strong> ${event.location || 'N/A'}`;
    }

    // Time Box (Start/End)
    // Assuming event_date includes time or we have separate field. 
    // Backend standard is full datetime usually.
    // Assuming just showing date for now, or parsing time if available.
    const timeBox = document.querySelector('.time-box');
    if (timeBox) {
        const d = new Date(event.event_date);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeBox.innerHTML = `
            <div>Start</div>
            <div>${timeStr}</div>
        `;
    }
}

function loadAttendanceList(id) {
    // Show Loading
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

    fetch(`${API_BASE}/rsvp/event/${id}`)
        .then(res => res.json())
        .then(data => {
            const list = Array.isArray(data) ? data : [];
            renderTable(list);
            updateTotalCount(list.length);
        })
        .catch(err => {
            console.error("Error loading attendance:", err);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Failed to load attendance.</td></tr>';
        });
}

function renderTable(attendees) {
    tableBody.innerHTML = '';

    if (attendees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No attendees yet.</td></tr>';
        return;
    }

    attendees.forEach((person, index) => {
        const row = document.createElement('tr');

        // Gender logic? Use sex column if available, else random or based on name guess?
        // We added batch_year, but gender is user logic.
        // Let's assume 'Male' default or check if we can get it.
        // Using "avatar male" or "avatar female" classes.
        // For now, random or default neutral. Or checking 'sex' if we added it (we didn't yet).
        // I'll default to 'male' class but maybe rotate colors or just generic.
        // Let's check if person.sex exists (if previously part of select * from alumni).
        const genderClass = (person.sex && person.sex.toLowerCase() === 'female') ? 'female' : 'male';
        const avatarIcon = genderClass === 'female' ? '👩' : '👨';

        // Attendance Status Logic
        const isPresent = person.attendance_status && person.attendance_status.toLowerCase() === 'present';

        // Button or Badge
        let actionHtml = '';
        if (isPresent) {
            actionHtml = `<button class="status-badge status-present" disabled style="border:none; cursor:not-allowed;">Present</button>`;
        } else {
            actionHtml = `<button class="status-badge status-going" onclick="markAsPresent(${person.member_id}, ${person.event_id}, this)" style="border:none; cursor:pointer;">Present</button>`;
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="name-cell">
                    ${getAvatarHtml(person)}
                    <span>${person.full_name || 'Unknown'}</span>
                </div>
            </td>
            <td>${person.batch_year || 'N/A'}</td>
            <td>${actionHtml}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getAvatarHtml(person) {
    if (person.profile_picture) {
        // Assume backend returns full URL or relative path. 
        // Adjust path if necessary (e.g., if just filename).
        // Standardizing on 'assets/uploads/' prefix if just filename, or use as is.
        // Based on Profile logic in other files, often stored as full URL or needs prefix.
        // Safest is to check if it starts with http or /.

        let src = person.profile_picture;
        // If it's just a filename, prepend the uploads directory (adjust based on actual storage)
        // Trying to keep it consistent with other pages. 
        // If it is a full URL (cloudinary etc) use as is. 
        // If local file, usually in assets/uploads/

        // Simple check: if no slash, assume local upload
        if (!src.includes('/') && !src.startsWith('http')) {
            src = `../assets/uploads/${src}`;
        }

        return `<img src="${src}" alt="Profile" class="avatar-img" style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-right:10px;">`;
    }

    // Fallback to emoji avatar
    const genderClass = (person.sex && person.sex.toLowerCase() === 'female') ? 'female' : 'male';
    const avatarIcon = genderClass === 'female' ? '👩' : '👨';
    return `<div class="avatar ${genderClass}">${avatarIcon}</div>`;
}


function updateTotalCount(count) {
    // Update Header Count
    const infoItems = document.querySelectorAll('.info-item');
    if (infoItems.length >= 3) {
        infoItems[2].innerHTML = `<strong>Total Present:</strong> ${count}`;
    }

    // Update Button
    const btn = document.querySelector('.total-present-btn');
    if (btn) btn.textContent = `Total Attendees: ${count}`;
}

function setupSearch() {
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');

        for (let row of rows) {
            // Skip loading/empty rows
            if (row.cells.length < 2) continue;

            const nameCell = row.cells[1];
            if (nameCell) {
                const name = nameCell.textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    }); // Fixed closing bracket placement
}

function setupClose() {
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            window.close();
        });
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Mark as Present
function markAsPresent(memberId, eventId, btnElement) {
    if (!memberId || !eventId) return;

    // Optimistic UI update
    const originalText = btnElement.textContent;
    btnElement.textContent = '...';
    btnElement.disabled = true;

    fetch(`${API_BASE}/event-attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_id: eventId,
            member_id: memberId,
            status: 'present'
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            // Success: Update UI
            btnElement.textContent = 'Present';
            btnElement.classList.remove('status-going');
            btnElement.classList.add('status-present');
            btnElement.style.cursor = 'not-allowed';

            // Update Count
            // (Optional: reload list or increment count manually)
            // loadAttendanceList(eventId); // Reloading might be safer but slower.

            // For now, just let it stay marked.
        })
        .catch(error => {
            console.error('Error marking presence:', error);
            alert('Failed to mark. Please try again.');
            btnElement.textContent = originalText;
            btnElement.disabled = false;
        });
}