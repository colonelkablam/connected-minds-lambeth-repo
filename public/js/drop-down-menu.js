document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");
  
    menuToggle.addEventListener("click", function () {
      dropdownMenu.classList.toggle("active");
    });
  
    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove("active");
      }
    });
  });
  