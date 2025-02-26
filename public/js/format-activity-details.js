function formatActivityDetails(activity) {
    if (!activity) {
        return '<span class="text-amber">Details not available</span>';
    }

    // formatting for colour highlights on page for FULL/TBC/NA etc
    const availabilityClass = getAvailabilityColour(activity.total_spaces, activity.spaces_remaining)

    const ageRangeText = activity.age_lower && activity.age_upper 
    ? `ages ${activity.age_lower} to ${activity.age_upper}` 
    : `<span class="text-amber">age range TBC</span>`;

    let timingClass = "text-green";
    if (activity.start_time === null || activity.stop_time === null) { timingClass = "text-amber"; }

    let dateClass = "text-green";
    if (activity.start_date === null || activity.stop_date === null) { dateClass = "text-amber"; }

    // if a blank link
    if (activity.website) {
      websiteLink = activity.website;
    } else {
      websiteLink = 'javascript:void(0)';
    }

    // handle address formatting
    let locationString = "Not given";
    if (activity.id) {
      locationString = 
        (activity.street_1 ? activity.street_1 + ", " : "") + 
        (activity.street_2 ? activity.street_2 + ", " : "") + 
        (activity.city ? activity.city + " " : "") + 
        (activity.postcode ? activity.postcode : "");
    }
    
    return `
        <p><strong>Provider:</strong> ${activity.provider_name}</p>

        <p><strong>Website:</strong> 
          <a href="${websiteLink}">${activity.website ? `${activity.website}` : 'Not given'} </a>
        </p>

        <p><strong>Participating Schools:</strong> 
          ${activity.participating_schools ? `${activity.participating_schools}` : 'n/a'}
        </p>

        <span class="lower-info">
          <p><strong>Location:</strong> ${locationString}</p>
          <p><strong>Target:</strong> 
            <span class="text-green">
              ${activity.target_group}: ${ageRangeText}
            </span>
          </p>      

          <p><strong>Day:</strong> 
            <span class="text-green">
              ${activity.day}
            </span>
          </p>

          <p><strong>Time:</strong>
            <span class="${timingClass}">
              ${activity.start_time && activity.stop_time ? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}` : 'TBC'}
            </span>
          </p>

          <p><strong>Dates:</strong> 
            <span class="${dateClass}">
              ${activity.start_date ? formatDate(activity.start_date) : ` - `} to ${activity.stop_date ? formatDate(activity.stop_date) : ` - `}
            </span>
          </p>

          <p><strong>Contact:</strong>
            ${activity.contact_email ? `${activity.contact_email}` : 'Not given'}
          </p>

          <p><strong>Cost:</strong> 
            ${activity.cost == 0 ? "FREE" : "£" + Number(activity.cost).toFixed(2)}
          </p>

          <p><strong>Spaces Available:</strong> 
            <span class="${availabilityClass}" id="spaces-${activity.id}">
              ${!activity.total_spaces || !activity.spaces_remaining ? "TBC" : activity.spaces_remaining + " / " + activity.total_spaces}
            </span>
          </p>
        </span>
    `;
}

function formatDate(dateString) {
  if (!dateString) return ""; // Handle empty date

  const date = new Date(dateString);
  if (isNaN(date)) return dateString; // If invalid date, return original string

  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
}

// formatting for colour highlights on page for FULL/TBC/NA etc
function getAvailabilityColour (total, remaining) {
  // formatting for colour highlights on page for FULL/TBC/NA etc
  let availabilityClass = "text-green";
  let percentage = total > 0 ? (remaining / total) * 100 : 0;
  
  if (remaining === null || total === null) {
    availabilityClass = "text-amber";
  } else if (remaining === 0) {
    availabilityClass = "text-red";
  } else if (percentage <= 40) {
    availabilityClass = "text-amber";
  }

  return availabilityClass;
}

