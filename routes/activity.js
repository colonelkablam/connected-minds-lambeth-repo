import express from 'express';
import pool from '../database/db.js'; // Ensure correct PostgreSQL connection import

const router = express.Router();

// API route to fetch activity details by ID
router.get('/api/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Activity ID is required" });
    }

    const query = `      
    SELECT 
    a.id,
    a.website,
    a.provider_name, 
    a.title,
    a.description, 
    a.day,
    a.address_id,
    addr.street_1,
    addr.street_2,
    addr.city,
    addr.postcode, -- Use this for mapping
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
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(result.rows[0]); // Always return JSON
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Return JSON even on errors
  }
});

export default router;
