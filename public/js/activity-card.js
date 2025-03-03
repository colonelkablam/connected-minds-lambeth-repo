
function createActivityCard(activity) {
  const li = document.createElement("li");
  li.classList.add("activity-card");
  li.setAttribute("id", `${activity.id}`); // Unique ID 

  // Check if the activity is pinned (from localStorage)
  const pinnedActivities = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
  const isPinned = pinnedActivities.includes(activity.id.toString());

  li.innerHTML = `
    <div class="activity-header-box">
      <button class="icon" title="View map and details" onclick="window.location.href = '/activity/${activity.id}'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="map-icon"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg>
      </button>
      <h3>${activity.title}</h3>
      <button class="icon pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" title="Toggle pin" onclick="togglePin(this)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pin-icon"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
      </button>
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