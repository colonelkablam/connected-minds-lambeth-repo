function updateSpaces(activityId, action) {
    fetch(`${window.location.origin}/manage-activity/change-enrollment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activity_id: activityId,
        action: action
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the UI with the new number of available spaces
        const spacesElement = document.getElementById(`spaces-${activityId}`);
        spacesElement.textContent = `${data.spaces_remaining} / ${data.total_spaces}`;
        spacesElement.className = data.availability_class;
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch(error => console.error("Error updating spaces:", error));
  }
  