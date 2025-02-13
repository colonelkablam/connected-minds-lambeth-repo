document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, fetching pinned activities...");
  refreshPinnedActivityCards(); // Initial fetch of pinned activities
  updatePinnedCount();
});

// **Tab Switching: Show Correct Content & Refresh Pins If Needed**
function showTab(tab) {
  document.getElementById("cards-container").style.display = tab === "cards" ? "block" : "none";
  document.getElementById("pinned-container").style.display = tab === "pinned" ? "block" : "none";

  document.getElementById("cards-tab").classList.toggle("active", tab === "cards");
  document.getElementById("pinned-tab").classList.toggle("active", tab === "pinned");

  if (tab === "pinned") {
    refreshPinnedActivityCards(); // Refresh pinned list when switching to pinned tab
  } else {
    refreshSearchResultPins(); // Ensure "Days" tab reflects correct pin states
  }
}

// **Toggle Pinning for an Activity**
function togglePin(button) {
  const activityId = button.getAttribute("data-id");
  let pinned = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];

  if (pinned.includes(activityId)) {
      // Remove from pinned
      pinned = pinned.filter(id => id !== activityId);
      button.classList.remove("pinned");
  } else {
      // Add to pinned
      pinned.push(activityId);
      button.classList.add("pinned");
  }

  // Save updated pinned list
  sessionStorage.setItem("pinnedActivities", JSON.stringify(pinned));

  // Refresh pinned view immediately to reflect changes
  //refreshSearchResultPins();   // Update pin status in "Days" view // no need for this?!
  refreshPinnedActivityCards();  // Refresh the pinned tab (remove unpinned items)
  updatePinnedCount();

}

function clearPins() {
  sessionStorage.setItem("pinnedActivities", JSON.stringify([]));
  refreshPinnedActivityCards();
  refreshSearchResultPins();
  updatePinnedCount();
}

function updatePinnedCount() {
  const pinned = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  const countElement = document.getElementById("pinned-numbers");

  if (countElement) {
      countElement.textContent = pinned.length; // Update count

      // Hide if no pinned activities
      countElement.style.display = pinned.length === 0 ? "none" : "flex";
  }
}

// **Refresh Search Results UI (Updates Pins in "Days" View)**
function refreshSearchResultPins() {
  const searchResultsContainer = document.getElementById("search-results");
  if (!searchResultsContainer) {
    console.log("No search results container found.");
    return;
  }

  const pinned = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];

  // Update pin button states in the "Days" view
  document.querySelectorAll(".activity-card").forEach((card) => {
      const activityId = card.getAttribute("data-id");
      const pinButton = card.querySelector(".pin-btn");

      if (pinButton) {
          pinButton.classList.toggle("pinned", pinned.includes(activityId));
      }
  });
}

// **Fetch and Display Pinned Activities**
function refreshPinnedActivityCards() {
  const pinnedContainer = document.getElementById("pinned-activities");

  if (!pinnedContainer) {
      console.warn("'pinned-activities' container not found in the DOM.");
      return;
  }

  const scrollY = window.scrollY;

  const pinned = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  pinnedContainer.innerHTML = "";

  if (pinned.length === 0) {
      pinnedContainer.innerHTML = "<p>No pinned activities.</p>";
      return;
  }

  // Fetch pinned activities from the backend
  fetch(`${window.location.origin}/get-pinned-activities?ids=${pinned.join(",")}`)
      .then(response => response.json())
      .then(data => {
          pinnedContainer.innerHTML = ""; // Clear before appending

          data.forEach((activity) => {
              const activityElement = createActivityCard(activity);
              pinnedContainer.appendChild(activityElement);
          });
          
          setTimeout(() => window.scrollTo(0, scrollY), 0); // Restore scroll position after DOM update

      })
      .catch(error => console.error("Error fetching pinned activities:", error));
}
