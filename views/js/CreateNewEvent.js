document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to create an event.");
        window.location.href = "login.html";
        return;
    }

    const form = document.querySelector(".Event-form");
    form.addEventListener("submit", handleSubmit);
});

function showMessage(type, text) {
    const container = document.getElementById("message-container");
    if (container) {
        container.innerHTML = `<div class="message ${type}" style="padding: 10px; margin-bottom: 20px; border-radius: 5px; font-weight: bold; text-align: center; ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}">${text}</div>`;
        container.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert(text);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // Get form values
    const eventName = document.querySelector('input[placeholder="Enter event title"]').value.trim();
    const eventDate = document.querySelector('input[type="date"]').value;
    const contributionDeadline = document.querySelectorAll('input[type="date"]')[1].value;
    const startTime = document.querySelector('input[type="time"]').value;
    const endTime = document.querySelectorAll('input[type="time"]')[1].value;
    // const eventType = document.querySelector('input[placeholder="Reunion, Meeting, etc."]').value.trim(); // Removed: Input is replaced by select
    const batchYear = document.querySelector('input[placeholder="e.g. 2005"]').value.trim();
    const location = document.querySelector('input[placeholder="Enter venue or address"]').value.trim();
    const hostedBy = document.querySelector('input[placeholder="e.g. Batch 2005"]').value.trim();
    const description = document.querySelector('textarea').value.trim();
    const targetAmount = document.querySelector('input[placeholder="Enter target contribution amount"]').value.trim();

    // Validate required fields
    if (!eventName) {
        showMessage('error', "Please enter an event name.");
        return;
    }

    if (!eventDate) {
        showMessage('error', "Please select an event date.");
        return;
    }

    if (!location) {
        showMessage('error', "Please enter a location.");
        return;
    }

    // Get event type (handle both input and select)
    let eventTypeId = null;
    const eventTypeSelect = document.getElementById('event-type-select');
    if (eventTypeSelect) {
        eventTypeId = eventTypeSelect.value;
    } else {
        // Fallback or handle text input if needed, but for now we expect ID
        // You might want to auto-create logic here if sticking to text input
        // For this fix, we assume dropdown is active
    }

    // Prepare event data
    const eventData = {
        event_name: eventName,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location,
        hosted_by: hostedBy || null,
        description: description || null,
        status: "upcoming",
        current_amount: 0,
        target_amount: targetAmount ? parseFloat(targetAmount) : 0,
        contribution_deadline: contributionDeadline || null,
        batch_year: batchYear || null,
        event_type_id: eventTypeId
    };

    // Show loading state
    const submitBtn = document.querySelector(".Submit");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    try {
        const response = await fetch("http://localhost:8000/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        // Handle unauthorized/forbidden responses
        if (response.status === 401) {
            showMessage('error', "Your session has expired. Please login again.");
            setTimeout(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
            }, 2000);
            return;
        }

        if (response.status === 403) {
            showMessage('error', "You don't have permission to create events.");
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Event created successfully:", result);

        showMessage('success', "Event created successfully! Redirecting...");
        setTimeout(() => {
            window.location.href = "Events.html";
        }, 1500);

    } catch (error) {
        console.error("Error creating event:", error);
        showMessage('error', `Failed to create event: ${error.message}`);

        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Optional: Add event type dropdown functionality
async function loadEventTypes() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8000/api/event-types", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const eventTypes = await response.json();

            // Convert event type input to dropdown
            const eventTypeInput = document.querySelector('input[placeholder="Reunion, Meeting, etc."]');
            const select = document.createElement('select');
            select.id = 'event-type-select';

            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select event type';
            select.appendChild(defaultOption);

            // Add event types
            eventTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.event_type_id;
                option.textContent = type.type_name;
                select.appendChild(option);
            });

            eventTypeInput.parentNode.replaceChild(select, eventTypeInput);
        }
    } catch (error) {
        console.log("Could not load event types, using text input instead");
    }
}

// Call loadEventTypes if you want dropdown instead of text input
// Uncomment the line below to enable:
document.addEventListener("DOMContentLoaded", loadEventTypes);