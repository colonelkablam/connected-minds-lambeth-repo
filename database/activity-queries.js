// database/activityQueries.js
import pool from './db.js'; // Ensure correct PostgreSQL connection import
import { ACTIVITY_SELECT_FIELDS } from './search-fields.js';


// Get the address_id for a given activity ID
export async function getAddressId(activityId) {
    try {
        const query = `SELECT address_id FROM activities_simple WHERE id = $1`;
        const result = await pool.query(query, [activityId]);

        if (result.rows.length === 0) {
            return null; // No activity found
        }

        return result.rows[0].address_id;
    } catch (error) {
        console.error("Error fetching address_id:", error);
        throw error;
    }
}

// Fetches a single activity by ID
export const getActivityById = async (id) => {
    const query = `      
      SELECT ${ACTIVITY_SELECT_FIELDS}
      FROM activities_simple a
      LEFT JOIN addresses addr ON a.address_id = addr.id
      WHERE a.id = $1
    `;
  
    const { rows } = await pool.query(query, [id]);
    console.log("from getActivityById:", rows);
    return rows.length > 0 ? rows[0] : null; // Return activity or null
  };


// Builds the dynamic SQL query and parameters for activity search.
export const buildActivitySearchQuery = (searchData) => {
  let searchQuery = `
    SELECT ${ACTIVITY_SELECT_FIELDS}
    FROM activities_simple a
    LEFT JOIN addresses addr ON a.address_id = addr.id
    WHERE 1=1 
  `;

  const searchParams = [];
  let paramIndex = 1;

  // Search Text Filter
  if (searchData.searchText.length !== 0) {
    const searchTerms = searchData.searchText.map(word => `%${word}%`);
    searchQuery += ` 
      AND ((a.provider_name ILIKE ANY($${paramIndex}::text[]) 
         OR a.description ILIKE ANY($${paramIndex}::text[]) 
         OR a.title ILIKE ANY($${paramIndex}::text[]) 
         OR a.participating_schools ILIKE ANY($${paramIndex}::text[])))`;
    searchParams.push(searchTerms);
    paramIndex++;
  }

  if (searchData.filtersEnabled) {
    if (searchData.filterDays.length > 0) {
      const partialDays = searchData.filterDays.map(day => `${day}%`);
      searchQuery += ` AND a.day ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(partialDays);
      paramIndex++;
    }

    if (searchData.filterAudience.length > 0) {
      searchQuery += ` AND a.target_group ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(searchData.filterAudience);
      paramIndex++;
    }

    if (searchData.filterCost.length > 0) {
      const costConditions = [];
      if (searchData.filterCost.includes("free")) costConditions.push(`a.cost = 0`);
      if (searchData.filterCost.includes("low cost")) costConditions.push(`a.cost > 0 AND a.cost < 10`);
      if (searchData.filterCost.includes("other")) costConditions.push(`a.cost >= 10`);
      if (costConditions.length > 0) {
        searchQuery += ` AND (${costConditions.join(" OR ")})`;
      }
    }
  }

  searchQuery += `
    ORDER BY CASE 
      WHEN LOWER(a.day) = 'monday' THEN 1
      WHEN LOWER(a.day) = 'tuesday' THEN 2
      WHEN LOWER(a.day) = 'wednesday' THEN 3
      WHEN LOWER(a.day) = 'thursday' THEN 4
      WHEN LOWER(a.day) = 'friday' THEN 5
      WHEN LOWER(a.day) = 'saturday' THEN 6
      WHEN LOWER(a.day) = 'sunday' THEN 7
    END;
  `;

  return { searchQuery, searchParams };
};

// Executes the search query and returns activities.
export const getSearchedActivities = async (searchData) => {
  const { searchQuery, searchParams } = buildActivitySearchQuery(searchData);
  const { rows } = await pool.query(searchQuery, searchParams);
  return rows;
};

// Fetches pinned activities by their IDs.
export const getPinnedActivities = async (idArray) => {
  const query = `      
    SELECT ${ACTIVITY_SELECT_FIELDS}
    FROM activities_simple a
    LEFT JOIN addresses addr ON a.address_id = addr.id
    WHERE a.id = ANY($1)`;

  const { rows } = await pool.query(query, [idArray]);
  return rows;
};
