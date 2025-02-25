import express from "express";
import { isAuthenticated, authoriseRoles } from "../middlewares/auth-JWT.js";
import { addFlashMessage } from "../middlewares/flash-messages.js";
import { formatActivityData } from "../middlewares/format-data.js";
import {
    insertAddress,
    insertActivity,
    getActivityById,
    updateAddress,
    updateActivity,
    getEnrollment,
    updateEnrollment,
    deleteActivityById,
    deleteAddressById
} from "../database/activity-queries.js";

const router = express.Router();


// GET: Load Add Activity Page
router.get("/add", isAuthenticated, authoriseRoles("admin", "supa_admin"), (req, res) => {
    addFlashMessage(res, "success", "Add new activity");
    res.render("./pages/add-activity.ejs");
});


// POST: Add New Activity
router.post("/add", isAuthenticated, authoriseRoles("admin", "supa_admin"), async (req, res) => {
    try {
        const formattedData = formatActivityData(req.body);
        const added_by_id = req.user.id;

        const address_id = await insertAddress(
            formattedData.street_1, formattedData.street_2, formattedData.city, formattedData.postcode
        );

        await insertActivity([
            formattedData.title, formattedData.provider_name, formattedData.description, formattedData.participating_schools,
            formattedData.day, formattedData.start_date, formattedData.stop_date, formattedData.start_time, formattedData.stop_time,
            formattedData.total_spaces, formattedData.spaces_remaining, formattedData.cost, formattedData.contact_email,
            formattedData.target_group, formattedData.age_lower, formattedData.age_upper, formattedData.website,
            address_id, added_by_id
        ]);

        addFlashMessage(res, "success", "New activity added!");
        res.redirect("/");
    } catch (error) {
        console.error("Error adding activity:", error);
        addFlashMessage(res, "error", "Internal server error, activity not added.");
        res.redirect("/");
    }
});


// POST: Update Activity
router.post("/update/:id", isAuthenticated, authoriseRoles("admin", "supa_admin"), async (req, res) => {
  try {
      const { id } = req.params;
      const updated_by_id = req.user.id;

      if (!id) {
          return res.status(400).send("Activity ID is required");
      }

      // Format the new activity data from form submission
      const formattedData = formatActivityData(req.body);

      // Fetch existing activity to get its `address_id`
      const existingActivity = await getActivityById(id);
      if (!existingActivity) {
          addFlashMessage(res, "error", "Activity not found.");
          return res.redirect("/");
      }

      const address_id = existingActivity.address_id;
      if (!address_id) {
          addFlashMessage(res, "error", "Address information missing.");
          return res.redirect("/");
      }

      // Update the address first
      await updateAddress([
          formattedData.street_1, formattedData.street_2, formattedData.city, formattedData.postcode, address_id
      ]);

      // Update the activity details
      await updateActivity([
          formattedData.title, formattedData.provider_name, formattedData.description, formattedData.participating_schools,
          formattedData.day, formattedData.start_date, formattedData.stop_date, formattedData.start_time, formattedData.stop_time,
          formattedData.total_spaces, formattedData.spaces_remaining, formattedData.cost, formattedData.contact_email,
          formattedData.target_group, formattedData.age_lower, formattedData.age_upper, formattedData.website,
          updated_by_id, id
      ]);

      console.log(`Activity ${id} updated successfully.`);
      addFlashMessage(res, "success", "Activity updated successfully!");
      res.redirect("/");

  } catch (error) {
      console.error("Error updating activity:", error);
      addFlashMessage(res, "error", "Internal server error, activity not updated.");
      res.redirect("/");
  }
});


// PATCH: Update Enrollment
router.patch("/change-enrollment", isAuthenticated, authoriseRoles("admin", "supa_admin"), async (req, res) => {
    try {
        const { activity_id, action } = req.body;
        const activity = await getEnrollment(activity_id);

        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        let { spaces_remaining, total_spaces } = activity;
        if (action === "increase" && spaces_remaining < total_spaces) spaces_remaining++;
        else if (action === "decrease" && spaces_remaining > 0) spaces_remaining--;
        else return res.json({ success: false, message: "Invalid operation" });

        await updateEnrollment(spaces_remaining, activity_id);
        res.json({ success: true, spaces_remaining, total_spaces });

    } catch (error) {
        console.error("Error updating enrollment:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// GET: Load Update Activity Page
router.get("/update/:id", isAuthenticated, authoriseRoles("admin", "supa_admin"), async (req, res) => {
    try {
        const activity = await getActivityById(req.params.id);
        if (!activity) {
            addFlashMessage(res, "error", "Activity not found!");
            return res.redirect("/");
        }

        res.render("./pages/edit-activity.ejs", { activity });
    } catch (error) {
        console.error("Error loading activity:", error);
        res.redirect("/");
    }
});

// DELETE: Remove Activity
router.delete("/delete/:id", isAuthenticated, authoriseRoles("admin", "supa_admin"), async (req, res) => {
    try {
        const address_id = await deleteActivityById(req.params.id);
        if (address_id) await deleteAddressById(address_id);
        addFlashMessage(res, "success", "Activity deleted successfully!");
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting activity:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
