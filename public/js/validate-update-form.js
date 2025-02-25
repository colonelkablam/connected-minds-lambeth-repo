document.addEventListener("DOMContentLoaded", function () {
    const totalSpacesDropdown = document.getElementById("total_spaces");
    const spacesRemainingDropdown = document.getElementById("spaces_remaining");
    const ageLowerDropdown = document.getElementById("age_lower");
    const ageUpperDropdown = document.getElementById("age_upper");
    const costInput = document.getElementById("cost");
    const postcodeInput = document.getElementById("postcode");
    const startTimeDropdown = document.getElementById("start_time");
    const stopTimeDropdown = document.getElementById("stop_time");
    const startDateInput = document.getElementById("start_date");
    const stopDateInput = document.getElementById("stop_date");
    const form = document.getElementById("update-activity-form");
  

    // Handle time input validation

    startTimeDropdown.addEventListener("change", function () {

        const startTime = startTimeDropdown.value;
        stopTimeDropdown.innerHTML = ""; // Reset options

        if (!startTime) return; // If no start time selected, keep empty stop times

        // Generate stop time options (only times after start time)
        const [startH, startM] = startTime.split(":").map(Number);
        for (let h = startH; h <= 22; h++) {
            for (let m = (h === startH ? startM + 5 : 0); m < 60; m += 5) {
                let time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                let option = new Option(time, time);
                stopTimeDropdown.appendChild(option);
            }
        }
    });


    // Ensure stop date is not before start date
    startDateInput.addEventListener("change", function () {
        stopDateInput.min = startDateInput.value; 
    
        console.log("Start Date Selected:", startDateInput.value, typeof(startDateInput.value)); // Debugging
    });
    
    stopDateInput.addEventListener("change", function () {
        if (!startDateInput.value || !stopDateInput.value) return; // Prevent errors if either field is empty
    
        // Convert to Date objects for proper comparison
        const startDate = new Date(startDateInput.value);
        const stopDate = new Date(stopDateInput.value);
    
        if (stopDate < startDate) {
            alert("End date cannot be before start date.");
            stopDateInput.value = ""; // Clear invalid selection
        }
    });

  
    // Handle age range input validation

    ageLowerDropdown.addEventListener("change", function () {
        const lowerAge = parseInt(ageLowerDropdown.value, 10);
        const upperAge = parseInt(ageUpperDropdown.value, 10);

        if (isNaN(lowerAge)) {
          ageUpperDropdown.innerHTML = '<option value="" selected></option>';
        } else {  // Only proceed if lowerAge is valid
            if (upperAge < lowerAge) {
                ageUpperDropdown.value = lowerAge;
            }
            // Clear and update the remaining spaces dropdown options
            ageUpperDropdown.innerHTML = "";
            for (let i = lowerAge; i <= 110; i++) {
                let option = new Option(i, i);
                ageUpperDropdown.appendChild(option);
            }
        }
    });
  
      
    // Handle spaces range input validation

    totalSpacesDropdown.addEventListener("change", function () {
        const totalSpaces = parseInt(totalSpacesDropdown.value, 10);

        if (isNaN(totalSpaces)) {
          spacesRemainingDropdown.innerHTML = '<option value="" selected></option>';

        } else {
            // Set remaining spaces to the new total value
            spacesRemainingDropdown.value = totalSpaces;

            // Clear and update the remaining spaces dropdown options
            spacesRemainingDropdown.innerHTML = "";
            for (let i = totalSpaces; i >= 0; i--) {
                let option = new Option(i, i);
                spacesRemainingDropdown.appendChild(option);
            }
        }
    });
  
    
    // Enforce valid number(10,2) format in cost input 

    costInput.addEventListener("input", function () {
      this.value = this.value
        .replace(/[^0-9.]/g, "") // Remove invalid characters
        .replace(/(\..*?)\..*/g, "$1") // Ensure only one decimal
        .replace(/^(\d*\.\d{2}).*$/, "$1"); // Limit to 2 decimal places
    });
  
    // Auto-uppercase and format UK postcode  - this is for during input
    postcodeInput.addEventListener("input", function () {
      let formattedPostcode = this.value.toUpperCase().trim();
    
      // Automatically insert space if missing (e.g., SW1A1AA → SW1A 1AA)
      const formatted = formattedPostcode.replace(/^([A-Z]{1,2}\d[A-Z\d]?) ?(\d[A-Z]{2})$/, "$1 $2");
    
      this.value = formatted;
      validatePostcode(formatted);
    });

  
    // Check postcode validity using Postcodes.io API before submitting form
    async function validatePostcode(postcode) {
      const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase(); // Remove spaces for API request
      if (cleanPostcode.length < 5) {
        postcodeInput.style.border = "2px solid red";
        return;
      }
    
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}/validate`);
        const data = await response.json();
        
        if (data.result) {
          postcodeInput.style.border = "2px solid green"; // Valid
        } else {
          postcodeInput.style.border = "2px solid red"; // Invalid
        }
      } catch (error) {
        console.error("Error checking postcode:", error);
        postcodeInput.style.border = "2px solid red"; // Assume invalid on API failure
      }
    }
  
    /** Form Submission: Validate before submitting */
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Stop form submission until validation is complete

      const postcodeValue = postcodeInput.value.trim();
    
      // Final API validation before submission
      const isValid = await fetch(`https://api.postcodes.io/postcodes/${postcodeValue.replace(/\s+/g, "").toUpperCase()}/validate`)
        .then(res => res.json())
        .then(data => data.result)
        .catch(() => false);
    
      if (!isValid) {
        alert("Invalid UK postcode. Please check and try again.");
        return;
      }
        
      // If everything is valid, submit the form
      form.submit();
    });
  });