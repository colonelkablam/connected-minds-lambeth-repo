async function deleteActivity(activityId) {
    if (!confirm("Are you sure you want to delete this activity?")) {
        return; // User canceled deletion
    }

    try {
        const response = await fetch(`/manage-activity/delete/${activityId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);

            // Remove the activity element from the DOM dynamically
            const activityElement = document.getElementById(`activity-${activityId}`);
            if (activityElement) {
                activityElement.remove();
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error deleting activity:", error);
        alert("Failed to delete activity.");
    }
}


