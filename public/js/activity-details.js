document.addEventListener("DOMContentLoaded", async () => {
    const activityId = window.location.pathname.split("/").pop(); // Extract ID from URL

    if (!activityId) {
        console.error("No activity ID found in URL");
        return;
    }

    console.log("activity id:", activityId);

    try {
        const response = await fetch(`${window.location.origin}/activity/api/get-data/${activityId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch activity");
        }
        
        const activity = await response.json();

        document.getElementById("activity-title").innerText = activity.title;
        document.getElementById("activity-description").innerText = activity.description;
        document.getElementById("provider-name").innerText = activity.provider_name;

        let availabilityClass = "text-green";
        let percentage = activity.total_spaces > 0 ? (activity.spaces_remaining / activity.total_spaces) * 100 : 0;

        if (activity.spaces_remaining === 0) {
            availabilityClass = "text-red";
        } else if (percentage <= 33) {
            availabilityClass = "text-red";
        } else if (percentage <= 66) {
            availabilityClass = "text-amber";
        }

        // Handle website link
        const websiteLink = document.getElementById("provider-website");
        if (activity.website) {
            websiteLink.href = activity.website;
            websiteLink.innerText = activity.website;
        } else {
            websiteLink.innerText = "Not given";
        }

        document.getElementById("day").innerText = activity.day;
        document.getElementById("time").innerText = activity.start_time && activity.stop_time
            ? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}`
            : "Not given";

        document.getElementById("location").innerText = 
            `${activity.street_1 || ''}, ${activity.city || ''}, ${activity.postcode || ''}`;

        document.getElementById("cost").innerText = activity.cost == 0 ? "FREE" : `£${Number(activity.cost).toFixed(2)}`;

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

    } catch (error) {
        console.error("Error fetching activity details:", error);
    }
});
