document.addEventListener("DOMContentLoaded", () => {
    fetchPinnedActivities();
    console.log("DOM fully loaded, fetching pinned activities...")

});
  
// Toggle between "Days" and "Pinned" tabs
function showTab(tab) {
    document.getElementById("days-container").style.display = tab === "days" ? "block" : "none";
    document.getElementById("pinned-container").style.display = tab === "pinned" ? "block" : "none";
  
    document.getElementById("days-tab").classList.toggle("active", tab === "days");
    document.getElementById("pinned-tab").classList.toggle("active", tab === "pinned");
  
    if (tab === "pinned") {
        fetchPinnedActivities(); // Fetch fresh pinned activities every time
    }
  }
  
// Toggle pin and store in localStorage persistently
function togglePin(button) {
  const activityId = button.getAttribute("data-id");
  let pinned = JSON.parse(localStorage.getItem("pinnedActivities")) || [];

  if (pinned.includes(activityId)) {
    // If already pinned, remove it
    pinned = pinned.filter(id => id !== activityId);
    button.classList.remove("pinned");
  } else {
    // If not pinned, add it
    pinned.push(activityId);
    button.classList.add("pinned");
  }

  // Update localStorage
  localStorage.setItem("pinnedActivities", JSON.stringify(pinned));

  // Fetch updated pinned activities
  fetchPinnedActivities();

  refreshSearchResults();
}

function refreshSearchResults() {
  const searchResultsContainer = document.getElementById("search-results");
  if (!searchResultsContainer) return;

  // Get all activity cards in search results
  const activityCards = searchResultsContainer.querySelectorAll(".activity-card");

  activityCards.forEach((card) => {
    const activityId = card.getAttribute("data-id");
    const pinButton = card.querySelector(".pin-btn");
    const pinned = JSON.parse(localStorage.getItem("pinnedActivities")) || [];

    // update pin button status
    if (pinned.includes(activityId)) {
      pinButton.classList.add("pinned");
    } else {
      pinButton.classList.remove("pinned");
    }
  });
}
  
//  Fetch pinned activities from database with error handling
function fetchPinnedActivities() {

  const pinnedContainer = document.getElementById("pinned-activities");

  if (!pinnedContainer) {
    console.warn("'pinned-activities' container not found in the DOM.");
    return; // Exit function to prevent errors
  }

    const pinned = JSON.parse(localStorage.getItem("pinnedActivities")) || [];
    pinnedContainer.innerHTML = "";
  
    if (pinned.length === 0) {
      pinnedContainer.innerHTML = "<p>No pinned activities.</p>";
      return;
    }
  
    fetch(`${window.location.origin}/get-pinned-activities?ids=${pinned.join(",")}`)
      .then(response => response.json())
      .then(data => {
        data.forEach((activity) => {
          const activityElement = createActivityCard(activity, true);
          pinnedContainer.appendChild(activityElement);
        });
      })
      .catch(error => console.error("Error fetching pinned activities:", error));
}
  
  
  