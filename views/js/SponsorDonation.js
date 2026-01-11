document.addEventListener('DOMContentLoaded', () => {
    // Elements for the Fundraising Filter (Left Dropdown)
    const fundraisingDropdownBtn = document.getElementById('fundraisingDropdownBtn');
    const fundraisingDropdown = document.getElementById('fundraisingDropdown');
    const selectedFundText = document.getElementById('selectedFundText');

    // Messages
    const SELECTION_VIEW_ID = 'selection-view';
    const MAIN_CONTENT_ID = 'main-content';

    // Elements for Selection Screen
    const selectionView = document.getElementById(SELECTION_VIEW_ID);
    const mainContent = document.getElementById(MAIN_CONTENT_ID);
    const btnDonation = document.getElementById('btn-donation');
    const btnSponsorship = document.getElementById('btn-sponsorship');
    const btnBack = document.getElementById('back-to-selection-btn');

    // State for Transaction Type (Donation vs Sponsorship)
    let selectedTransactionType = null;

    // View Switching Logic
    const showMainContent = (type) => {
        selectedTransactionType = type.toLowerCase(); // 'donation' or 'sponsorship'
        selectionView.style.display = 'none';
        mainContent.style.display = 'flex';
        // Add fade-in animation to main content
        mainContent.style.animation = 'fadeIn 0.5s ease-out';

        console.log(`User selected: ${type}`);
    };

    const showSelectionView = () => {
        selectedTransactionType = null;
        mainContent.style.display = 'none';
        selectionView.style.display = 'flex';
    };

    // Attach Listeners for View Switching
    if (btnDonation) {
        btnDonation.addEventListener('click', () => showMainContent('Donation'));
    }
    if (btnSponsorship) {
        btnSponsorship.addEventListener('click', () => showMainContent('Sponsorship'));
    }
    if (btnBack) {
        btnBack.addEventListener('click', showSelectionView);
    }

    // Elements for the Donation Type Custom Select (Form Dropdown)
    const donationTypeDropdownBtn = document.getElementById('donationTypeDropdownBtn');
    const donationTypeDropdown = document.getElementById('donationTypeDropdown');
    const selectedDonationTypeText = document.getElementById('selectedDonationTypeText');
    const donationTypeInput = document.getElementById('donation-type-input'); // Hidden input for form submission

    // Other Form & Board Elements
    const donationForm = document.getElementById('donation-form');
    const donationAmountInput = document.getElementById('donation-amount');
    const donationListBody = document.getElementById('donation-list-body');
    const batchYearSelect = document.getElementById('batch-year');
    const dateOfDonationInput = document.getElementById('date-of-donation');
    const boardTitle = document.getElementById('board-title');

    // Located near the top of script.js

    // Located near the top of script.js
    // Located near the top of script.js, within the DOMContentLoaded event listener
    const FUND_TYPES = [
        { name: "Alumni Grand Reunion", icon: "../asset/SponsorDonation/AlumniIcon.png", alt: "Alumni Icon", color: "#3F51B5" },
        { name: "Outreach Program", icon: "../asset/SponsorDonation/Outreach.png", alt: "Outreach Icon", color: "#4CAF50" },
        { name: "Scholarship Program", icon: "../asset/SponsorDonation/Scholar.png", alt: "Scholarship Icon", color: "#FF9800" },
        { name: "General Fund", icon: "../asset/SponsorDonation/GenFund.png", alt: "General Fund Icon", color: "#9C27B0" },
        { name: "Infrastructure Fund", icon: "../asset/SponsorDonation/Infras.png", alt: "Infrastructure Icon", color: "#795548" },
        { name: "Events", icon: "../asset/SponsorDonation/Events.png", alt: "Events Icon", color: "#795548" }
    ];

    // NOTE: You'll also need to update how your initial 'All' is handled in the HTML
    // For the HTML fundraising dropdown, the initial "All Fundraising" list item 
    // already uses the "Reload Icon..png" and data-fund="All". This array update helps the script find it.

    // NOTE: You'll also need to update how your initial 'All' is handled in the HTML
    // For the HTML fundraising dropdown, the initial "All Fundraising" list item 
    // already uses the "Reload Icon..png" and data-fund="All". This array update helps the script find it.

    const API_URL = 'http://localhost:8000/api/transactions';
    let allDonations = [];
    let currentDonations = [];
    let currentFilter = 'All';
    let nextId = 1; // Will be updated based on fetched data

    // --- 2. Utility Functions ---

    const formatCurrency = (amount) => {
        // Formats the amount as Philippine Peso
        return '₱' + new Intl.NumberFormat('en-PH').format(amount);
    };

    /**
     * Fetches transactions from the API.
     */
    const fetchTransactions = () => {
        // Show loading state
        donationListBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #777; padding: 20px;">Loading donations...</td></tr>';

        fetch(API_URL)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // Determine if data is wrapped or raw
                const transactions = Array.isArray(data) ? data : (data.data || []);

                if (Array.isArray(transactions)) {
                    // Map backend fields to frontend expected structure
                    allDonations = transactions.map(t => ({
                        id: t.transaction_id,
                        name: t.full_name || t.name, // Use joined full_name or fallback to stored name
                        batch: t.batch_year || 'N/A',
                        type: t.transaction_category || 'General Donation', // Use transaction_category for filtering
                        amount: t.total_amount,
                        status: t.receipt_generated ? 'Confirmed' : 'Pending',
                        // Store original for filtering if needed
                        payment_method: t.method_name
                    }));

                    // Reset to All on load
                    currentDonations = [...allDonations];
                    nextId = allDonations.length > 0 ? Math.max(...allDonations.map(d => d.id)) + 1 : 1;
                    renderDonationList();
                    console.log(`Loaded ${allDonations.length} transactions.`);
                } else {
                    console.error("API response is not an array:", data);
                    donationListBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red; padding: 20px;">Error loading donations.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
                donationListBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red; padding: 20px;">Failed to connect to server.</td></tr>';
            });
    };

    /**
     * Renders the donation list table body based on the currentDonations array.
     */
    const renderDonationList = () => {
        donationListBody.innerHTML = '';

        if (currentDonations.length === 0) {
            const row = donationListBody.insertRow();
            row.innerHTML = `<td colspan="6" style="text-align: center; color: #777; padding: 20px;">No donations found for the **${currentFilter}** fund.</td>`;
            return;
        }

        currentDonations.forEach(donation => {
            const row = donationListBody.insertRow();
            row.innerHTML = `
                <td>${donation.name}</td>
                <td>${donation.batch}</td>
                <td>${donation.type}</td>
                <td>${formatCurrency(donation.amount)}</td>
                <td class="status-${donation.status ? donation.status.toLowerCase() : 'pending'}">${donation.status}</td>
                <td>
                    <button class="action-btn delete-btn" data-id="${donation.id}" title="Delete Donation">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
        });

        // Add event listeners for delete buttons after rendering
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    };

    /**
     * Populates the Batch/Year dropdown with a range of years.
     */
    const populateBatchYearDropdown = () => {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1980; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            batchYearSelect.appendChild(option);
        }
    };

    /**
     * Extracts the displayed text from a list item, ignoring the hidden image alt text.
     * @param {HTMLElement} listItem 
     * @returns {string} The clean, visible text of the fund item.
     */
    const getCleanFundText = (listItem) => {
        // Find the image element
        const img = listItem.querySelector('img');
        let textContent = listItem.textContent.trim();

        if (img) {
            // Remove the image's alt text from the total text content
            const altText = img.alt ? img.alt.trim() : '';
            // Use regex to remove the alt text and any surrounding whitespace from the start
            textContent = textContent.replace(new RegExp(`^${altText}\\s*`), '').trim();
        }
        return textContent;
    };

    /**
     * Populates the custom "Select Type of Donation" dropdown in the form.
     */
    const populateDonationTypeDropdown = () => {
        // Clear previous options
        donationTypeDropdown.innerHTML = '';

        FUND_TYPES.forEach(fundType => {
            const li = document.createElement('li');
            li.className = 'fund-item';
            li.setAttribute('data-fund', fundType.name);
            li.innerHTML = `<img src="${fundType.icon}" alt="${fundType.alt}"> ${fundType.name}`;
            donationTypeDropdown.appendChild(li);
        });

        // Add click listener to the new dropdown
        donationTypeDropdown.addEventListener('click', handleDonationTypeSelection);
    };

    // --- 3. Dropdown Logic ---

    /**
     * Generic function to toggle a dropdown menu.
     * @param {HTMLElement} menu - The ul element (e.g., fundraisingDropdown)
     * @param {HTMLElement} btn - The button element (e.g., fundraisingDropdownBtn)
     */
    const toggleDropdown = (menu, btn) => {
        // Close the other dropdown if it's open
        if (menu.id === 'fundraisingDropdown' && donationTypeDropdown.classList.contains('show')) {
            donationTypeDropdown.classList.remove('show');
            donationTypeDropdownBtn.classList.remove('active');
        } else if (menu.id === 'donationTypeDropdown' && fundraisingDropdown.classList.contains('show')) {
            fundraisingDropdown.classList.remove('show');
            fundraisingDropdownBtn.classList.remove('active');
        }

        menu.classList.toggle('show');
        btn.classList.toggle('active');
    };

    // --- 4. Handler for Fundraising Filter (Left Dropdown) ---

    const handleFundSelection = (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return;

        const newFundType = listItem.dataset.fund;
        const buttonText = getCleanFundText(listItem);

        // 1. Check for Toggling/Resetting
        if (newFundType === currentFilter) {
            // Reset to 'All'
            currentFilter = 'All';
            currentDonations = [...allDonations];

            // Visual Reset
            selectedFundText.textContent = "All Fundraising";
            boardTitle.textContent = "General Donation Board";
            fundraisingDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));
            fundraisingDropdown.querySelector('[data-fund="All"]').classList.add('selected');

        } else {
            // 2. Apply a New Filter
            currentFilter = newFundType;

            if (newFundType === 'All') {
                currentDonations = [...allDonations];
                boardTitle.textContent = "General Donation Board";
                selectedFundText.textContent = buttonText;
            } else {
                currentDonations = allDonations.filter(d => d.type === newFundType);
                boardTitle.textContent = `${newFundType} Board`;
                selectedFundText.textContent = buttonText;
            }

            // Update selection CSS for the list item
            fundraisingDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));
            listItem.classList.add('selected');
        }

        // 3. Re-render the board and close dropdown
        renderDonationList();

        // 4. Update Table Header Color
        const selectedFundObj = FUND_TYPES.find(f => f.name === currentFilter);
        const newHeaderColor = selectedFundObj ? selectedFundObj.color : '#27acf3'; // Default blue if 'All' or not found

        const tableHeaders = document.querySelectorAll('.donation-table thead th');
        tableHeaders.forEach(th => {
            th.style.backgroundColor = newHeaderColor;
            th.style.transition = 'background-color 0.3s ease'; // Smooth transition
        });

        toggleDropdown(fundraisingDropdown, fundraisingDropdownBtn);
    };

    // --- 5. Handler for Donation Type Selection (Form Dropdown) ---

    // Elements for Event Selection
    const eventSelectionContainer = document.getElementById('event-selection-container');
    const eventsList = document.getElementById('events-list');
    const selectedEventIdInput = document.getElementById('selected-event-id');
    let eventsData = []; // Store fetched events

    const fetchEvents = () => {
        fetch('http://localhost:8000/api/events')
            .then(res => res.json())
            .then(response => {
                const data = Array.isArray(response) ? response : (response.data || []);
                eventsData = data; // Store for filtering if needed
                renderEventsList(data);
            })
            .catch(err => {
                console.error("Error fetching events:", err);
                eventsList.innerHTML = '<li style="padding: 10px; color: red;">Error loading events</li>';
            });
    };

    const renderEventsList = (events) => {
        eventsList.innerHTML = '';
        if (events.length === 0) {
            eventsList.innerHTML = '<li style="padding: 10px; color: #777;">No active events found.</li>';
            return;
        }

        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.dataset.id = event.event_id;

            // Only show title as requested
            li.innerHTML = `<span class="event-title">${event.event_name}</span>`;
            eventsList.appendChild(li);
        });
    };

    // Event Delegation for Event Selection (Attach once)
    eventsList.addEventListener('click', (e) => {
        const item = e.target.closest('.event-item');
        if (!item) return;

        // Remove selection from others
        document.querySelectorAll('.event-item').forEach(li => li.classList.remove('selected'));

        // Select clicked item
        item.classList.add('selected');
        selectedEventIdInput.value = item.dataset.id;
        console.log("Selected Event ID:", item.dataset.id);
    });

    const handleDonationTypeSelection = (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return;

        const newDonationType = listItem.dataset.fund;
        const buttonText = getCleanFundText(listItem);

        // 1. Update Hidden Input Value (for form submission)
        donationTypeInput.value = newDonationType;

        // 2. Update Display Text
        selectedDonationTypeText.textContent = buttonText;

        // 3. Update CSS Selection
        donationTypeDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));
        listItem.classList.add('selected');

        // 4. Close Dropdown
        toggleDropdown(donationTypeDropdown, donationTypeDropdownBtn);

        // 5. Handle "Events" Selection
        if (newDonationType === 'Events') {
            eventSelectionContainer.style.display = 'block';
            fetchEvents(); // Fetch when selected
        } else {
            eventSelectionContainer.style.display = 'none';
            selectedEventIdInput.value = ''; // Clear selection
        }
    };

    // --- 6. Other Handlers (Deleted and Form Submit) ---

    const handleDelete = (e) => {
        // ... existing delete logic ...
        const idToDelete = parseInt(e.currentTarget.dataset.id, 10);
        const deleteConfirmed = window.confirm(`Are you sure you want to delete donation ID ${idToDelete}?`);

        if (deleteConfirmed) {
            // NOTE: This mock logic is limited since we don't have delete endpoint in this context usually
            // but preserving the original logic structure:
            const indexToDelete = allDonations.findIndex(d => d.id === idToDelete);
            if (indexToDelete !== -1) {
                allDonations.splice(indexToDelete, 1);
            }
            currentDonations = allDonations.filter(d => currentFilter === 'All' || d.type === currentFilter);
            renderDonationList();
            window.alert(`Donation ID ${idToDelete} deleted.`);
        }
    };

    // Elements for User Type Toggle
    const userTypeSelect = document.getElementById('user-type');
    const alumniFields = document.getElementById('alumni-fields');
    const nonUserFields = document.getElementById('non-user-fields');

    // Elements for Payment Method Toggle
    const paymentMethodSelect = document.getElementById('payment-method');
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const donationAmountGroup = document.getElementById('donation-amount-group');
    const donationAmountInputRef = document.getElementById('donation-amount');

    // Toggle User Fields Logic
    const toggleUserFields = () => {
        const type = userTypeSelect.value;
        if (type === 'Alumni') {
            alumniFields.style.display = 'block';
            nonUserFields.style.display = 'none';
            document.getElementById('fname').required = true;
            document.getElementById('lname').required = true;
            document.getElementById('full-name').required = false;
        } else {
            alumniFields.style.display = 'none';
            nonUserFields.style.display = 'block';
            document.getElementById('fname').required = false;
            document.getElementById('lname').required = false;
            document.getElementById('full-name').required = true;
        }
    };

    // Toggle Payment Method Logic
    const togglePaymentMethod = () => {
        const selectedOption = paymentMethodSelect.options[paymentMethodSelect.selectedIndex];
        if (selectedOption && selectedOption.text.toLowerCase().includes('gcash')) {
            gcashQrContainer.style.display = 'block';
            donationAmountGroup.style.display = 'none';
            donationAmountInputRef.required = false;
            donationAmountInputRef.value = '';
        } else {
            gcashQrContainer.style.display = 'none';
            donationAmountGroup.style.display = 'block';
            donationAmountInputRef.required = true;
        }
    };

    /**
     * Fetches payment methods from the API and populates the dropdown.
     */
    const fetchPaymentMethods = () => {
        fetch('http://localhost:8000/api/payment-methods')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(responseObj => {
                const data = responseObj.data || [];
                paymentMethodSelect.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select Payment Method';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                paymentMethodSelect.appendChild(defaultOption);

                if (Array.isArray(data)) {
                    data.forEach(method => {
                        const option = document.createElement('option');
                        option.value = method.payment_method_id;
                        option.textContent = method.method_name;
                        paymentMethodSelect.appendChild(option);
                    });
                }
                togglePaymentMethod();
            })
            .catch(error => {
                console.error('Error fetching payment methods:', error);
                paymentMethodSelect.innerHTML = '<option disabled>Error loading options</option>';
            });
    };

    // ... existing functions ...

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Ensure a donation type is selected
        if (!donationTypeInput.value) {
            window.alert("Please select a Type of Donation.");
            return;
        }

        // Validate Event Selection if "Events" is chosen
        if (donationTypeInput.value === 'Events' && !selectedEventIdInput.value) {
            window.alert("Please select an Event from the list.");
            return;
        }

        const formData = new FormData(donationForm);
        const rawAmount = formData.get('Donation Amount');
        const amountString = rawAmount ? rawAmount.replace(/,/g, '') : '0';
        const amount = parseInt(amountString, 10);

        const userType = userTypeSelect.value;
        const paymentMethodId = paymentMethodSelect.value;

        if (!paymentMethodId) {
            window.alert("Please select a Payment Method.");
            return;
        }

        // Prepare Payload
        const payload = {
            total_amount: amount,
            received_by: "Online",
            receipt_generated: 1,
            payment_method_id: parseInt(paymentMethodId, 10),
            user_type: userType,
            fname: formData.get('fname'),
            lname: formData.get('lname'),
            name: userType === 'Non-User' ? formData.get('name') : null,
            mobile_number: formData.get('mobile_number'),
            batch_year: formData.get('batch_year'),

            // Mapped Fields
            transaction_type: selectedTransactionType, // 'donation' or 'sponsorship'
            transaction_category: donationTypeInput.value, // Fund Type e.g., 'Alumni Grand Reunion' or 'Events'
            event_id: selectedEventIdInput.value ? parseInt(selectedEventIdInput.value, 10) : null
        };

        // For frontend list update simulation
        let displayName = "";
        let displayBatch = "";

        if (userType === 'Alumni') {
            displayName = `${payload.fname} ${payload.lname}`;
            displayBatch = payload.batch_year;
        } else {
            displayName = payload.name;
            displayBatch = "N/A";
        }

        // Send to Backend
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch('http://localhost:8000/api/transactions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);

                // Success - Update Frontend List Locally
                const newDonation = {
                    id: data.transaction_id || nextId++,
                    name: displayName,
                    batch: displayBatch,
                    type: donationTypeInput.value,
                    amount: amount,
                    status: 'Confirmed'
                };

                allDonations.push(newDonation);

                if (currentFilter === 'All' || currentFilter === newDonation.type) {
                    currentDonations = allDonations.filter(d => currentFilter === 'All' || d.type === currentFilter);
                    renderDonationList();
                }

                window.alert(`Thank you, ${displayName}! Your donation has been recorded.`);

                // Reset Form
                donationForm.reset();
                donationAmountInput.value = '';
                dateOfDonationInput.value = '';
                batchYearSelect.value = '';
                donationTypeInput.value = '';
                selectedDonationTypeText.textContent = 'Choose a Fundraising Program';
                donationTypeDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));

                // Hide Event container
                eventSelectionContainer.style.display = 'none';
                selectedEventIdInput.value = '';

                toggleUserFields();
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Failed to save donation: " + error.message);
            });
    };

    // ... existing handlers ...

    // --- Initialization ---

    fetchTransactions();
    fetchPaymentMethods(); // New fetch call
    populateBatchYearDropdown();
    populateDonationTypeDropdown();
    toggleUserFields(); // Initial run

    // ... existing event listeners ...
    userTypeSelect.addEventListener('change', toggleUserFields);
    paymentMethodSelect.addEventListener('change', togglePaymentMethod);
    // togglePaymentMethod(); // Removed initial call, handled in fetch callback
    // ... existing listeners ...

    const handleAmountInput = (e) => {
        // Ensures only numbers are entered, and formats with commas
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            e.target.value = new Intl.NumberFormat('en-US').format(value);
        }
    };

    const closeDropdownIfClickedOutside = (e) => {
        // Close Fundraising Filter
        if (!fundraisingDropdownBtn.contains(e.target) && !fundraisingDropdown.contains(e.target)) {
            fundraisingDropdown.classList.remove('show');
            fundraisingDropdownBtn.classList.remove('active');
        }
        // Close Donation Type Select
        if (!donationTypeDropdownBtn.contains(e.target) && !donationTypeDropdown.contains(e.target)) {
            donationTypeDropdown.classList.remove('show');
            donationTypeDropdownBtn.classList.remove('active');
        }
    };

    // --- 7. Initialization ---

    // fetchTransactions(); // Already called above
    // populateBatchYearDropdown(); // Already called above
    // populateDonationTypeDropdown(); // Already called above

    // Set the max date for the date picker to today (to prevent future dates)
    dateOfDonationInput.max = new Date().toISOString().split("T")[0];

    // Attach event listeners
    fundraisingDropdownBtn.addEventListener('click', () => toggleDropdown(fundraisingDropdown, fundraisingDropdownBtn));
    fundraisingDropdown.addEventListener('click', handleFundSelection);

    donationTypeDropdownBtn.addEventListener('click', () => toggleDropdown(donationTypeDropdown, donationTypeDropdownBtn));
    // Donation type selection handler is attached inside populateDonationTypeDropdown

    donationAmountInput.addEventListener('input', handleAmountInput);
    donationForm.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', closeDropdownIfClickedOutside);

    // Initial setup for the filter dropdown
    fundraisingDropdown.querySelector('[data-fund="All"]').classList.add('selected');
});