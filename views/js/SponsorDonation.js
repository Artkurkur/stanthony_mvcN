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
    const btnInKind = document.getElementById('btn-InKind');
    const inKindFields = document.getElementById('in-kind-fields');
    const inKindDescInput = document.getElementById('inkind-item-desc');
    const btnContribution = document.getElementById('btn-contribution');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const proceedPaymentBtn = document.getElementById('proceed-payment-btn');
    const cartBody = document.getElementById('cart-body');
    const cartTotalElement = document.getElementById('cart-total');
    const cartContainer = document.getElementById('cart-container');
    let cart = [];

    // State for Transaction Type (Donation vs Sponsorship)
    let selectedTransactionType = null;

    // View Switching Logic
    const showMainContent = (type) => {
        selectedTransactionType = type;
        selectionView.style.display = 'none';
        mainContent.style.display = 'flex';
        mainContent.style.animation = 'fadeIn 0.5s ease-out';

        // In-Kind Logic
        const isInKind = type === 'In-Kind';
        if (inKindFields) {
            inKindFields.style.display = isInKind ? 'block' : 'none';
            // Also Change Label for Amount -> Estimated Value
            const amountLabel = document.querySelector('label[for="donation-amount"]');
            if (amountLabel) amountLabel.textContent = isInKind ? 'Estimated Value :' : 'Donation Amount :';

            // Hide standard Dropdown for In-Kind? Data says user wants ONLY description form changes content.
            // Maybe we hide the "Fundraising Program" dropdown or rename it?
            // User said: "In-kind card... content of the form will change".
            // Let's hide the standard Type dropdown for In-Kind to simplify.
            // const typeContainer = document.querySelector('.custom-select-container');
            // if (typeContainer) typeContainer.style.display = isInKind ? 'none' : 'block';

            // But validation checks for donationTypeInput.value. 
            // We should set it manually or keep it.
            // Let's keep it visible for now as In-Kind for "Outreach Program" is valid.
        }

        // Filter Board by Card Type
        if (type) {
            currentDonations = allDonations.filter(d => d.transaction_type && d.transaction_type.toLowerCase() === type.toLowerCase());
            renderDonationList();
            if (boardTitle) boardTitle.textContent = `${type} Transactions`;

            // Reset Category Filter Visuals
            currentFilter = 'All';
            if (selectedFundText) selectedFundText.textContent = "All Fundraising";
            if (fundraisingDropdown) {
                fundraisingDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));
                const allItem = fundraisingDropdown.querySelector('[data-fund="All"]');
                if (allItem) allItem.classList.add('selected');
            }
        }

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
    if (btnInKind) {
        btnInKind.addEventListener('click', () => showMainContent('In-Kind'));
    }
    if (btnContribution) {
        btnContribution.addEventListener('click', () => showMainContent('Contribution'));
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
                        payment_method: t.method_name,
                        payment_method: t.method_name,
                        receipt_url: t.receipt_url,
                        transaction_type: t.transaction_type // Store type for filtering
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
                    ${donation.receipt_url || donation.receipt_image ? `
                        <button class="action-btn view-receipt-btn" data-url="${donation.receipt_url || donation.receipt_image}" title="View Receipt">
                            <i class="fas fa-file-image" style="color: #4CAF50;"></i>
                        </button>
                    ` : ''}
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

        // Add listeners for view receipt buttons
        document.querySelectorAll('.view-receipt-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // Handle button or icon click (closest button logic)
                const btn = e.target.closest('button');
                const url = btn.getAttribute('data-url');
                if (url) {
                    // If it's a relative path from DB like "../asset/...", we need to make sure it resolves correctly from the current page's perspective.
                    // Current page is http://localhost:8000/views/SponsorDonation.html (maybe?)
                    // Or http://localhost:8000/
                    // The DB path is relative to the PHP script execution context usually.
                    // If the saved path is "../asset/uploads/receipts/x.png", and we are in `views/`, then `../asset` works if `views` and `asset` are siblings in root.
                    // public/ ... actually user said "c:\xampp\htdocs\stanthony_mvcN\views\SponsorDonation.html".
                    // And assets are in "c:\xampp\htdocs\stanthony_mvcN\asset".
                    // So `../asset` is correct from `views/`.

                    // However, Base64 strings (for local preview before refresh) act as Data URIs.
                    window.open(url, '_blank');
                }
            });
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
                // Return to all of CURRENT Card Type
                currentDonations = allDonations.filter(d => d.transaction_type && d.transaction_type.toLowerCase() === selectedTransactionType.toLowerCase());
                boardTitle.textContent = `${selectedTransactionType} Transactions`;
                selectedFundText.textContent = buttonText;
            } else {
                // Filter by Card Type AND Category (d.type is Category)
                currentDonations = allDonations.filter(d =>
                    d.transaction_type && d.transaction_type.toLowerCase() === selectedTransactionType.toLowerCase() &&
                    d.type === newFundType
                );

                boardTitle.textContent = `${newFundType} (${selectedTransactionType})`;
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
    const receiptUploadGroup = document.getElementById('receipt-upload-group');
    const receiptUploadInput = document.getElementById('receipt-upload');


    // Get Logged In User
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;
    // Roles: 1=Admin, 7=Cashier. Others are "Normal"
    const isStaff = currentUser && (currentUser.role_id === 1 || currentUser.role_id === 7);

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

        // Apply Role-Based Overrides
        if (!isStaff) {
            // For Normal Users: ALWAYS Hide Amount, Show Receipt Upload
            donationAmountGroup.style.display = 'none';
            donationAmountInputRef.required = false;
            receiptUploadGroup.style.display = 'block';
            receiptUploadInput.required = true;
        } else {
            // Admin/Cashier: 
            // Show Receipt Upload ONLY if GCash/QR is selected
            if (selectedOption && selectedOption.text.toLowerCase().includes('gcash')) {
                receiptUploadGroup.style.display = 'block';
                receiptUploadInput.required = false; // Optional

                // Also ensure Amount is visible for Staff even if GCash? 
                // User didn't ask, but logically they need to enter amount.
                // However, the top logic sets donationAmountGroup.style.display = 'none' for GCash.
                // If we leave it hidden, amount is 0. 
                // Users usually fix this by entering amount *first* then selecting method?
                // Or maybe we should unhide it. 
                // For now, I'll stick specifically to the User's request about Receipt Upload.
            } else {
                receiptUploadGroup.style.display = 'none';
                receiptUploadInput.required = false;
            }
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
                        // Filter Logic:
                        // If NOT staff, do NOT show "Cash"
                        // We check if method_name contains "Cash" AND does NOT contain "GCash" (assuming GCash is allowed)
                        // Or strictly: Only show "GCash" or "QR" for normal users.
                        // The user said: "directly show the QR code donation type... The 'Cash and QR code' option is only visible to admin..." 
                        // It seems "Cash and QR code" might be ONE option or distinct. 
                        // Let's assume standard names "Cash" and "GCash".

                        const isCash = method.method_name.toLowerCase().trim() === 'cash';

                        if (!isStaff && isCash) {
                            return; // Skip Cash for normal users
                        }

                        const option = document.createElement('option');
                        option.value = method.payment_method_id;
                        option.textContent = method.method_name;
                        paymentMethodSelect.appendChild(option);
                    });
                }

                // Select the first available option automatically for normal users if only one exists (or just the first one)
                if (!isStaff && paymentMethodSelect.options.length > 1) {
                    paymentMethodSelect.selectedIndex = 1; // Index 0 is disabled default
                }

                togglePaymentMethod();
            })
            .catch(error => {
                console.error('Error fetching payment methods:', error);
                paymentMethodSelect.innerHTML = '<option disabled>Error loading options</option>';
            });
    };

    // --- Cart Functions ---
    const renderCart = () => {
        cartBody.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.amount;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 8px;">
                    <div style="font-weight:bold;">${item.category}</div>
                    <div style="font-size:12px;color:#777;">
                        ${item.type} 
                        ${item.eventName ? `(${item.eventName})` : ''}
                        ${item.item_description ? `<br/>Desc: ${item.item_description}` : ''}
                    </div>
                </td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(item.amount)}</td>
                <td style="padding: 8px; text-align: center;">
                    <button type="button" class="action-btn delete-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            cartBody.appendChild(row);
        });

        // Update Total
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' });
        cartTotalElement.textContent = formatter.format(total);

        // Show/Hide Cart Container
        if (cart.length > 0) {
            cartContainer.style.display = 'block';
        } else {
            cartContainer.style.display = 'none';
        }
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        renderCart();
    };

    const validateAndGetItem = () => {
        if (!donationTypeInput.value) {
            window.alert("Please select a Type of Fundraising Program.");
            return null;
        }

        if (donationTypeInput.value === 'Events' && !selectedEventIdInput.value) {
            window.alert("Please select an Event from the list.");
            return null;
        }

        const formData = new FormData(donationForm);
        const rawAmount = formData.get('Donation Amount');
        const amountString = rawAmount ? rawAmount.replace(/,/g, '') : '0';
        const amount = parseInt(amountString, 10);

        if (!amount || amount <= 0) {
            window.alert("Please enter a valid amount.");
            return null;
        }

        // Fee ID Mapping
        let feeId;
        switch (selectedTransactionType) {
            case 'Sponsorship': feeId = 1; break;
            case 'Donation': feeId = 2; break;
            case 'In-Kind': feeId = 3; break;
            case 'Contribution': feeId = 4; break;
            default: feeId = 2;
        }

        // Capture Description
        let itemDesc = null;
        if (selectedTransactionType === 'In-Kind' || selectedTransactionType === 'In-kind') {
            itemDesc = inKindDescInput.value;
            if (!itemDesc) {
                window.alert("Please enter the Item Description.");
                return null;
            }
        } else if (selectedTransactionType === 'Contribution') {
            itemDesc = "Alumni Contribution";
        }

        return {
            type: selectedTransactionType,
            category: donationTypeInput.value,
            fee_id: feeId,
            amount: amount,
            item_description: itemDesc,
            event_id: selectedEventIdInput.value ? parseInt(selectedEventIdInput.value, 10) : null,
            eventName: selectedEventIdInput.dataset.eventName || ''
        };
    };

    const handleAddToCart = () => {
        const item = validateAndGetItem();
        if (item) {
            cart.push(item);
            renderCart();
            donationAmountInput.value = '';
        }
    };

    const handleProceedPayment = async () => {
        if (cart.length === 0) {
            window.alert('Cart is empty!');
            return;
        }

        const formData = new FormData(donationForm);
        const userType = document.getElementById('user-type').value;
        const paymentMethodId = paymentMethodSelect.value;
        const selectedMethodName = paymentMethodSelect.options[paymentMethodSelect.selectedIndex]?.text || "Unknown";

        if (!paymentMethodId) {
            window.alert("Please select a Payment Method.");
            return;
        }

        const receiptFile = receiptUploadInput.files[0];
        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        let receiptBase64 = null;
        if (receiptFile) {
            try {
                receiptBase64 = await fileToBase64(receiptFile);
            } catch (err) { return; }
        }

        let fname = formData.get('fname');
        let lname = formData.get('lname');
        let fullName = userType === 'Non-User' ? document.getElementById('full-name').value : `${fname} ${lname}`;

        const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

        pendingPayload = {
            total_amount: totalAmount,
            received_by: "Online",
            receipt_generated: 1,
            payment_method_id: parseInt(paymentMethodId, 10),
            user_type: userType,
            fname: fname,
            lname: lname,
            name: fullName,
            mobile_number: formData.get('mobile_number'),
            batch_year: formData.get('batch_year'),
            transaction_type: cart[0].type,
            transaction_category: cart[0].category,
            event_id: cart[0].event_id,
            items: cart,
            receipt_image: receiptBase64
        };

        if (userType === 'Alumni') {
            pendingDisplayName = `${pendingPayload.fname} ${pendingPayload.lname}`;
            pendingDisplayBatch = pendingPayload.batch_year;
        } else {
            pendingDisplayName = pendingPayload.name;
            pendingDisplayBatch = "N/A";
        }
        pendingDonationType = "Multi-Item Transaction";

        const year = new Date().getFullYear();
        const paddedId = String(nextId).padStart(6, '0');
        previewReceiptNo.textContent = `RCP-${year}-${paddedId}`;
        previewDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        previewName.textContent = fullName;
        previewMethod.textContent = selectedMethodName;

        const tbody = document.querySelector('.receipt-table tbody');
        tbody.innerHTML = '';
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' });

        cart.forEach(item => {
            const tr = document.createElement('tr');

            // Description Logic
            let description = "";
            if (item.type === 'Contribution') {
                description = "Alumni Contribution";
            } else if (item.item_description) {
                description = item.item_description;
            } else if (item.eventName) {
                description = item.eventName;
            } else {
                description = "Monetary Support";
            }

            tr.innerHTML = `
                <td>${item.type}</td>
                <td>${item.category}</td>
                <td>${description}</td>
                <td class="text-right">${formatter.format(item.amount)}</td>
            `;
            tbody.appendChild(tr);
        });

        previewTotal.textContent = formatter.format(totalAmount);
        receiptModal.style.display = 'flex';
    };

    // ... existing functions ...

    // Modal Elements
    const receiptModal = document.getElementById('receipt-modal');
    const confirmBtn = document.getElementById('confirm-transaction-btn');
    const cancelBtn = document.getElementById('cancel-transaction-btn');

    // Preview Elements
    const previewReceiptNo = document.getElementById('preview-receipt-no');
    const previewDate = document.getElementById('preview-date');
    const previewName = document.getElementById('preview-name');
    const previewMethod = document.getElementById('preview-method');
    const previewDesc = document.getElementById('preview-desc');
    const previewAmount = document.getElementById('preview-amount');
    const previewTotal = document.getElementById('preview-total');

    let pendingPayload = null;
    let pendingDisplayName = "";
    let pendingDisplayBatch = "";
    let pendingDonationType = "";

    const handleFormSubmit = async (e) => {
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
        const selectedMethodName = paymentMethodSelect.options[paymentMethodSelect.selectedIndex]?.text || "Unknown";

        if (!paymentMethodId) {
            window.alert("Please select a Payment Method.");
            return;
        }

        // If Normal User, validation for receipt
        const receiptFile = receiptUploadInput.files[0];
        if (!isStaff && !receiptFile) {
            window.alert("Please upload a receipt/proof of donation.");
            return;
        }

        // Helper to read file as Base64
        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        let receiptBase64 = null;
        if (receiptFile) {
            try {
                receiptBase64 = await fileToBase64(receiptFile);
            } catch (err) {
                console.error("Error reading file:", err);
                window.alert("Failed to read the receipt file.");
                return;
            }
        }

        // Determine Name
        let fname = formData.get('fname');
        let lname = formData.get('lname');
        let fullName = userType === 'Non-User' ? formData.get('name') : `${fname} ${lname}`;

        // Determine Received By
        let receivedBy = "Online";
        if (isStaff && currentUser) {
            receivedBy = `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() || currentUser.username || "Staff";
        }

        // Prepare Payload
        pendingPayload = {
            total_amount: isStaff ? amount : (receiptFile ? 0 : amount), // Logic: if uploading receipt, amount might be unverified 0, but if staff enters it, it is verified.
            // Actually, for normal user, if we hid the amount field, it's 0 or null. 
            // The previous code had `isStaff ? amount : 0`. We stick to that.

            received_by: receivedBy,
            receipt_generated: 1,
            payment_method_id: parseInt(paymentMethodId, 10),
            user_type: userType,
            fname: fname,
            lname: lname,
            name: userType === 'Non-User' ? formData.get('name') : null,
            mobile_number: formData.get('mobile_number'),
            batch_year: formData.get('batch_year'),
            transaction_type: selectedTransactionType,
            transaction_category: donationTypeInput.value,
            event_id: selectedEventIdInput.value ? parseInt(selectedEventIdInput.value, 10) : null,
            receipt_image: receiptBase64
        };

        // Store display info for local update after success
        if (userType === 'Alumni') {
            pendingDisplayName = `${pendingPayload.fname} ${pendingPayload.lname}`;
            pendingDisplayBatch = pendingPayload.batch_year;
        } else {
            pendingDisplayName = pendingPayload.name;
            pendingDisplayBatch = "N/A";
        }
        pendingDonationType = donationTypeInput.value;


        // Update Modal Preview
        const year = new Date().getFullYear();
        const paddedId = String(nextId).padStart(6, '0');
        previewReceiptNo.textContent = `RCP-${year}-${paddedId}`;

        previewDate.textContent = new Date(formData.get('Date of Donation')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        previewName.textContent = fullName;
        previewMethod.textContent = selectedMethodName;
        previewDesc.textContent = donationTypeInput.value + (selectedEventIdInput.value ? " (Event)" : "");

        // Format Currency
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }); // Assuming PHP/Peso or Dollar? Image showed $. User said "billing". I'll use PHP as it is St. Anthony (likely PH). Image showed $5000. I will respect generic $ or just ₱. Defaulting to '$' to match user's image, unless I see PHP elsewhere.
        // Image shows '$'.
        previewAmount.textContent = formatter.format(amount || 0); // Display the amount input? If hidden (normal user), it is 0. 
        // Wait, if normal user has hidden amount, preview will say $0.00.
        // Maybe we shouldn't show the billing modal for Normal users?
        // Prompt says: "add this billing and will show after clicking...".
        // It implies for the active user (Admin/Cashier). 
        // If normal user is donating, they just upload receipt. They don't generate a receipt for themselves instantly usually (it needs verification).
        // Plus, "Received by" logic implies cashier layout.
        // I will show it for everyone, but for normal users $0.00 might be weird unless they entered it.
        // Actually, normal user input for amount is HIDDEN.
        // We might just skip modal for normal users? Or show it?
        // User said "Received by... Name of Cashier". This strongly implies this flow is for the Cashier/Admin side.
        // So for Normal User, maybe we just submit directly? 
        // Or maybe let's use the modal but amount is 0/Pending.
        // I'll assume for now we show it.

        previewTotal.textContent = formatter.format(amount || 0);

        // Show Modal
        receiptModal.style.display = 'flex';
    };

    // Close Modal
    cancelBtn.addEventListener('click', () => {
        receiptModal.style.display = 'none';
        pendingPayload = null;
    });

    // Confirm & Submit
    confirmBtn.addEventListener('click', () => {
        if (!pendingPayload) return;
        submitTransaction(pendingPayload);
    });

    const submitTransaction = (payload) => {
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

                // Hide Modal
                receiptModal.style.display = 'none';

                // Success - Update Frontend List Locally
                const newDonation = {
                    id: data.transaction_id || nextId++,
                    name: pendingDisplayName,
                    batch: pendingDisplayBatch,
                    type: pendingDonationType,
                    amount: payload.total_amount,
                    status: isStaff ? 'Confirmed' : 'Pending',
                    receipt_image: payload.receipt_image // Store local base64 for immediate viewing
                };

                allDonations.push(newDonation);

                if (currentFilter === 'All' || currentFilter === newDonation.type) {
                    currentDonations = allDonations.filter(d => currentFilter === 'All' || d.type === currentFilter);
                    renderDonationList();
                }

                window.alert(`Thank you, ${pendingDisplayName}! Transaction recorded.`);

                // Reset Form
                donationForm.reset();
                donationAmountInput.value = '';
                dateOfDonationInput.value = '';
                batchYearSelect.value = '';
                donationTypeInput.value = '';
                selectedDonationTypeText.textContent = 'Choose a Fundraising Program';
                donationTypeDropdown.querySelectorAll('.fund-item').forEach(li => li.classList.remove('selected'));
                eventSelectionContainer.style.display = 'none';
                selectedEventIdInput.value = '';

                toggleUserFields();
                pendingPayload = null;
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Failed to save transaction: " + error.message);
                // Keep modal open? Or close? Keep open so they can retry or cancel.
            });
    };

    // ... existing handlers ...

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

    // --- Initialization ---

    fetchTransactions();
    fetchPaymentMethods();
    populateBatchYearDropdown();
    populateDonationTypeDropdown();
    toggleUserFields(); // Initial run

    // Set the max date for the date picker to today (to prevent future dates)
    dateOfDonationInput.max = new Date().toISOString().split("T")[0];

    // Attach event listeners
    if (userTypeSelect) userTypeSelect.addEventListener('change', toggleUserFields);
    if (paymentMethodSelect) paymentMethodSelect.addEventListener('change', togglePaymentMethod);

    fundraisingDropdownBtn.addEventListener('click', () => toggleDropdown(fundraisingDropdown, fundraisingDropdownBtn));
    fundraisingDropdown.addEventListener('click', handleFundSelection);

    donationTypeDropdownBtn.addEventListener('click', () => toggleDropdown(donationTypeDropdown, donationTypeDropdownBtn));
    // Donation type selection handler is attached inside populateDonationTypeDropdown

    donationAmountInput.addEventListener('input', handleAmountInput);
    // donationForm.addEventListener('submit', handleFormSubmit);
    if (addToCartBtn) addToCartBtn.addEventListener('click', handleAddToCart);
    if (proceedPaymentBtn) proceedPaymentBtn.addEventListener('click', handleProceedPayment);
    document.addEventListener('click', closeDropdownIfClickedOutside);

    // Initial setup for the filter dropdown
    const allFilter = fundraisingDropdown.querySelector('[data-fund="All"]');
    if (allFilter) allFilter.classList.add('selected');
});