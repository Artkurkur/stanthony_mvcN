const API_URL = "http://localhost:8000/api/alumni";

document.addEventListener("DOMContentLoaded", loadAlumni);

const form = document.getElementById("alumniForm");
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");

// ✅ ADD SEARCH FUNCTIONALITY
const searchInput = document.querySelector(".Search");
const searchForm = document.querySelector(".search-form");

// Prevent form submission and use real-time search instead
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Real-time search as user types
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  filterAlumni(searchTerm);
});

// Filter alumni based on search term
function filterAlumni(searchTerm) {
  const rows = document.querySelectorAll("#alumniTable tbody tr");

  rows.forEach(row => {
    const fullName = row.querySelector(".Fname").textContent.toLowerCase();
    const username = row.querySelector(".username").textContent.toLowerCase();
    const batchYear = row.querySelector(".BY").textContent.toLowerCase();
    const role = row.querySelector(".role").textContent.toLowerCase();
    const mobile = row.querySelector(".mobileN").textContent.toLowerCase();

    // Check if search term matches any column
    const matches =
      id.includes(searchTerm) ||
      fullName.includes(searchTerm) ||
      username.includes(searchTerm) ||
      batchYear.includes(searchTerm) ||
      role.includes(searchTerm) ||
      mobile.includes(searchTerm);

    // Show or hide row based on match
    if (matches || searchTerm === "") {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// ADD NEW ALUMNI
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = getFormData();

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || "Alumni added successfully!");
      form.reset();
      loadAlumni();
    } else {
      alert(result.error || "Failed to add alumni");
    }
  } catch (err) {
    console.error("Error adding alumni:", err);
    alert("Network error. Please try again.");
  }
});

// LOAD ALL ALUMNI
async function loadAlumni() {
  try {
    const res = await fetch(API_URL);
    const alumni = await res.json();
    const tbody = document.querySelector("#alumniTable tbody");
    tbody.innerHTML = "";

    alumni.forEach((a) => {
      const row = `
        <tr>
          <td class="Fname">${a.fname} ${a.lname}</td>
          <td class="username">${a.username}</td>
          <td class="BY">${a.batch_year}</td>
          <td class="role">${a.role_id}</td>
          <td class="mobileN">${a.mobile_number || 'N/A'}</td>
          <td class="actions">
            <button class="edit" onclick="editAlumni(${a.member_id})">Edit</button>
            <button class="delete" onclick="deleteAlumni(${a.member_id})">Delete</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading alumni:", err);
    alert("Failed to load alumni data. Please refresh the page.");
  }
}

// FETCH SINGLE ALUMNI AND AUTO-FILL FORM
async function editAlumni(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();

    document.getElementById("member_id").value = data.member_id;
    document.getElementById("fname").value = data.fname;
    document.getElementById("lname").value = data.lname;
    document.getElementById("username").value = data.username;
    document.getElementById("mobile_number").value = data.mobile_number || '';
    document.getElementById("batch_year").value = data.batch_year;
    document.getElementById("role_id").value = data.role_id;

    // Toggle buttons
    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";

    // Set update handler
    updateBtn.onclick = async () => {
      const updatedData = getFormData();
      // ✅ Password is NOT included - backend will preserve existing password

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedData),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message || "Alumni updated successfully!");
          form.reset();
          loadAlumni();

          // Reset buttons
          saveBtn.style.display = "inline-block";
          updateBtn.style.display = "none";
        } else {
          alert(result.error || "Failed to update alumni");
        }
      } catch (err) {
        console.error("Error updating alumni:", err);
        alert("Network error. Please try again.");
      }
    };
  } catch (err) {
    console.error("Error editing alumni:", err);
    alert("Failed to load alumni data for editing.");
  }
}

// DELETE ALUMNI
async function deleteAlumni(id) {
  if (!confirm("Are you sure you want to delete this alumni?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const result = await response.json();

    if (response.ok) {
      alert(result.message || "Alumni deleted successfully!");
      loadAlumni();
    } else {
      alert(result.error || "Failed to delete alumni");
    }
  } catch (err) {
    console.error("Error deleting alumni:", err);
    alert("Network error. Please try again.");
  }
}

// COLLECT FORM DATA (WITHOUT PASSWORD)
function getFormData() {
  return {
    fname: document.getElementById("fname").value.trim(),
    lname: document.getElementById("lname").value.trim(),
    username: document.getElementById("username").value.trim(),
    mobile_number: document.getElementById("mobile_number").value.trim(),
    batch_year: document.getElementById("batch_year").value,
    role_id: document.getElementById("role_id").value,
    // ✅ password_hash is NOT included - backend preserves existing password
  };
}
