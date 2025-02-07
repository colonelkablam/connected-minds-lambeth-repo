document.addEventListener("DOMContentLoaded", function () {
    const flashMessages = document.querySelectorAll(".flash-message");
  
    if (flashMessages.length > 0) {
      setTimeout(() => {
        flashMessages.forEach(message => {
          message.style.animation = "fadeOut 0.5s ease-in-out forwards";
        });
  
        // Remove message from DOM after fade-out
        setTimeout(() => {
          flashMessages.forEach(message => message.remove());
        }, 600); // Wait for animation to complete
      }, 3000); // Hides after 5 seconds
    }
  });
  