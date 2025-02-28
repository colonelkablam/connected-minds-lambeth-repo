function formatEditButtons(activity) {
    if (!activity) {
        return '<span class="text-amber">Details not available</span>';
    }

    return `<span class="edit-span">
                <span class="button-span">
                    <button type="button" title="Enroll student" class="btn enroll-btn" onclick="window.location.href = '/manage-activity/enrollment/${activity.id}'">Enrollment</button>
                    <button type="button" title="EDIT" class="btn edit-btn" onclick="window.location.href = '/manage-activity/update/${activity.id}'">Edit Details</button>
                </span>
                <button type="button" title="DELETE ACTIVITY" class="icon bin" data-modal = "delete" data-id="${activity.id}">🗑️</button>
            </span>`

//          <button type="button" title="Unenroll student" class="btn unenroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'increase')">Unenroll</button>
}