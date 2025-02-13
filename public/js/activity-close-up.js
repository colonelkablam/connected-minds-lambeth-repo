document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const activityId = params.get("id");
  
    if (!activityId) {
      console.error("No activity ID found in URL");
      return;
    }
  
    fetch(`/api/activity/${activityId}`)
      .then(response => response.text()) // Read raw response first
      .then(text => {
        //console.log("Raw response from server:", text); // Debug output
        return JSON.parse(text); // Convert to JSON
      })
      .then(activity => {
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
        
        const websiteLink = document.getElementById("provider-website");
        if (activity.website) {
          websiteLink.href = activity.website;
          websiteLink.innerText = activity.website;
        } else {
          websiteLink.innerText = "Not given";
        }

        document.getElementById("day").innerText = activity.day;

        document.getElementById("time").innerText = activity.start_time 
          ? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}` 
          : "Not given";

        document.getElementById("target-audience").innerText = activity.target_group 
          ? `${activity.target_group}: ${activity.age_lower ? `ages ${activity.age_lower} to ${activity.age_upper}` : 'Age range TBC'}` 
          : "Not given";

        document.getElementById("location").innerText = activity.postcode 
          ? `${activity.street_1}${activity.street_2 ? ", " + activity.street_2 : ''}, ${activity.city}, ${activity.postcode}` 
          : "Not given";

        const contactEmail = document.getElementById("contact-email");
        if (activity.contact_email) {
          contactEmail.href = `mailto:${activity.contact_email}`;
          contactEmail.innerText = activity.contact_email;
        } else {
          contactEmail.innerText = "Not given";
        }

        const spaces = document.getElementById("spaces");

        spaces.innerText = activity.spaces_remaining === 0 
          ? `${activity.spaces_remaining} / ${activity.total_spaces}` + " FULL" 
          : `${activity.spaces_remaining} / ${activity.total_spaces}`;

        spaces.className = ""; // Reset classes (optional if no other classes exist)
        spaces.classList.add(availabilityClass)

        document.getElementById("cost").innerText = activity.cost == 0 
          ? "FREE" 
          : `£${Number(activity.cost).toFixed(2)}`;

        if (activity.postcode) {
          initialiseMap(activity.postcode);
        }

      })
      .catch(error => console.error("Error fetching activity details:", error));
});

  

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
      })
      .catch(error => {
        console.error("Error fetching location:", error);
        document.getElementById("activity-map").innerHTML = "<p>Error loading map</p>";
      });
  }
