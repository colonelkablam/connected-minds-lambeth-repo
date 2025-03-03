function formatEditButtons(activity) {
    if (!activity) {
        return '<span class="text-amber">Details not available</span>';
    }

    return `<span class="edit-span">
                <span class="button-span">
                    <button type="button" title="Enroll student" class="btn enroll-btn" onclick="window.location.href = '/manage-activity/enrollment/${activity.id}'">Enrollment</button>
                    <button type="button" title="EDIT" class="btn edit-btn" onclick="window.location.href = '/manage-activity/update/${activity.id}'">Edit Details</button>
                </span>
                <button type="button" title="DELETE ACTIVITY" class="icon bin" data-modal = "delete" data-id="${activity.id}">
                    <svg pointer-events="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-icon"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </span>`

//          <button type="button" title="Unenroll student" class="btn unenroll-btn" data-id="${activity.id}" onclick="updateSpaces(${activity.id}, 'increase')">Unenroll</button>
}