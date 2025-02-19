function formatActivityDetails(activity) {
    if (!activity) {
        return '<span class="text-amber">Details not available</span>';
    }

    // formatting for colour highlights on page for FULL/TBC/NA etc
    let availabilityClass = "text-green";
    let percentage = activity.total_spaces > 0 ? (activity.spaces_remaining / activity.total_spaces) * 100 : 0;
    
    if (activity.spaces_remaining === null || activity.total_spaces === null) {
      availabilityClass = "text-amber";
    } else if (activity.spaces_remaining === 0) {
      availabilityClass = "text-red";
    } else if (percentage <= 33) {
      availabilityClass = "text-red";
    } else if (percentage <= 66) {
      availabilityClass = "text-amber";
    }

    const ageRangeText = activity.age_lower && activity.age_upper 
    ? `ages ${activity.age_lower} to ${activity.age_upper}` 
    : `<span class="text-amber">age range TBC</span>`;

    let timingClass = "text-green";
    if (activity.start_time === null || activity.stop_time === null) { timingClass = "text-amber"; }

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
              ${activity.start_time && activity.stop_time? `${activity.start_time.slice(0, 5)} to ${activity.stop_time.slice(0, 5)}` : 'TBC'}
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

