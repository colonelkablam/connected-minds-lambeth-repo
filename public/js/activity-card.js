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

  if (activity.website) {
    websiteLink = activity.website;
  } else {
    websiteLink = "#";
  }

  let locationString = "Not given";

  if (activity.id) {
    locationString = 
      (activity.street_1 ? activity.street_1 + ", " : "") + 
      (activity.street_2 ? activity.street_2 + ", " : "") + 
      (activity.city ? activity.city + " " : "") + 
      (activity.postcode ? activity.postcode : "");
  }

  li.innerHTML = `
    <div class="activity-header-box">
      <button class="icon" onclick="window.location.href = '/activity/${activity.id}'">🗺️</button>
      <h3>${activity.title}</h3>
      <button class="icon pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" onclick="togglePin(this)">📌</button>
    </div>
    <div class=decription-box>
        <p class="description">${activity.description}</p>
    </div>
    <div class="details-box">
      <p><strong>Provider:</strong> ${activity.provider_name}</p>
      <p><strong>Website:</strong> <a href="${websiteLink}">${activity.website ? `${activity.website}` : 'Not given'} </a></p>
      <p><strong>Participating Schools:</strong> ${activity.participating_schools ? `${activity.participating_schools}` : 'n/a'} </p>
      <span class="lower-info">
        <p><strong>Location:</strong> ${locationString}</p>
        <p><strong>Target Audience:</strong> <span class="text-green">${activity.target_group}: ${activity.age_lower && activity.age_upper ? `ages ${activity.age_lower} to ${activity.age_upper}` : 'age range TBC'}</span></p>
        <p><strong>Day:</strong> <span class="text-green">${activity.day}</span></p>
        <p><strong>Time:</strong> <span class="text-green">${activity.start_time && activity.stop_time? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}` : 'TBC'}</span></p>
        <p><strong>Contact:</strong> ${activity.contact_email ? `${activity.contact_email}` : 'Not given'} </p>
        <p><strong>Cost:</strong> ${activity.cost == 0 ? "FREE" : "£" + Number(activity.cost).toFixed(2)}</p>
        <p><strong>Spaces Available:</strong> 
          <span class="${availabilityClass}" id="spaces-${activity.id}">
            ${activity.spaces_remaining + " / " + activity.total_spaces}
          </span>
        </p>
      </span>
      <div class="edit-buttons-box">
          ${userRole === "supa_admin" || userRole === "admin" ? `
          <span>
            <button type="button" class="btn enroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'decrease')">Enroll</button>
            <button type="button" class="btn unenroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'increase')">Unenroll</button>
          </span>
          <button type="button" class="btn edit-btn" onclick="window.location.href = '/manage-activity/update/${activity.id}'">Edit Details</button>
        ` : ""}
      </div>
    </div>
  `;

  return li;
}