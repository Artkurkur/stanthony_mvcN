document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH & PROFILE LOGIC ---
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // 1. Auth Check
    if (!token || !userData) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Display Name immediately from localStorage
    const user = JSON.parse(userData);
    const firstName = user.fname || 'Alumni';
    const lastName = user.lname || '';
    const greetingEl = document.getElementById('userGreeting');

    if (greetingEl) {
        greetingEl.textContent = `Hello, ${firstName} ${lastName}!`;
    }

    // 3. Fetch Profile for Image
    fetchUserProfile(token, user.member_id);

    // Logout functionality (if there's a logout button, though not seen in HTML yet, 
    // it's good practice to have the hook ready or just skip if element missing)
    // const logoutBtn = document.getElementById('logoutBtn'); ...
});

async function fetchUserProfile(token, memberId) {
    try {
        const response = await fetch(`http://localhost:8000/api/alumni/${memberId}`, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Handle both structure possibilities seen in other files (data.user or direct data)
            const profile = data.user || data.data || data;

            const imgElement = document.getElementById('userProfileImg');
            if (imgElement && profile.profile_picture) {
                // If the path is relative/local, ensure it points correctly
                // Assuming the backend returns a relative path like "uploads/..." or a full URL
                imgElement.src = profile.profile_picture;
            }
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. MGA VARIABLES PARA SA DROPDOWN AT TABLE
    const dropdown = document.querySelector('.custom-dropdown');
    const header = document.querySelector('.dropdown-header');
    const headerText = header.querySelector('span');
    const listItems = document.querySelectorAll('.dropdown-list li');
    const tableHeaderCells = document.querySelectorAll('.donation-table thead th');
    const downloadBtn = document.getElementById('downloadBtn');

    // 2. LOGIC PARA SA PAGBUKAS NG DROPDOWN
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // 3. LOGIC PARA SA PAGPILI NG REPORT AT PAGPAPALIT NG KULAY
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedReport = item.innerText.trim();
            headerText.innerText = selectedReport;
            dropdown.classList.remove('active');

            // Filter Data
            if (selectedReport === "All Reports") {
                renderTable(allReportsData);
            } else if (selectedReport === "Events") {
                // Events Logic: Show items that are NOT in the standard static list
                const staticPrograms = [
                    "Scholarship Program",
                    "Outreach Program",
                    "Alumni Grand Reunion",
                    "Infrastructure Support",
                    "General Fund"
                ];
                const filteredData = allReportsData.filter(report => !staticPrograms.includes(report.event_name));
                renderTable(filteredData);
            } else {
                // Filter matches event_name exactly for static programs
                const filteredData = allReportsData.filter(report => report.event_name === selectedReport);
                renderTable(filteredData);
            }

            // Variables para sa kulay base sa napili
            let bgColor = "#FDF066"; // Default Yellow
            let textColor = "#000000"; // Default Black text

            if (selectedReport === "Scholarship Program") {
                bgColor = "#FFC0CB"; // Pink
                textColor = "#333333";
            } else if (selectedReport === "Outreach Program") {
                bgColor = "#228B22"; // Dark Green
                textColor = "#FFFFFF";
            } else if (selectedReport === "Alumni Grand Reunion") {
                bgColor = "#007bff"; // Blue
                textColor = "#FFFFFF";
            } else if (selectedReport === "General Fund") {
                bgColor = "#B22222"; // Dark Red
                textColor = "#FFFFFF";
            } else if (selectedReport === "Infrastructure Support") {
                bgColor = "#FFA500"; // Orange
                textColor = "#FFFFFF";
            }

            // I-apply ang kulay sa Table Header Cells
            tableHeaderCells.forEach(th => {
                th.style.backgroundColor = bgColor;
                th.style.color = textColor;
                th.style.transition = "all 0.5s ease";
            });
        });
    });

    // Isara ang dropdown kapag nag-click sa labas
    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const radioButtons = document.querySelectorAll('input[name="exportFormat"]');
    const headerText = document.querySelector('.dropdown-header span');

    // --- VALIDATION LOGIC ---
    // Tinitignan nito kung may napili na sa radio buttons
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            // Kapag may na-check, tatanggalin ang 'disabled' sa button
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = "1";
            downloadBtn.style.cursor = "pointer";
        });
    });

    // --- DOWNLOAD LOGIC ---
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const table = document.querySelector(".donation-table");

            // Hanapin kung ano ang na-check na radio button
            const selectedOption = document.querySelector('input[name="exportFormat"]:checked');

            if (!selectedOption) return; // Guard clause

            const format = selectedOption.value;
            const currentReport = headerText.innerText;
            const fileName = currentReport.replace(/\s+/g, '_');

            if (format === 'excel') {
                const workbook = XLSX.utils.table_to_book(table, { sheet: "Donations" });
                XLSX.writeFile(workbook, `${fileName}_Summary.xlsx`);

            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.text(`${currentReport} Summary`, 14, 15);
                doc.autoTable({ html: '.donation-table', startY: 20 });
                doc.save(`${fileName}_Summary.pdf`);

            } else if (format === 'print') {
                const printContent = table.outerHTML;
                const newWin = window.open("");
                newWin.document.write(`<html><body><h2>${currentReport}</h2>${printContent}</body></html>`);
                newWin.print();
                newWin.close();
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const radioButtons = document.querySelectorAll('input[name="exportFormat"]');
    let lastChecked = null; // Dito itatago kung alin ang huling pinindot

    radioButtons.forEach(radio => {
        radio.addEventListener('click', (e) => {
            // Kung ang pinindot ay ang kasalukuyang naka-check na...
            if (lastChecked === radio) {
                radio.checked = false; // I-uncheck ang radio button
                lastChecked = null;    // I-reset ang tracker

                // IBALIK SA DEFAULT (DISABLED) ANG BUTTON
                downloadBtn.disabled = true;
                downloadBtn.style.opacity = "0.6";
                downloadBtn.style.cursor = "not-allowed";
            } else {
                // Kung bago ang pinindot...
                lastChecked = radio;   // I-save bilang huling pinindot

                // I-ACTIVATE ANG BUTTON
                downloadBtn.disabled = false;
                downloadBtn.style.opacity = "1";
                downloadBtn.style.cursor = "pointer";
            }
        });
    });
});

// --- SEARCH BAR LOGIC ---
const searchInput = document.querySelector('.search-input-wrapper input');
const tableBody = document.querySelector('.donation-table tbody');
const tableElement = document.querySelector('.donation-table');

// Helper function to remove or update the "Total" display if it exists
function updateOrRemoveTotalRow(show, totalAmount = 0) {
    let tfoot = tableElement.querySelector('tfoot');
    if (show) {
        if (!tfoot) {
            tfoot = document.createElement('tfoot');
            tfoot.innerHTML = `
                <tr class="total-row">
                    <td></td>
                    <td id="grand-total-display"></td>
                    <td colspan="3" style="text-align: left; padding-left: 20px; font-weight: bold; color: #333;">Grand Total</td> 
                </tr>
            `;
            tableElement.appendChild(tfoot);
        }
        // Format money
        const formattedTotal = 'Php ' + totalAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        tfoot.querySelector('#grand-total-display').innerText = formattedTotal;
        tfoot.style.display = 'table-footer-group';
    } else {
        if (tfoot) {
            tfoot.style.display = 'none';
        }
    }
}

if (searchInput) {
    searchInput.addEventListener('keyup', () => {
        const filter = searchInput.value.toLowerCase().trim();
        const tableRows = document.querySelectorAll('.donation-table tbody tr');
        const allHeaders = document.querySelectorAll('.donation-table th');

        // Define Column Mappings
        const columnMap = {
            'total donations': 1,
            'total donation': 1,
            'total donors': 2,
            'total donor': 2,
            'status': 3,
            'top donor': 4,
            'top donors': 4
        };

        const targetIndex = columnMap[filter];

        if (targetIndex !== undefined) {
            // --- COLUMN FILTER MODE ---
            // Show all rows
            tableRows.forEach(row => row.style.display = "");

            // Manage Column Visibility
            allHeaders.forEach((th, index) => {
                th.style.display = (index === targetIndex) ? "" : "none";
            });

            // Handle Cells in every row
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((td, index) => {
                    td.style.display = (index === targetIndex) ? "" : "none";
                });
            });

            // Logic for Total Calculation if "Total Donation"
            if (targetIndex === 1) {
                let grandTotal = 0;
                tableRows.forEach(row => {
                    if (row.cells[1]) {
                        const amountText = row.cells[1].innerText;
                        const amountValue = parseFloat(amountText.replace(/[^0-9.-]+/g, ""));
                        if (!isNaN(amountValue)) grandTotal += amountValue;
                    }
                });
                updateOrRemoveTotalRow(true, grandTotal);
            } else {
                updateOrRemoveTotalRow(false);
            }

        } else {
            // --- NORMAL SEARCH (RESET COLUMNS + FILTER ROWS) ---

            // Reset Column Visibility (Show All)
            allHeaders.forEach(th => th.style.display = "");
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(td => td.style.display = "");
            });

            updateOrRemoveTotalRow(false);

            // Filter Rows based on text
            tableRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (filter === "" || text.includes(filter)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        }
    });
}


// Global variable to store report data
let allReportsData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchDonationOverview();
});

async function fetchDonationOverview() {
    const tableBody = document.getElementById('scroll-data');
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/reports/donation-overview', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Store globally
        allReportsData = data || [];

        // Initial Render
        renderTable(allReportsData);

    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>';
    }
}

function renderTable(data) {
    const tableBody = document.getElementById('scroll-data');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        // Format currency
        const amountVal = parseFloat(item.total_donations);
        const totalDonations = 'Php ' + amountVal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Status styling
        let statusColor = item.status === 'Active' ? 'green' : 'gray';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.event_name}</td>
            <td>${totalDonations}</td>
            <td>${item.total_donors}</td>
            <td style="color: ${statusColor}; font-weight: bold;">${item.status}</td>
            <td>${item.top_donor}</td>
        `;
        tableBody.appendChild(row);
    });
}