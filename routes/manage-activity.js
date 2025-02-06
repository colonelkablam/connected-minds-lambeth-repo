import express from 'express';
import { isAuthenticated } from '../middlewares/authJWT.js';
import pool from '../database/db.js'; // Import shared database connection

const router = express.Router();

// **Render "Add Activity" Form (only for authorized users)**
router.get('/manage-activity', isAuthenticated, (req, res) => {
  res.render('pages/manage-activity', { user: req.user }); // Use req.user from JWT
});

// Handle "Add Activity" Form Submission
router.post('/add-activity', isAuthenticated, async (req, res) => {
  try {
    const { name, description, venue, provider, cost } = req.body;

    if (!name || !description || !venue || !provider || !cost) {
      return res.status(400).send("All fields are required.");
    }

    const insertQuery = `
      INSERT INTO activities (name, description, venue, provider, cost)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;

    const values = [name, description, venue, provider, cost];

    const result = await pool.query(insertQuery, values);

    console.log("New Activity Added:", result.rows[0]);
    res.redirect('/'); // Redirect to home or activity list after success
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).send("An error occurred while adding the activity.");
  }
});

export default router;
