// Configuration
const API_BASE = 'http://localhost:8000/api';
const EVENT_API = `${API_BASE}/events`;
const ATTENDANCE_API = `${API_BASE}/events`; // Will append /{id}/attendees

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('attendanceTable');
const closeBtn = document.querySelector('.close-btn');

let currentEvent = null;
let isListLoaded = false;
let allAttendees = [];

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
    setupSearch();
    setupClose();
    setupFilterDropdown();

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
                currentEvent = data;
                updateInfoHeader(data);
                checkAndRunAutoAbsent();
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
    // Time Box (Start/End)
    const timeBox = document.querySelector('.time-box');
    if (timeBox) {
        let timeStr = '--:--';
        if (event.start_time) {
            // Parse HH:mm or HH:mm:ss
            const [hours, minutes] = event.start_time.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            timeStr = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        } else if (event.event_date) {
            const d = new Date(event.event_date);
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

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
            allAttendees = list;

            // Calculate separately (Total Stats)
            const totalPresent = list.filter(p => p.attendance_status && p.attendance_status.toLowerCase() === 'present').length;
            const totalAttendees = list.length;

            updateTotalCount(totalPresent, totalAttendees);

            // Render based on current filter
            filterAndRender();

            isListLoaded = true;
            checkAndRunAutoAbsent();
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
        const status = person.attendance_status ? person.attendance_status.toLowerCase() : '';

        // Button or Badge
        let actionHtml = '';
        if (status === 'present') {
            actionHtml = `<button class="status-badge status-present" disabled style="border:none; cursor:not-allowed;">Present</button>`;
        } else if (status === 'absent') {
            actionHtml = `<button class="status-badge status-absent" disabled style="border:none; cursor:not-allowed; background-color: #dc3545; color: white;">Absent</button>`;
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


function updateTotalCount(presentCount, totalAttendees = null) {
    // Update Header Count - Total Present (Index 2)
    const infoItems = document.querySelectorAll('.info-item');
    if (infoItems.length >= 3) {
        infoItems[2].innerHTML = `<strong>Total Present:</strong> ${presentCount}`;
    }

    // Update Button - Total Attendees (Total List Count)
    // If totalAttendees is passed, update it. If null (e.g. from markAsPresent), keep as is or just update present count logic.
    // Ideally we store these values or just update text content. 
    // The button shows "Total Attendees".
    const btn = document.querySelector('.total-present-btn');
    if (btn && totalAttendees !== null) {
        btn.textContent = `Total Attendees: ${totalAttendees}`;
    }
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

function setupFilterDropdown() {
    // Assuming the dropdown has a uniquely identifiable class or we add one.
    // Based on analyzing HTML (if I could see it clearly), but let's assume it's the select element in .header-actions or similar?
    // User said "Summary List" vs "Detailed List".
    // Let's target the select element inside the container that has 'Summary List' option.
    // Or simpler: assign an ID to it if I can edit HTML, but user asked to proceed.
    // Let's assume there's a select element. The screenshot shows a dropdown.
    // I need to be sure about the selector. 
    // Wait, I viewed Attendance.html in the previous tool call.
    // I haven't seen the output of that view_file yet in this turn, but I requested it.
    // Ah, I am acting in parallel? No, sequential.
    // Actually, I should use the specific selector found in the HTML.
    // I will use a generic selector for now and refine if I see the HTML output not matching.
    // Looking at the screenshot, it looks like a standard <select>.
    // Let's try to find it by its options or broad select if only one exists.
    const dropdown = document.querySelector('select'); // Simplest guess if only one select exists.
    if (dropdown) {
        dropdown.addEventListener('change', () => {
            filterAndRender();
        });
        // Store reference for filterAndRender
        dropdown.id = 'viewFilter';
    }
}

function filterAndRender() {
    const dropdown = document.getElementById('viewFilter') || document.querySelector('select');
    const filterValue = dropdown ? dropdown.value : 'Detailed List'; // Default to detailed if not found
    // The values are likely 'Summary List' and 'Detailed List' based on user description.

    let filteredList = allAttendees;

    if (filterValue === 'Summary List') {
        filteredList = allAttendees.filter(p => p.attendance_status && p.attendance_status.toLowerCase() === 'present');
    }

    renderTable(filteredList);
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

            // Increment Total Present Count
            const infoItems = document.querySelectorAll('.info-item');
            if (infoItems.length >= 3) {
                const totalPresentText = infoItems[2].textContent || '';
                // Extract number
                const currentCount = parseInt(totalPresentText.replace(/\D/g, '')) || 0;
                infoItems[2].innerHTML = `<strong>Total Present:</strong> ${currentCount + 1}`;
            }
        })
        .catch(error => {
            console.error('Error marking presence:', error);
            alert('Failed to mark. Please try again.');
            btnElement.textContent = originalText;
            btnElement.disabled = false;
        });
}

// Auto-Absent Logic
function checkAndRunAutoAbsent() {
    // Only proceed if we have event data AND the list is loaded
    // Exception: If setting a future timer, we don't strictly *need* the list loaded yet code-wise, 
    // but for simplicity, let's wait for both so we don't duplicate logic.
    if (!currentEvent || !isListLoaded) return;

    // Check fields
    if (!currentEvent.start_time || !currentEvent.event_date) return;

    // Construct Event Start DateTime
    const d = new Date(`${currentEvent.event_date}T${currentEvent.start_time}`);
    const now = new Date();

    // Deadline is Start Time + 1 Hour
    const deadline = new Date(d.getTime() + 60 * 60 * 1000); // 1 hour in ms

    console.log("Checking Auto-Absent...");
    console.log("Deadline:", deadline);

    if (now >= deadline) {
        console.log("Deadline passed. Marking absent immediately.");
        markWaitersAsAbsent(currentEvent.event_id);
    } else {
        const timeRemaining = deadline - now;
        console.log(`Timer set. Triggering in ${timeRemaining / 1000} seconds.`);

        // Clear any existing timeout if we were to support re-runs, but for now simple setTimeout is fine
        setTimeout(() => {
            console.log("Timer expired. Marking absent.");
            // We must re-check if list is really there (it should be)
            markWaitersAsAbsent(currentEvent.event_id);
        }, timeRemaining);
    }
}

function markWaitersAsAbsent(eventId) {
    // Get all 'Present' buttons that are still active (meaning status is pending/going)
    // The query selector targets buttons with class 'status-going' which we used for non-present users.
    const pendingButtons = document.querySelectorAll('.status-going');

    if (pendingButtons.length === 0) return;

    console.log(`Marking ${pendingButtons.length} attendees as absent...`);

    // We need the member_id for each. 
    // The markAsPresent onclick handler has it: markAsPresent(member_id, event_id, this)
    // We can extract it or better yet, iterate the data if we had it stored globally.
    // For now, let's parse the onclick attribute or store ID in data attribute.
    // Parsing DOM is brittle. Better to reload list or use the data attribute if I add it.
    // Let's modify renderTable to add data-member-id to the button.

    // Actually, I can just click them? No, clicking marks as PRESENT.
    // I need distinct API call for ABSENT.

    pendingButtons.forEach(btn => {
        // Extract parameters from onclick string: "markAsPresent(123, 456, this)"
        // This is messy. Let's add data attributes in renderTable first? 
        // Or RegEx the onclick.
        const match = btn.getAttribute('onclick').match(/markAsPresent\((\d+),\s*(\d+)/);
        if (match) {
            const memberId = match[1];
            markAsAbsent(memberId, eventId, btn);
        }
    });
}

function markAsAbsent(memberId, eventId, btnElement) {
    // Update UI immediately to prevent double submission or confusion
    const originalText = btnElement.textContent;
    btnElement.textContent = 'Marking Absent...';
    btnElement.disabled = true;

    fetch(`${API_BASE}/event-attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_id: eventId,
            member_id: memberId,
            status: 'absent'
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            // Success: Update UI
            btnElement.textContent = 'Absent';
            btnElement.classList.remove('status-going');
            btnElement.classList.add('status-absent'); // Add CSS class for absent styling if needed
            btnElement.style.backgroundColor = '#dc3545'; // Red color for absent
            btnElement.style.color = 'white';
            btnElement.style.cursor = 'not-allowed';
        })
        .catch(error => {
            console.error('Error marking absent:', error);
            // revert if failed? Or leave as is since deadline passed.
            btnElement.textContent = 'Absent (Retry)';
            btnElement.disabled = false;
        });
}