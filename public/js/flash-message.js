document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded, initializing flash messages...");

  // Read Flash Message from Cookie (For Server-Side Messages)
  const flashCookie = document.cookie.split("; ").find(row => row.startsWith("flash="));

  if (flashCookie) {
    try {
      const flashData = JSON.parse(decodeURIComponent(flashCookie.split("=")[1]));
      const type = Object.keys(flashData)[0]; // "success", "error", "warning"
      const message = flashData[type];

      console.log("Flash message detected:", message);

      if (message) {
        showFlashMessage(message, type);
      }

      // NOW we clear the flash message cookie (AFTER it's read)
      document.cookie = "flash=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.error("Error parsing flash cookie:", error);
    }
  }
});

let flashTimeout; // Store timeout reference globally
let fadeTimeout;

function showFlashMessage(message, type = "info") {
  let flashMessageContainer = document.getElementById("flash-message");

  if (!flashMessageContainer) {
    console.warn("Flash message container not found.");
    return;
  }

  // Clear any existing timeout (prevents stacking issues)
  if (flashTimeout) {
    clearTimeout(flashTimeout);
    clearTimeout(fadeTimeout);
  }

  // Set message content and styling
  flashMessageContainer.textContent = message;
  flashMessageContainer.className = `${type}`;

  // Fade in (restart animation)
  flashMessageContainer.style.visibility = "visible";
  flashMessageContainer.style.opacity = "1";

  // Start a new countdown timer for hiding the message
  if (type !== "error") {
    flashTimeout = setTimeout(() => {
      flashMessageContainer.style.opacity = "0";

      fadeTimeout = setTimeout(() => {
        flashMessageContainer.style.visibility = "hidden";
        flashMessageContainer.textContent = ""; // Clear message
      }, 500);

    }, 5000); // Reset countdown
  }
}



