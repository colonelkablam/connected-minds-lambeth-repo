import express from 'express';
import pool from '../database/db.js'; // Import the database connection

const router = express.Router();

// Search Route - Handles activity search with filters
router.post('/api/get-searched', async (req, res) => {
  try {
    // Merge submitted form data with defaults
    const searchData = {
      searchText: req.body.searchText ? req.body.searchText.match(/\b\w+\b/g) || [] : [],
      filtersEnabled: req.body.filtersEnabled === 'true',
      filterDays: Array.isArray(req.body.filterDays)
        ? req.body.filterDays
        : req.body.filterDays
        ? [req.body.filterDays]
        : [],
      filterAudience: Array.isArray(req.body.filterAudience)
        ? req.body.filterAudience
        : req.body.filterAudience
        ? [req.body.filterAudience]
        : [],
      filterCost: Array.isArray(req.body.filterCost)
        ? req.body.filterCost
        : req.body.filterCost
        ? [req.body.filterCost]
        : [],
    };

    // console.log('Search Data:', searchData); // Debugging

    // Start building query dynamically
    let searchQuery = `
      SELECT 
      a.id,
      a.website,
      a.participating_schools,
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
      a.age_lower,
      a.age_upper
      FROM activities_simple a
      LEFT JOIN addresses addr ON a.address_id = addr.id
      WHERE 1=1 
    `;

    // Query parameters
    const searchParams = [];
    let paramIndex = 1;

    // Add search text filter
    if (searchData.searchText.length !== 0) {
      const searchTerms = searchData.searchText.map(word => `%${word}%`); // Add wildcards for partial matching
      searchQuery += ` AND (a.provider_name ILIKE ANY($${paramIndex}::text[]) 
                        OR a.description ILIKE ANY($${paramIndex}::text[]) 
                        OR a.title ILIKE ANY($${paramIndex}::text[])) 
                        OR a.participating_schools ILIKE ANY($${paramIndex}::text[]) `;
      searchParams.push(searchTerms);
      paramIndex++;
    }

    // Add day filter if enabled
    if (searchData.filtersEnabled && searchData.filterDays.length > 0) {
      const partialDays = searchData.filterDays.map(day => `${day}%`);
      searchQuery += ` AND a.day ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(partialDays);
      paramIndex++;
    }

    // Add audience filter if enabled
    if (searchData.filtersEnabled && searchData.filterAudience.length > 0) {
      searchQuery += ` AND a.target_group ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(searchData.filterAudience);
      paramIndex++;
    }

    // Add cost filter if enabled
    if (searchData.filtersEnabled && searchData.filterCost.length > 0) {
      const costConditions = [];
      if (searchData.filterCost.includes("free")) {
        costConditions.push(`a.cost = 0`);
      }
      if (searchData.filterCost.includes("low cost")) {
        costConditions.push(`a.cost > 0 AND a.cost < 10`);
      }
      if (searchData.filterCost.includes("other")) {
        costConditions.push(`a.cost >= 10`);
      }

      if (costConditions.length > 0) {
        searchQuery += ` AND (${costConditions.join(" OR ")})`;
      }
    }

    // Order by day for better readability
    searchQuery += ` ORDER BY a.day ASC;`;

    // Execute query
    const { rows } = await pool.query(searchQuery, searchParams);

    // Return JSON response instead of rendering EJS
    res.json({ success: true, found_activities: rows });

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
      a.age_lower,
      a.age_upper
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
