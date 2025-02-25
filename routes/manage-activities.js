import express from 'express';
import { isAuthenticated, authoriseRoles } from '../middlewares/auth-JWT.js';
import { addFlashMessage } from '../middlewares/flash-messages.js';
import { formatActivityData } from '../middlewares/format-data.js';
import pool from '../database/db.js'; // Import shared database connection
import { getAddressId } from "../database/activity-queries.js";

const router = express.Router();

router.get('/add', isAuthenticated, authoriseRoles('admin', 'supa_admin'), (req, res) => {
    addFlashMessage(res, "success", "Add new activity"); // Success message
    res.render('./pages/add-activity.ejs'); // Make sure add-activity.ejs is in the views folder
});


// Handle adding a new activity
router.post('/add', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
    try {

        // Format input data
        const formattedData = formatActivityData(req.body);

        // record who added 
        const added_by_id = req.user.id;

        // Insert into addresses table first
        const addressQuery = `
            INSERT INTO addresses (street_1, street_2, city, postcode) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const addressValues = [formattedData.street_1, formattedData.street_2, formattedData.city, formattedData.postcode];
        const addressResult = await pool.query(addressQuery, addressValues);
        const address_id = addressResult.rows[0].id;

        // Insert into activities table
        const activityQuery = `
            INSERT INTO activities_simple 
            (title, 
            provider_name, 
            description, 
            participating_schools, 
            day,
            start_date,
            stop_date,
            start_time, 
            stop_time,
            total_spaces, 
            spaces_remaining, 
            cost, 
            contact_email, 
            target_group, 
            age_lower, 
            age_upper, 
            website, 
            address_id, 
            added_by_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `;
        const activityValues = [
          formattedData.title, formattedData.provider_name, formattedData.description, formattedData.participating_schools, formattedData.day, 
          formattedData.start_date, formattedData.stop_date, formattedData.start_time, formattedData.stop_time, formattedData.total_spaces, formattedData.spaces_remaining, 
          formattedData.cost, formattedData.contact_email, formattedData.target_group, formattedData.age_lower, formattedData.age_upper, formattedData.website, 
          address_id, added_by_id
        ];
        await pool.query(activityQuery, activityValues);

        console.log("New activity added:", `${formattedData.title}`);
        addFlashMessage(res, "success", "New activity added!"); // Success message
        res.redirect('/'); // Redirect to home page or activities list after submission

    } catch (error) {

      addFlashMessage(res, "error", "Internal server error, activity not added."); // Success message
      console.error("Error adding activity:", error);
      res.redirect('/'); // Redirect to home page or activities list after error
    }
});


// handle enrollment (simple increase/decrease for now)
router.patch('/change-enrollment', isAuthenticated, authoriseRoles('admin', 'supa_admin'),  async (req, res) => {
    const { activity_id, action } = req.body;
  
    try {
      // Get current activity details
      const activity = await pool.query("SELECT spaces_remaining, total_spaces FROM activities_simple WHERE id = $1", [activity_id]);
  
      if (!activity.rows.length) {
        return res.status(404).json({ success: false, message: "Activity not found" });
      }
  
      let spaces_remaining = activity.rows[0].spaces_remaining;
  
      // Handle enrollment logic
      if (action === "increase" && spaces_remaining < activity.rows[0].total_spaces) {
        spaces_remaining++;
      } else if (action === "decrease" && spaces_remaining > 0) {
        spaces_remaining--;
      } else {
        return res.json({ success: false, message: "Invalid operation" });
      }
  
      // Update the database
      await pool.query("UPDATE activities_simple SET spaces_remaining = $1 WHERE id = $2", [spaces_remaining, activity_id]);
  
      // Determine the new availability class
      let availabilityClass = "text-green";
      let percentage = (spaces_remaining / activity.rows[0].total_spaces) * 100;
      if (spaces_remaining === 0) {
        availabilityClass = "text-red";
      } else if (percentage <= 33) {
        availabilityClass = "text-red";
      } else if (percentage <= 66) {
        availabilityClass = "text-amber";
      }
  
      // Respond to the frontend
      res.json({ 
        success: true, 
        spaces_remaining, 
        total_spaces: activity.rows[0].total_spaces, 
        availability_class: availabilityClass 
      });
  
    } catch (error) {
      console.error("Error updating activity spaces:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// handle loading up the update activity form with existing details
router.get('/update/:id', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
  try {
    const { id } = req.params; // Use params, NOT query

    if (!id) {
      return res.status(400).send("Activity ID is required");
    }

    const query = `      
    SELECT 
      a.id, 
      a.website, 
      a.provider_name, 
      a.participating_schools,
      a.title, 
      a.description, 
      a.day,
      a.start_date,
      a.stop_date,
      a.start_time, 
      a.stop_time,
      a.address_id, 
      addr.street_1, 
      addr.street_2, 
      addr.city, 
      addr.postcode,
      a.total_spaces, 
      a.spaces_remaining, 
      a.cost, 
      a.contact_email,
      a.target_group, 
      a.age_lower, 
      a.age_upper
    FROM activities_simple a
    LEFT JOIN addresses addr ON a.address_id = addr.id
    WHERE a.id = $1`;

    const result = await pool.query(query, [id]);

    let activity = result.rows[0];

    if (result.rows.length === 0) {
      console.log(`Unable to find activity ${id} to update.`);
      addFlashMessage(res, "error", `Activity ${id} not found!`); // error message
      return res.redirect('/'); // Redirect to home page after error
    }

    // Convert `YYYY-MM-DD` format to ensure it's correctly formatted for `<input type="date">`
    activity.start_date = activity.start_date ? activity.start_date.toISOString().split("T")[0] : "";
    activity.stop_date = activity.stop_date ? activity.stop_date.toISOString().split("T")[0] : "";

    console.log("Loaded activity to update:", `${id}`);

    addFlashMessage(res, "success", "Activity loaded!"); // Success message
    res.render("./pages/edit-activity.ejs", { activity: activity });

  } catch (error) {
    addFlashMessage(res, "error", "Internal server error."); // error message
    console.error("Error loading activity:", error);
    res.redirect('/'); // Redirect to home page after error
  }

});


// updating the selected activity with new details from the form 
// (should be a PUT as updating data but html form doesn't handle this but no issue rn)
router.post('/update/:id', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
  try {
    const { id } = req.params;          // Use params, NOT query
    const updated_by_id = req.user.id;   // record who updated 

    if (!id) {
      return res.status(400).send("Activity ID is required");
    }

    // Format input data
    const formattedData = formatActivityData(req.body);

    // Fetch `address_id`
    const address_id = await getAddressId(id);
    if (!address_id) {
        return res.status(404).send("Activity not found.");
    }

    // Update addresses table first
    const addressQuery = `
    UPDATE addresses 
    SET 
      street_1 = $1, 
      street_2 = $2, 
      city = $3, 
      postcode = $4 
    WHERE id = $5
    `;

    const addressValues = [formattedData.street_1, formattedData.street_2, formattedData.city, formattedData.postcode, address_id];
    await pool.query(addressQuery, addressValues);

    // format query to update activity in db - no need to update address_id
    const updateQuery = `
      UPDATE activities_simple
      SET 
        title = $1, 
        provider_name = $2, 
        description = $3, 
        participating_schools = $4, 
        day = $5,
        start_date = $6,
        stop_date = $7,
        start_time = $8, 
        stop_time = $9, 
        total_spaces = $10, 
        spaces_remaining = $11, 
        cost = $12, 
        contact_email = $13, 
        target_group = $14, 
        age_lower = $15, 
        age_upper = $16, 
        website = $17, 
        updated_by_id = $18,
        last_updated = NOW()
      WHERE id = $19 
      `;

      const activityValues = [
        formattedData.title, formattedData.provider_name, formattedData.description, formattedData.participating_schools, formattedData.day, 
        formattedData.start_date, formattedData.stop_date, formattedData.start_time, formattedData.stop_time, formattedData.total_spaces, formattedData.spaces_remaining,
        formattedData.cost, formattedData.contact_email, formattedData.target_group, formattedData.age_lower, formattedData.age_upper, formattedData.website, 
        updated_by_id, id
      ];

    await pool.query(updateQuery, activityValues);

    console.log("Activity updated:", `id: ${id}`);
    addFlashMessage(res, "success", "Activity updated!"); // Success message
    res.redirect('/'); // Redirect to home page or activities list after submission

  } catch (error) {

    addFlashMessage(res, "error", "Internal server error, activity not updated."); // Success message
    console.error("Error updating activity:", error);
    res.redirect('/'); // Redirect to home page or activities list after error
  }
});


// Delete an activity (Only for admin and supa_admin roles)
router.delete('/delete/:id', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
  try {
      const { id } = req.params; // Get activity ID from params

      if (!id) {
          return res.status(400).json({ success: false, message: "Activity ID is required" });
      }

      // Fetch address ID before deleting activity
      const activityQuery = `SELECT address_id FROM activities_simple WHERE id = $1`;
      const activityResult = await pool.query(activityQuery, [id]);

      if (activityResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: "Activity not found" });
      }

      const address_id = activityResult.rows[0].address_id;

      // Delete the activity
      const deleteActivityQuery = `DELETE FROM activities_simple WHERE id = $1`;
      await pool.query(deleteActivityQuery, [id]);

      // Delete the associated address (optional: if not used by another activity)
      if (address_id) {
          const deleteAddressQuery = `DELETE FROM addresses WHERE id = $1`;
          await pool.query(deleteAddressQuery, [address_id]);
      }

      console.log(`Activity ${id} deleted successfully`);
      addFlashMessage(res, "success", "Activity deleted successfully!"); // Flash message
      return res.json({ success: true, message: "Activity deleted successfully" });

  } catch (error) {
      console.error("Error deleting activity:", error);
      addFlashMessage(res, "error", "Internal server error, activity not deleted."); // Flash message
      return res.status(500).json({ success: false, message: "Internal server error" });
  }
});


export default router;
