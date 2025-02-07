document.addEventListener("DOMContentLoaded", function () {
  const flashMessage = document.getElementById("flashMessage");

  // Show message if already in the DOM
  if (flashMessage.textContent.trim() !== "") {
    flashMessage.classList.add("show"); // Make message visible

    setTimeout(() => {
      flashMessage.classList.remove("show"); // Hide after 5 seconds
    }, 5000);
  }

  // Read Flash Message from Cookie (For AJAX Requests)
  const flashCookie = document.cookie.split("; ").find(row => row.startsWith("flash="));

  if (flashCookie) {
    const flashData = JSON.parse(decodeURIComponent(flashCookie.split("=")[1]));
    const type = Object.keys(flashData)[0]; // "success" or "error"
    const message = flashData[type];

    if (message) {
      flashMessage.textContent = message; // Set text content
      flashMessage.classList.add(type, "show"); // Apply styling

      setTimeout(() => {
        flashMessage.classList.remove("show"); // Hide after 5 seconds
      }, 5000);

      // Remove flash cookie after displaying
      document.cookie = "flash=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
});
