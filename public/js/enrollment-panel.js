document.addEventListener("DOMContentLoaded", async () => {
    const activityId = window.location.pathname.split("/").pop(); // Extract ID from URL

    if (!activityId) {
        console.error("No activity ID found in URL");
        return;
    }

    try {
        // Fetch both activity details and enrollment data
        const [activityResponse, enrollmentResponse] = await Promise.all([
            fetch(`${window.location.origin}/activity/api/get-data/${activityId}`),
            fetch(`${window.location.origin}/manage-activity/api/get-enrollment-data/${activityId}`)
        ]);

        if (!activityResponse.ok) {
            throw new Error(`Failed to fetch activity. Status: ${activityResponse.status}`);
        }
        if (!enrollmentResponse.ok) {
            throw new Error(`Failed to fetch enrollment data. Status: ${enrollmentResponse.status}`);
        }

        const activityData = await activityResponse.json();
        const enrollmentData = await enrollmentResponse.json();

        // Validate responses
        if (!activityData.success || !activityData.activity) {
            throw new Error("API returned invalid activity data format");
        }
        if (!enrollmentData.success) {
            throw new Error("API returned invalid enrollment data format");
        }

        const activity = activityData.activity;

        // Update Activity Title
        const titleElement = document.getElementById("activity-title");
        if (titleElement) titleElement.innerText = activity.title || "No Title";


        // UPDATE enrollment details
        // on this page
        renderEnrollmentInfo(enrollmentData.spaces_remaining, enrollmentData.total_spaces);
        // 


        // Render Enrollment List
        renderEnrollmentList(enrollmentData.spaces_remaining, enrollmentData.total_spaces);

    } catch (error) {
        console.error("Error fetching activity details or enrollment:", error);
    }
});

function renderEnrollmentInfo(spacesRemaining, totalSpaces) {
    const spacesInfo = document.getElementById("spaces-info");
    if (spacesInfo) spacesInfo.innerText = "Maximum spaces available: " + totalSpaces || "No info available";
    const numberEnrolled = document.getElementById("enrolled-students");
    if (numberEnrolled) numberEnrolled.innerText = "Students Enrolled: " + (totalSpaces - spacesRemaining) || "No info available";
}

function updateSearchResultsSpaces(activityId, newSpacesRemaining) {
    const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
    if (!activityCard) return;

    const spacesElement = activityCard.querySelector(".spaces-remaining"); // Update this selector based on your structure
    if (spacesElement) {
        spacesElement.textContent = `Spaces Available: ${newSpacesRemaining}`;
    }
}

function renderEnrollmentList(spacesRemaining, totalSpaces) {
    const list = document.getElementById("enrollment-list");
    if (!list) return;

    list.innerHTML = ""; // Clear existing list

    for (let i = 1; i <= totalSpaces; i++) {
        const listItem = document.createElement("li");

        if (i <= totalSpaces - spacesRemaining) {
            // Occupied slot with remove button
            listItem.className = "enrolled";
            listItem.innerHTML = `Student ${i} Enrolled 
                <button class="remove-button" onclick="updateEnrollment('increase')">❌</button>`;
        } else {
            // Available slot
            listItem.className = "empty-slot";
            listItem.textContent = "[Available Slot]";
            listItem.onclick = () => updateEnrollment('decrease');
        }

        list.appendChild(listItem);
    }
}

async function updateEnrollment(action) {
    const activityId = window.location.pathname.split("/").pop(); // Extract ID again

    try {
        const response = await fetch(`${window.location.origin}/manage-activity/api/change-enrollment`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activity_id: activityId, action }),
        });

        const data = await response.json();
        if (data.success) {
            renderEnrollmentList(data.spaces_remaining, data.total_spaces);
            renderEnrollmentInfo(data.spaces_remaining, data.total_spaces);

        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error updating enrollment:", error);
    }
}
