document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  // If already logged in, redirect
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "mainDashB.html";
    return;
  }

  form.addEventListener("submit", handleLogin);
});

async function handleLogin(event) {
  event.preventDefault();

  const username = document.querySelector('input[name="username"]').value.trim();
  const password = document.querySelector('input[name="password"]').value.trim();

  if (!username || !password) {
    alert("Please fill in both fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password_hash: password
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Store token and user info
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      // Redirect immediately (no alert)
      window.location.href = "mainDashB.html";
    } else {
      alert(result.message || "Invalid credentials. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Error connecting to the server.");
  }
}
