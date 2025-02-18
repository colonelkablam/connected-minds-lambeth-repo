document.addEventListener("DOMContentLoaded", () => {
  attachSearchHandler(); // Attach event listener when the page loads
  setupFilterToggle(); // Handle filters visibility
});

// **Handles the visibility of the filters panel**
function setupFilterToggle() {
  const filtersCheckbox = document.getElementById("filtersEnabled");
  const filtersPanel = document.getElementById("filters-panel");

  if (!filtersCheckbox || !filtersPanel) return;

  const toggleFiltersPanel = () => {
      filtersPanel.classList.toggle("hidden", !filtersCheckbox.checked);
  };

  filtersCheckbox.addEventListener("change", toggleFiltersPanel);
  toggleFiltersPanel(); // Set initial state
}

function attachSearchHandler() {
  const searchForm = document.getElementById("search-form");
  const searchResultsContainer = document.getElementById("search-results");

  if (searchForm) {
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent full page reload

      const formData = new FormData(searchForm);
      const searchObject = {};

      // Convert FormData into a proper JSON object
      formData.forEach((value, key) => {
        if (searchObject[key]) {
          // Ensure existing values are stored as an array
          if (!Array.isArray(searchObject[key])) {
            searchObject[key] = [searchObject[key]];
          }
          searchObject[key].push(value); // Append new value
        } else {
          searchObject[key] = value;
        }
      });

      //console.log("Search params:", searchObject); // Debugging

      try {
        const response = await fetch(`${window.location.origin}/search/api/get-searched`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(searchObject),
        });

        const data = await response.json();

        if (data.success) {
          searchResultsContainer.innerHTML = ""; // Clear previous results

          if (data.found_activities.length === 0) {
            searchResultsContainer.innerHTML = "<p>No activities found.</p>";
          } else {
            data.found_activities.forEach((activity) => {
              const activityElement = createActivityCard(activity);
              searchResultsContainer.appendChild(activityElement);
            });
          }
        } else {
          console.error("Search error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    });
  }
}
