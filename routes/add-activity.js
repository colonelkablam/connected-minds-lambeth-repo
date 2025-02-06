import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js';
import pg from 'pg';

const router = express.Router();
const { Pool } = pg;     // using pool instead of client to manage connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Render "Add Activity" Form (only for authorized users)
router.get('/add-activity', isAuthenticated, isAuthorized, (req, res) => {
  res.render('pages/add-activity', { user: req.session.user });
});

// Handle "Add Activity" Form Submission
router.post('/add-activity', isAuthenticated, isAuthorized, async (req, res) => {
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
