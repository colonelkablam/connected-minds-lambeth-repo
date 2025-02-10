function createActivityCard(activity, isPinnedList) {
  const li = document.createElement("li");
  li.classList.add("activity-card");
  li.setAttribute("data-id", activity.id);

  // Check if the activity is pinned (from localStorage)
  const pinnedActivities = JSON.parse(localStorage.getItem("pinnedActivities")) || [];
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
    <div class="activity-header">
      <h3>${activity.title}</h3>
      <button class="pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" onclick="togglePin(this)">📌</button>
    </div>
    <p class="description">${activity.description}</p>
    <p><strong>Day:</strong> ${activity.day}</p>
    <p><strong>Target Audience:</strong> ${activity.target_group}</p>
    <p><strong>Location:</strong> 
      ${activity.address_id ? `${activity.street_1}${activity.street_2 ? ", " + activity.street_2 : ''}, ${activity.city}, ${activity.postcode}` : "Not given"}
    </p>
    <p><strong>Contact:</strong> ${ activity.contact_email } </p>
    <p><strong>Spaces Available:</strong> 
      <span class="${availabilityClass}">
        ${activity.spaces_remaining === 0 ? "FULL" : activity.spaces_remaining + " / " + activity.total_spaces}
      </span>
    </p>
    <p><strong>Cost:</strong> ${activity.cost == 0 ? "FREE" : "£" + Number(activity.cost).toFixed(2)}</p>
  `;

  return li;
}


// function createActivityCard(activity, isPinned) {
//     const li = document.createElement("li");
//     li.classList.add("activity-card");
//     li.setAttribute("data-id", activity.id);
  
//     let availabilityClass = "text-green";
//     let percentage = activity.total_spaces > 0 ? (activity.spaces_remaining / activity.total_spaces) * 100 : 0;
  
//     if (activity.spaces_remaining === 0) {
//       availabilityClass = "text-red";
//     } else if (percentage <= 33) {
//       availabilityClass = "text-red";
//     } else if (percentage <= 66) {
//       availabilityClass = "text-amber";
//     }
  
//     li.innerHTML = `
//       <div class="activity-header">
//         <h3>${activity.title}</h3>
//         <button class="pin-btn ${isPinned ? 'pinned' : ''}" data-id="${activity.id}" onclick="togglePin(this)">📌</button>
//       </div>
//       <p class="description">${activity.description}</p>
//       <p><strong>Day:</strong> ${activity.day}</p>
//       <p><strong>Target Audience:</strong> ${activity.target_group}</p>
//       <p><strong>Location:</strong> 
//         ${activity.address_id ? `${activity.street_1}${activity.street_2 ? ", " + activity.street_2 : ''}, ${activity.city}, ${activity.postcode}` : "Not given"}
//       </p>
//       <p><strong>Contact:</strong> ${ activity.contact_email } </p>
//       <p><strong>Spaces Available:</strong> 
//         <span class="${availabilityClass}">
//           ${activity.spaces_remaining === 0 ? "FULL" : activity.spaces_remaining + " / " + activity.total_spaces}
//         </span>
//       </p>
//       <p><strong>Cost:</strong> ${activity.cost == 0 ? "FREE" : "£" + Number(activity.cost).toFixed(2)}</p>
//     `;
  
//     return li;
//   }
  