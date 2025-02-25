import express from 'express';
import pool from '../database/db.js'; // Import the database connection
import { getSearchedActivities, getPinnedActivities } from '../database/activity-queries.js';

const router = express.Router();

// Search Route - Handles activity search with filters
router.post('/api/get-searched', async (req, res) => {
  try {
    const searchData = {
      searchText: req.body.searchText ? req.body.searchText.match(/\b\w+\b/g) || [] : [],
      filtersEnabled: req.body.filtersEnabled === 'true',
      filterDays: Array.isArray(req.body.filterDays) ? req.body.filterDays : req.body.filterDays ? [req.body.filterDays] : [],
      filterAudience: Array.isArray(req.body.filterAudience) ? req.body.filterAudience : req.body.filterAudience ? [req.body.filterAudience] : [],
      filterCost: Array.isArray(req.body.filterCost) ? req.body.filterCost : req.body.filterCost ? [req.body.filterCost] : [],
    };

    console.log('Search Data:', searchData);

    const foundActivities = await getSearchedActivities(searchData);
    res.json({ success: true, found_activities: foundActivities });

  } catch (error) {
    console.error('Error executing search query:', error);
    res.status(500).json({ success: false, message: 'An error occurred while performing the search.' });
  }
});


// Fetch pinned activities by IDs
router.get('/api/get-pinned', async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.json([]); // No IDs provided, return empty array
  }

  try {
    const idArray = ids.split(",").map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (idArray.length === 0) {
      return res.json([]);
    }

    const pinnedActivities = await getPinnedActivities(idArray);
    res.json(pinnedActivities);
  } catch (error) {
    console.error("Error fetching pinned activities:", error);
    res.status(500).json({ error: "Failed to fetch pinned activities" });
  }
});

export default router;
