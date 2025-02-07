document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded, checking elements...");

  // **LOGIN ELEMENTS**
  const loginButton = document.getElementById("loginButton");
  const loginModal = document.getElementById("loginModal");
  const closeModal = document.querySelector(".close");
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("loginErrorMessage");
  const flashContainer = document.getElementById("flashMessages");

  if (!loginModal || !closeModal || !loginForm) {
    console.error("Error: One or more modal elements not found.");
    return;
  }

  // Open login modal
  if (loginButton) {
    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
      loginModal.style.display = "block";
    });
  }

  // Close modal when "X" button is clicked
  closeModal.addEventListener("click", function () {
    loginModal.style.display = "none";
    errorMessage.textContent = "";
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
      errorMessage.textContent = "";
    }
  });

  // Handle login form submission (AJAX)
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
        console.log("Login successful, closing modal...");
        
        // Hide modal before reloading the page
        loginModal.style.display = "none";

        // Show a success message dynamically
        if (flashContainer) {
          flashContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        }

        // Refresh page to update UI
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        errorMessage.textContent = data.message;
        errorMessage.style.color = "red";
      }
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      errorMessage.textContent = "Something went wrong. Please try again.";
      errorMessage.style.color = "red";
    });
  });

  // Handle logout via AJAX
  document.body.addEventListener("click", function (event) {
    if (event.target && event.target.id === "logoutButton") {
      event.preventDefault(); // Prevent default behavior

      fetch("/logout", { method: "POST" })
        .then(response => response.json())
        .then(() => {
          console.log("Logout successful, redirecting to home page...");
          window.location.href = "/"; // Redirect to homepage after logout
        })
        .catch(error => console.error("Logout Error:", error));
    }
  });
});
