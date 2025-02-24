document.addEventListener("DOMContentLoaded", () => {
  attachSearchHandlers(); // Attach event listeners for search and "See All"
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

// **Attaches search handlers to the form and "See All" button**
function attachSearchHandlers() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("searchText"); // Reference input field
  const seeAllButton = document.getElementById("seeAllButton");

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent full page reload
      const searchObject = getFormDataAsObject(searchForm);
      performSearch(searchObject);
    });
  }

  if (seeAllButton) {
    seeAllButton.addEventListener("click", () => {
      searchInput.value = ""; // Clear input field
      performSearch({ searchQuery: "" }); // Fetch all activities
    });
  }
}

// **Extracts form data into a JSON object**
function getFormDataAsObject(form) {
  const formData = new FormData(form);
  const searchObject = {};

  formData.forEach((value, key) => {
    if (searchObject[key]) {
      if (!Array.isArray(searchObject[key])) {
        searchObject[key] = [searchObject[key]];
      }
      searchObject[key].push(value);
    } else {
      searchObject[key] = value;
    }
  });

  return searchObject;
}

// **Fetches and displays search results**
async function performSearch(searchObject) {
  // Ensure searchText exists before checking length
  const hasSearchText = searchObject.searchText && searchObject.searchText.trim().length > 2;
  const filtersEnabled = searchObject.filtersEnabled ? true : false; // Ensure it's properly checked

  // If filters are NOT enabled AND no valid search text is provided, show a warning
  if (!filtersEnabled && !hasSearchText && searchObject.searchQuery !== "") {
    showFlashMessage("Please use at least 3 characters to search.", "warning");
    return;
  }

  try {
    const response = await fetch(`${window.location.origin}/search/api/get-searched`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchObject),
    });

    const data = await response.json();

    if (data.success) {
      showFlashMessage(`${data.found_activities.length} activities found.`, "success");
      displaySearchResults(data.found_activities);
    } else {
      console.error("Search error:", data.message);
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
}



// **Displays search results grouped by day**
function displaySearchResults(activities) {
  const searchResultsContainer = document.getElementById("search-results");
  searchResultsContainer.innerHTML = ""; // Clear previous results

  if (activities.length === 0) {
    searchResultsContainer.innerHTML = "<p>No activities found.</p>";
    return;
  }

  // Group activities by day of the week
  const groupedActivities = {};
  activities.forEach((activity) => {
    const day = activity.day; // Assuming activity.day contains "Monday", "Tuesday", etc.
    if (!groupedActivities[day]) {
      groupedActivities[day] = [];
    }
    groupedActivities[day].push(activity);
  });

  // Define the correct order of days
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Append activities in order of days
  daysOrder.forEach((day) => {
    if (groupedActivities[day]) {
      const daySection = document.createElement("div");
      daySection.classList.add("day-section");

      const heading = document.createElement("h2");
      heading.classList.add("day-section-title");
      heading.textContent = day;
      daySection.appendChild(heading);

      groupedActivities[day].forEach((activity) => {
        const activityElement = createActivityCard(activity);
        daySection.appendChild(activityElement);
      });

      searchResultsContainer.appendChild(daySection);
    }
  });
}
