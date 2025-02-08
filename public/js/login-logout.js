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

  // Ensure modal starts hidden
  loginModal.style.display = "none"; // Explicitly hide modal on page load

  // Open login modal
  if (loginButton) {
    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
      loginModal.classList.add("show");
    });
  }

  // Close modal when "X" button is clicked
  closeModal.addEventListener("click", function () {
    loginModal.classList.remove("show");
    errorMessage.textContent = "";
  });

  // Close modal when clicking outside of modal content
  loginModal.addEventListener("click", function (event) {
    if (event.target === loginModal) { // Ensure click is on the modal background
      loginModal.classList.remove("show"); 
      errorMessage.textContent = "";
    }
  });

  // Handle login form submission (AJAX)
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${window.location.origin}/user-login/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Login successful, closing modal...");
        
        // Hide modal before reloading the page
        loginModal.classList.remove("show");

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
      event.preventDefault(); // Prevent default link behavior

      fetch(`${window.location.origin}/user-login/logout`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" }
      })
      .then(response => {
          if (!response.ok) {
              throw new Error("Logout failed");
          }
          return response.json();
      })
      .then(() => {
          console.log("Logout successful, redirecting to home page...");
          window.location.href = "/"; // Redirect after logout
      })
      .catch(error => console.error("Logout Error:", error));
  }
});

});
