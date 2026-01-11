/* ===============================
   Populate Batch Year Dropdown
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const batchSelect = document.getElementById("batch_year");
  const startYear = 1960;
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= startYear; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    batchSelect.appendChild(option);
  }
});

/* ===============================
   Toggle Password Visibility
================================ */
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const toggle = field.nextElementSibling;

  if (field.type === "password") {
    field.type = "text";
    toggle.textContent = "hide password";
  } else {
    field.type = "password";
    toggle.textContent = "show password";
  }
}

/* ===============================
   Handle Form Submission
================================ */
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const errorMsg = document.getElementById("error-message");
  const successMsg = document.getElementById("success-message");

  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  const formData = {
    fname: document.getElementById("fname").value.trim(),
    lname: document.getElementById("lname").value.trim(),
    username: document.getElementById("username").value.trim(),
    mobile_number: document.getElementById("mobile_number").value.trim(),
    batch_year: document.getElementById("batch_year").value,
    password: document.getElementById("password").value,
    confirm_password: document.getElementById("confirm_password").value
  };

  /* Validation */
  if (!formData.fname || !formData.lname || !formData.username || !formData.batch_year || !formData.password) {
    errorMsg.textContent = "Please fill in all required fields!";
    errorMsg.style.display = "block";
    return;
  }

  if (formData.password !== formData.confirm_password) {
    errorMsg.textContent = "Passwords do not match!";
    errorMsg.style.display = "block";
    return;
  }

  if (formData.password.length < 8) {
    errorMsg.textContent = "Password must be at least 8 characters long!";
    errorMsg.style.display = "block";
    return;
  }

  const submitBtn = document.querySelector(".register-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering...";

  try {
    const response = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      successMsg.textContent = data.message || "Registration successful!";
      successMsg.style.display = "block";

      document.getElementById("registerForm").reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      errorMsg.textContent = data.message || "Registration failed. Please try again.";
      errorMsg.style.display = "block";
    }
  } catch (error) {
    errorMsg.textContent = "Network error. Please try again.";
    errorMsg.style.display = "block";
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register Account";
  }
});
