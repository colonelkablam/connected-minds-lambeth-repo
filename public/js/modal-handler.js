document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded, setting up modal listeners...");

  // **MODAL ELEMENTS**
  const genericModal = document.getElementById("generic-modal");
  const modalHeading = document.getElementById("modal-heading");
  const modalMessage = document.getElementById("modal-message");
  const modalForm = document.getElementById("modal-form");
  const modalInputs = document.getElementById("modal-inputs");
  const modalSubmitButton = document.getElementById("modal-submit-button");
  const modalActions = document.getElementById("modal-actions");
  const modalConfirmButton = document.getElementById("modal-confirm-button");
  const modalCancelButton = document.getElementById("modal-cancel-button");
  const closeModal = document.querySelector(".close");

  // **SHOW MODAL FUNCTION**
  function showModal({ title, message, formFields, confirmAction, submitAction }) {
    modalHeading.textContent = title;
    modalMessage.textContent = message || "";
    
    // Reset Modal
    modalInputs.innerHTML = "";
    modalActions.style.display = "none";
    modalForm.style.display = "none";

    // If formFields exist, show the form
    if (formFields && formFields.length) {
      modalForm.style.display = "block";
      formFields.forEach(field => {
        const inputElement = document.createElement("input");
        inputElement.type = field.type;
        inputElement.id = field.id;
        inputElement.name = field.name;
        inputElement.placeholder = field.placeholder;
        inputElement.required = field.required || false;
        modalInputs.appendChild(inputElement);
      });

      modalSubmitButton.onclick = function (event) {
        event.preventDefault();
        if (submitAction) {
          const formData = {};
          formFields.forEach(field => {
            formData[field.name] = document.getElementById(field.id).value;
          });
          submitAction(formData);
        }
      };
    }

    // If confirmAction exists, show confirm buttons
    if (confirmAction) {
      modalActions.style.display = "flex";
      modalConfirmButton.onclick = confirmAction;
    }

    // Show modal
    genericModal.classList.add("show");
  }

  // **CLOSE MODAL FUNCTION**
  function closeModalHandler() {
    genericModal.classList.remove("show");
  }

  // Close modal events
  closeModal.addEventListener("click", closeModalHandler);
  modalCancelButton.addEventListener("click", closeModalHandler);
  genericModal.addEventListener("click", function (event) {
    if (event.target === genericModal) {
      closeModalHandler();
    }
  });

  document.body.addEventListener("click", function (event) {
    const modalType = event.target.dataset.modal; // Get modal type
    const itemId = event.target.dataset.id; // Get item ID (if applicable)
  
    if (!modalType) return; // Ignore clicks that aren't related to modals
  
    event.preventDefault();
  
    // Handle different modal actions
    switch (modalType) {
      case "login":
        showModal({
          title: "Login",
          message: "",
          formFields: [
            { id: "email", name: "email", type: "email", placeholder: "Email", required: true },
            { id: "password", name: "password", type: "password", placeholder: "Password", required: true }
          ],
          submitAction: function (formData) {
            fetch(`${window.location.origin}/user-login/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                console.log("Login successful!");
                closeModalHandler();
                setTimeout(() => window.location.reload(), 500);
              } else {
                modalMessage.textContent = data.message;
                modalMessage.style.color = "red";
              }
            })
            .catch(error => {
              console.error("Login Error:", error);
              modalMessage.textContent = "Something went wrong.";
              modalMessage.style.color = "red";
            });
          }
        });
      break;
  
      case "delete":
        showModal({
          title: "Confirm Deletion",
          message: "Are you sure you want to delete this item?",
          confirmAction: function () {
            fetch(`${window.location.origin}/manage-activity/delete/${itemId}`, {
              method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // Check if we're on a single activity page
                if (window.location.pathname.includes(`/activity/${itemId}`)) {
                  console.log(`Going back to activities list...`);
                  window.location.href = "/";
                }
               
                // Remove activity card using the correct ID format
                const activityElement = document.getElementById(`activity-${itemId}`);
                if (activityElement) {
                    activityElement.remove();
                    console.log(`Activity ${itemId} removed from DOM.`);
                } else {
                    console.warn(`Activity card with ID activity-${itemId} not found.`);
                }

                // Remove from pinned activities in sessionStorage
                let pinned = JSON.parse(sessionStorage.getItem("pinnedActivities")) || [];
                if (pinned.includes(itemId)) {
                    pinned = pinned.filter(id => id !== itemId);
                    sessionStorage.setItem("pinnedActivities", JSON.stringify(pinned));
                    console.log(`Activity ${itemId} unpinned.`);
                    refreshPinnedActivityCards();  // Refresh the pinned tab (remove unpinned items)
                    updatePinnedCount();
                } 

                // Close modal
                closeModalHandler();
              } else {
                modalMessage.textContent = "Delete failed!";
                modalMessage.style.color = "red";
              }
            })
            .catch(error => {
              console.error("Delete Error:", error);
              modalMessage.textContent = "Something went wrong.";
              modalMessage.style.color = "red";
            });
          }
        });
      break;
      
      case "logout":
        fetch(`${window.location.origin}/user-login/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        .then(response => {
          if (!response.ok) throw new Error("Logout failed");
          return response.json();
        })
        .then(() => {
          console.log("Logout successful, redirecting to home page...");
          window.location.href = "/";
        })
        .catch(error => console.error("Logout Error:", error));
        break;
  
      default:
        console.warn("Unknown modal action:", modalType);
    }
  });
  
});