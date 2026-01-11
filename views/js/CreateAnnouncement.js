document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to create announcements.");
        window.location.href = "login.html";
        return;
    }

    // Set current date and time as default
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    dateInput.value = `${year}-${month}-${day}`;
    timeInput.value = `${hours}:${minutes}`;

    // Handle form submission
    const postBtn = document.querySelector(".Post-announcementbtn");
    postBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await createAnnouncement();
    });

    // Handle cancel button
    const cancelBtn = document.querySelector(".cancelbtn");
    cancelBtn.addEventListener("click", () => {
        window.location.href = '../html/Announcements.html';
    });
});

async function createAnnouncement() {
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const message = document.getElementById("message").value.trim();
    const category = document.getElementById("category").value;
    const token = localStorage.getItem("token");

    // Validation
    if (!title) {
        alert("Please enter an announcement title.");
        return;
    }

    if (!category) {
        alert("Please select a category.");
        return;
    }

    if (!message) {
        alert("Please enter a message.");
        return;
    }

    if (!date || !time) {
        alert("Please select date and time.");
        return;
    }

    // Combine date and time into the format expected by your database
    const datePosted = `${date} ${time}:00`;

    // Prepare data for API
    const announcementData = {
        title: title,
        message: message,
        date_posted: datePosted,
        event_id: null, // Set to null as requested
        category: category
    };

    // Get button reference once
    const postButton = document.querySelector(".Post-announcementbtn");

    try {
        // Show loading state
        const originalText = postButton.textContent;
        postButton.textContent = "Posting...";
        postButton.disabled = true;

        console.log("Sending data:", announcementData); // Debug log

        const response = await fetch("http://localhost:8000/api/announcements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(announcementData)
        });

        console.log("Response status:", response.status); // Debug log

        // Handle unauthorized/forbidden responses
        if (response.status === 401) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            alert("You don't have permission to create announcements.");
            window.location.href = "../html/Announcements.html";
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Announcement created successfully");

        // Show success message
        postButton.textContent = "✓ Announcement Created!";
        postButton.style.backgroundColor = "#4CAF50";

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = '../html/Announcements.html';
        }, 2000);

    } catch (error) {
        console.error("Error creating announcement:", error);
        alert("Failed to post announcement. Please try again later.");

        // Reset button
        postButton.textContent = "Post Announcement";
        postButton.disabled = false;
    }
}