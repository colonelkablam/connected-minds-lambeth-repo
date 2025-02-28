
function createActivityCard(activity) {
  const li = document.createElement("li");
  li.classList.add("activity-card");
  li.setAttribute("id", `activity-${activity.id}`); // Unique ID 

  // Check if the activity is pinned (from localStorage)
  const pinnedActivities = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  const isPinned = pinnedActivities.includes(activity.id.toString());

  li.innerHTML = `
    <div class="activity-header-box">
      <button class="icon" title="View map and details" onclick="window.location.href = '/activity/${activity.id}'">🗺️</button>
      <h3>${activity.title}</h3>
      <button class="icon pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" title="Toggle pin" onclick="togglePin(this)">📌</button>
    </div>

    <div class=decription-box>
        <p class="description">${activity.description}</p>
    </div>

    <div class="details-box">
      ${formatActivityDetails(activity)}
    </div>

    <div id="edit-buttons-box">
    ${userRole === "supa_admin" || userRole === "admin" ? formatEditButtons(activity) : ""}
    </div>
  `;

  return li;
}