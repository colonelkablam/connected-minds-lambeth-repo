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

  // **EVENT LISTENER FOR LOGIN, DELETE & LOGOUT BUTTONS**
  document.body.addEventListener("click", function (event) {
    
    // LOGIN BUTTON CLICKED
    if (event.target.id === "login-button") {
      event.preventDefault();
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
    } 
    
    // DELETE BUTTON CLICKED
    else if (event.target.classList.contains("delete-button")) {
      const itemId = event.target.getAttribute("data-id");
      showModal({
        title: "Confirm Deletion",
        message: "Are you sure you want to delete this item?",
        confirmAction: function () {
          fetch(`${window.location.origin}/delete-item/${itemId}`, { method: "DELETE" })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log("Item deleted!");
              closeModalHandler();
              setTimeout(() => window.location.reload(), 500);
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
    }

    // LOGOUT BUTTON CLICKED
    else if (event.target.id === "logout-button") {
      event.preventDefault(); // Prevent default link behavior
      console.log("Logout button clicked...");

      fetch(`${window.location.origin}/user-login/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Logout failed");
        }
        return response.json();
      })
      .then(() => {
        console.log("Logout successful, redirecting to home page...");
        window.location.href = "/"; // Redirect after logout
      })
      .catch(error => console.error("Logout Error:", error));
    }

  });

});
