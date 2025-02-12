import express from 'express';
import pool from '../database/db.js'; // Ensure this points to your database connection

const router = express.Router();

// Fetch pinned activities by IDs
router.get('/get-pinned-activities', async (req, res) => {
  const { ids } = req.query;
  
  if (!ids) {
    return res.json([]); // No IDs provided, return empty array
  }

  try {
    const idArray = ids.split(",").map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (idArray.length === 0) {
      return res.json([]);
    }

    const query = `      
      SELECT 
      a.id,
      a.website,
      a.provider_name, 
      a.title,
      a.description, 
      a.day,
      a.start_time,
      a.stop_time,
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
      a.age_range
      FROM activities_simple a
      LEFT JOIN addresses addr ON a.address_id = addr.id
      WHERE a.id = ANY($1)`;
    
    const { rows } = await pool.query(query, [idArray]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching pinned activities:", error);
    res.status(500).json({ error: "Failed to fetch pinned activities" });
  }
});

export default router;
