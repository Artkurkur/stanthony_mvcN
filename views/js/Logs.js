// Logs.js

const logsBody = document.getElementById('logsBody');
const searchInput = document.getElementById('searchInput');
const actionFilter = document.getElementById('actionFilter');

let allLogs = []; // Store fetched logs here

function getActionBadge(action) {
    const actionLower = action.toLowerCase();
    let styleClass = 'view'; // default

    if (actionLower.includes('create')) styleClass = 'create';
    else if (actionLower.includes('update')) styleClass = 'update';
    else if (actionLower.includes('delete')) styleClass = 'delete';
    else if (actionLower.includes('login')) styleClass = 'login';
    else if (actionLower.includes('logout')) styleClass = 'logout';

    return `<span class="badge badge-${styleClass}">${action}</span>`;
}

async function fetchLogs() {
    try {
        logsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading logs...</td></tr>';

        const response = await fetch('http://localhost:8000/api/logs');
        if (!response.ok) throw new Error("Failed to fetch logs");

        const data = await response.json();
        allLogs = data; // Cache logs
        renderLogs(allLogs);

    } catch (error) {
        console.error("Error fetching logs:", error);
        logsBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading logs.</td></tr>';
    }
}

function renderLogs(data) {
    if (!data || data.length === 0) {
        logsBody.innerHTML = '<tr><td colspan="6" class="no-data">No logs found matching your criteria</td></tr>';
        return;
    }

    logsBody.innerHTML = data.map(log => `
        <tr>
            <td>${log.created_at}</td>
            <td><span class="user-id">${log.user_id || 'N/A'}</span></td>
            <td>${log.user_name || 'System'}</td>
            <td>${getActionBadge(log.action)}</td>
            <td>${log.details}</td>
        </tr>
    `).join('');
}

function filterLogs() {
    const searchTerm = searchInput.value.toLowerCase();
    const actionValue = actionFilter.value;

    const filtered = allLogs.filter(log => {
        // Safe null checks
        const userName = (log.user_name || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const userId = (log.user_id ? log.user_id.toString() : '');

        const matchesSearch =
            userName.includes(searchTerm) ||
            action.includes(searchTerm) ||
            details.includes(searchTerm) ||
            userId.includes(searchTerm);

        const matchesAction = actionValue === 'all' || action === actionValue;

        return matchesSearch && matchesAction;
    });

    renderLogs(filtered);
}

searchInput.addEventListener('input', filterLogs);
actionFilter.addEventListener('delete', filterLogs); // Note: 'change' is better for select
actionFilter.addEventListener('change', filterLogs);

// Initial fetch
document.addEventListener("DOMContentLoaded", fetchLogs);