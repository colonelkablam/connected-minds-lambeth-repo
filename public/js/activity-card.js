
function createActivityCard(activity) {
  const li = document.createElement("li");
  li.classList.add("activity-card");
  li.setAttribute("id", `activity-${activity.id}`);
  li.setAttribute("data-id", activity.id);
  li.setAttribute("data-spaces", activity.spaces_remaining);

  // Check if the activity is pinned (from localStorage)
  const pinnedActivities = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  const isPinned = pinnedActivities.includes(activity.id.toString());

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
      ${formatActivityDetails(activity)}
    </div>

    <div class="edit-buttons-box">
    ${userRole === "supa_admin" || userRole === "admin" ? `
      <span class="enroll-span">
        <button type="button" title="Enroll student" class="btn enroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'decrease')">Enroll</button>
        <button type="button" title="Unenroll student" class="btn unenroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'increase')">Unenroll</button>
      </span>
      <span class="edit-span">
        <button type="button" title="EDIT" class="btn edit-btn" onclick="window.location.href = '/manage-activity/update/${activity.id}'">Edit Details</button>
        <button type="button" title="DELETE ACTIVITY" class="icon bin" data-id="${activity.id} onclick="deleteActivity(${activity.id})">🗑️</button>
      </span>

    ` : ""}
    </div>
  `;

  return li;
}