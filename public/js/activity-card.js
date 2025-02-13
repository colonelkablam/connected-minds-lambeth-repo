function createActivityCard(activity) {
  const li = document.createElement("li");
  li.classList.add("activity-card");
  li.setAttribute("data-id", activity.id);
  li.setAttribute("data-spaces", activity.spaces_remaining);

  // Check if the activity is pinned (from localStorage)
  const pinnedActivities = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  const isPinned = pinnedActivities.includes(activity.id.toString());

  let availabilityClass = "text-green";
  let percentage = activity.total_spaces > 0 ? (activity.spaces_remaining / activity.total_spaces) * 100 : 0;

  if (activity.spaces_remaining === 0) {
    availabilityClass = "text-red";
  } else if (percentage <= 33) {
    availabilityClass = "text-red";
  } else if (percentage <= 66) {
    availabilityClass = "text-amber";
  }

  li.innerHTML = `
    <div class="activity-header-box">
      <button class="icon" onclick="window.location.href = '/activity?id=${activity.id}'">🗺️</button>
      <h3>${activity.title}</h3>
      <button class="icon pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" onclick="togglePin(this)">📌</button>
    </div>
    <div class=decription-box>
        <p class="description">${activity.description}</p>
    </div>
    <div class="details-box">
      <p><strong>Provider:</strong> ${activity.provider_name}</p>
      <p><strong>Website:</strong> ${activity.website ? `${activity.website}` : 'Not given'} </p>
      <p><strong>Day:</strong> ${activity.day}</p>
      <p><strong>Time:</strong> ${activity.start_time ? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}` : 'Not given'}</p>
      <p><strong>Target Audience:</strong> ${activity.target_group}: ${activity.age_lower ? `${activity.age_lower} to ${activity.age_upper}` : 'age range TBC'}</p>
      <p><strong>Location:</strong> 
        ${activity.address_id ? `${activity.street_1}${activity.street_2 ? ", " + activity.street_2 : ''}, ${activity.city}, ${activity.postcode}` : "Not given"}
      </p>
      <p><strong>Contact:</strong> ${activity.contact_email ? `${activity.contact_email}` : 'Not given'} </p>
      <p><strong>Cost:</strong> ${activity.cost == 0 ? "FREE" : "£" + Number(activity.cost).toFixed(2)}</p>
      <p><strong>Spaces Available:</strong> 
        <span class="${availabilityClass}" id="spaces-${activity.id}">
          ${activity.spaces_remaining === 0 ? "FULL" : activity.spaces_remaining + " / " + activity.total_spaces}
        </span>
        ${userRole === "supa_admin" || userRole === "admin" ? `
          <button type="button" class="btn enroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'increase')">Enroll</button>
          <button type="button" class="btn unenroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'decrease')">Unenroll</button>
        ` : ""}
      </p>
    </div>

  `;

  return li;
}