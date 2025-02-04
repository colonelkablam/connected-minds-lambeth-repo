document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("loginButton");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.querySelector(".close");
    const loginForm = document.getElementById("loginForm");
  
    if (!loginButton || !loginModal || !closeModal || !loginForm) {
      console.error("Error: One or more modal elements not found.");
      return;
    }
  
    // Open modal when login button is clicked
    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
      loginModal.style.display = "block";
    });
  
    // Close modal when "X" button is clicked
    closeModal.addEventListener("click", function () {
      loginModal.style.display = "none";
    });
  
    // Close modal when clicking outside of it
    window.addEventListener("click", function (event) {
      if (event.target === loginModal) {
        loginModal.style.display = "none";
      }
    });
  
    // Handle form submission with fetch
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.reload(); // Refresh page on success
        } else {
          alert("Login failed!");
        }
      })
      .catch(error => console.error("Fetch Error:", error));
    });
  });
  