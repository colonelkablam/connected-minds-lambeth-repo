document.addEventListener("DOMContentLoaded", async () => {
    const activityId = window.location.pathname.split("/").pop(); // Extract ID from URL

    if (!activityId) {
        console.error("No activity ID found in URL");
        return;
    }

    try {
        const response = await fetch(`${window.location.origin}/activity/api/get-data/${activityId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch activity");
        }
        
        const activity = await response.json();

        document.getElementById("activity-title").innerText = activity.title;

        // Initialize Map
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
                        document.getElementById("activity-map").innerHTML = "<p>Location not found</p>";
                    }
                });
        }

        if (activity.postcode) {
            initialiseMap(activity.postcode);
        }

        // add to single view description
        document.getElementById("activity-description").innerText = activity.description;

        // get details box content
        document.getElementById("details-container").innerHTML = formatActivityDetails(activity);

    } catch (error) {
        console.error("Error fetching activity details:", error);
    }
});
