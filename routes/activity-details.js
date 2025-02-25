import express from 'express';
import { getActivityById } from '../database/activity-queries.js';

const router = express.Router();

// Render the activity details page (without injecting data)
router.get("/:id", async (req, res) => {
  res.render("./pages/activity-details.ejs"); // No activity data embedded
});

// API endpoint to get activity data
router.get("/api/get-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Activity ID is required" });
    }

    const activity = await getActivityById(id);

    console.log("In route:", activity);

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, activity }); // Consistent JSON response format

  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
