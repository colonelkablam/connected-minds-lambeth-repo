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
      const searchParams = new URLSearchParams(formData);

      try {
        const response = await fetch(`${window.location.origin}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: searchParams.toString(),
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
