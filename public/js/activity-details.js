// when page is loaded
document.addEventListener("DOMContentLoaded", async () => {
    const activityId = window.location.pathname.split("/").pop(); // Extract ID from URL

    if (!activityId) {
        console.error("No activity ID found in URL");
        return;
    }

    try {
        const response = await fetch(`${window.location.origin}/activity/api/get-data/${activityId}`);
    
        if (!response.ok) {
            throw new Error(`Failed to fetch activity. Status: ${response.status}`);
        }

        const data = await response.json(); // Get the full response

        // Extract the activity object
        if (!data.success || !data.activity) {
            throw new Error("API returned invalid data format");
        }

        const activity = data.activity; // Extracted activity data

        // Update Title
        const titleElement = document.getElementById("activity-title");
        if (titleElement) titleElement.innerText = activity.title || "No Title";

        // Initialize Map if postcode exists
        function initialiseMap(postcode) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${postcode}, UK`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const { lat, lon } = data[0];

                        const map = L.map("activity-map").setView([lat, lon], 14);
                        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                            attribution: "&copy; OpenStreetMap contributors"
                        }).addTo(map);

                        L.marker([lat, lon]).addTo(map)
                            .bindPopup(`Location: ${postcode}`)
                            .openPopup();
                    } else {
                        const mapElement = document.getElementById("activity-map");
                        if (mapElement) {
                            mapElement.innerHTML = "<p>Location not found</p>";
                        }
                    }
                });
        }

        if (activity.postcode) {
            initialiseMap(activity.postcode);
        }

        // Update Description
        const descriptionElement = document.getElementById("activity-description");
        if (descriptionElement) descriptionElement.innerText = activity.description || "No description available";

        // Update Details Box
        const detailsContainer = document.getElementById("details-container");
        if (detailsContainer) detailsContainer.innerHTML = formatActivityDetails(activity);

        // Update Edit Butons Box
        const editButtonsBox = document.getElementById("edit-buttons-box");
        if (editButtonsBox) editButtonsBox.innerHTML = userRole === "supa_admin" || userRole === "admin" ? formatEditButtons(activity) : "";

    } catch (error) {
        console.error("Error fetching activity details:", error);
    }
});

// Detect when the page becomes visible again (user navigates back rather than re-load)
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      console.log("individual activity page re-visited - updating data");
      await updateActivitySpaces();
    }
  });

// Updates availability in activity cards as live data
async function updateActivitySpaces() {
    const spaceElements = document.querySelectorAll("[id^=spaces-available-]"); // Find all elements with IDs starting with 'spaces-'
    
    if (spaceElements.length === 0) {
        console.warn("No spaces-available elements found! Ensure they exist in the DOM.");
        return;
    }
  
    for (const element of spaceElements) {
        const activityId = element.id.replace("spaces-available-", ""); // Extract activity ID from the element's ID
        
        try {
            const response = await fetch(`${window.location.origin}/manage-activity/api/get-enrollment-data/${activityId}`);
            const data = await response.json();
  
            if (data.success) {
                element.innerHTML = getAvailabilityText(data.total_spaces, data.spaces_remaining);
            }
        } catch (error) {
            console.error(`Error fetching enrollment data for ${activityId}:`, error);
        }
    }
  }
