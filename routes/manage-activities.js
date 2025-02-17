import express from 'express';
import { isAuthenticated, authoriseRoles  } from '../middlewares/auth-JWT.js';
import pool from '../database/db.js'; // Import shared database connection

const router = express.Router();

router.get('/add', isAuthenticated, authoriseRoles('admin', 'supa_admin'), (req, res) => {
    res.render('./pages/add-activity.ejs'); // Make sure add-activity.ejs is in the views folder
});


// Handle adding a new activity
router.post('/add', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
    try {
        const {
            title, provider_name, description, participating_schools, day, start_time, stop_time, total_spaces, spaces_remaining,
            cost, contact_email, target_group, age_lower, age_upper, website, street_1, street_2, city, postcode
        } = req.body;

        console.log(req.body);

        // Convert empty fields to NULL
        const formattedWebsite = website.trim() === "" ? null : website;
        const formattedEmail = contact_email.trim() === "" ? null : contact_email;
        const formattedParticipatingSchools = participating_schools.trim() === "" ? null : participating_schools;
        const formattedStreet1 = street_1.trim() === "" ? null : street_1;
        const formattedStreet2 = street_2.trim() === "" ? null : street_2;
        const formattedCity = city.trim() === "" ? null : city;
        const formattedStartTime = start_time ? `${start_time}:00` : null;
        const formattedStopTime = stop_time ? `${stop_time}:00` : null;
        const formattedAgeLower = age_lower === "" ? null : age_lower;
        const formattedAgeUpper = age_upper === "" ? null : age_upper;


        
        // record who added 
        const added_by_id = req.user.id;

        // Insert into addresses table first
        const addressQuery = `
            INSERT INTO addresses (street_1, street_2, city, postcode) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const addressValues = [formattedStreet1, formattedStreet2, formattedCity, postcode];
        const addressResult = await pool.query(addressQuery, addressValues);
        const address_id = addressResult.rows[0].id;

        // Insert into activities table
        const activityQuery = `
            INSERT INTO activities_simple 
            (title, provider_name, description, participating_schools, day, start_time, stop_time, total_spaces, spaces_remaining, cost, 
            contact_email, target_group, age_lower, age_upper, website, address_id, added_by_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `;
        const activityValues = [
            title, provider_name, description, formattedParticipatingSchools, day, formattedStartTime, formattedStopTime, total_spaces, spaces_remaining, cost,
            formattedEmail, target_group, formattedAgeLower, formattedAgeUpper, formattedWebsite, address_id, added_by_id
        ];
        await pool.query(activityQuery, activityValues);

        res.redirect('/'); // Redirect to home page or activities list after submission
    } catch (error) {
        console.error("Error adding activity:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

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

    if (result.rows.length === 0) {
      return res.status(404).send("Activity not found");
    }

    res.render("./pages/edit-activity.ejs", { activity: result.rows[0] });

  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/update', isAuthenticated, authoriseRoles('admin', 'supa_admin'), async (req, res) => {
  try {
    const { id, title, provider_name, website, participating_schools, description, contact_email,
      day, start_time, stop_time, target_group, age_lower, age_upper, total_spaces, spaces_remaining, 
      cost, street_1, street_2, city, postcode } = req.body;

    const updateQuery = `
      UPDATE activities_simple
      SET 
        title = $1, provider_name = $2, website = $3, participating_schools = $4, 
        description = $5, contact_email = $6, day = $7, start_time = $8, stop_time = $9,
        target_group = $10, age_lower = $11, age_upper = $12, total_spaces = $13, 
        spaces_remaining = $14, cost = $15
      WHERE id = $16 RETURNING *`;

    const result = await pool.query(updateQuery, [
      title, provider_name, website, participating_schools, description, contact_email,
      day, start_time, stop_time, target_group, age_lower, age_upper, total_spaces, spaces_remaining, 
      cost, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Activity not found.");
    }

    //res.redirect(`/manage-activity/activity?id=${id}`); // Redirect back to the edit page

    res.redirect(`/activity/${id}`);


  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).send("Internal Server Error");
  }
});


export default router;
