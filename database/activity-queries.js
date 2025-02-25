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
export async function getActivityById(id) {
  const query = `      
      SELECT ${ACTIVITY_SELECT_FIELDS}
      FROM activities_simple a
      LEFT JOIN addresses addr ON a.address_id = addr.id
      WHERE a.id = $1
    `;
  
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null; // Return activity or null
};

// Executes the search query and returns activities.
export async function getSearchedActivities(searchData) {
  const { searchQuery, searchParams } = buildActivitySearchQuery(searchData);
  const { rows } = await pool.query(searchQuery, searchParams);
  return rows;
};

// Builds the dynamic SQL query and parameters for activity search.
export  function buildActivitySearchQuery(searchData) {
  let searchQuery = `
    SELECT ${ACTIVITY_SELECT_FIELDS}
    FROM activities_simple a
    LEFT JOIN addresses addr ON a.address_id = addr.id
    WHERE 1=1
  `;

  let searchParams = [];
  let paramIndex = 1;

  // Search Text Filter (Ensure searchText exists before mapping)
  if (searchData.searchText && searchData.searchText.length > 0) {
    const searchTerms = searchData.searchText.map(word => `%${word}%`);
    searchQuery += ` 
      AND (a.provider_name ILIKE ANY($${paramIndex}::text[]) 
        OR a.description ILIKE ANY($${paramIndex}::text[]) 
        OR a.title ILIKE ANY($${paramIndex}::text[]) 
        OR a.participating_schools ILIKE ANY($${paramIndex}::text[]))`;
    searchParams.push(searchTerms);
    paramIndex++; // Only increment once
  }

  if (searchData.filtersEnabled) {
    // Filter by Days
    if (searchData.filterDays && searchData.filterDays.length > 0) {
      searchQuery += ` AND a.day ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(searchData.filterDays.map(day => `${day}%`));
      paramIndex++;
    }

    // Filter by Audience
    if (searchData.filterAudience && searchData.filterAudience.length > 0) {
      searchQuery += ` AND a.target_group ILIKE ANY($${paramIndex}::text[])`;
      searchParams.push(searchData.filterAudience);
      paramIndex++;
    }

    // Filter by Cost (Ensure query conditions are formatted correctly)
    if (searchData.filterCost && searchData.filterCost.length > 0) {
      const costConditions = [];
      if (searchData.filterCost.includes("free")) costConditions.push(`a.cost = 0`);
      if (searchData.filterCost.includes("low cost")) costConditions.push(`a.cost > 0 AND a.cost < 10`);
      if (searchData.filterCost.includes("other")) costConditions.push(`a.cost >= 10`);

      if (costConditions.length > 0) {
        searchQuery += ` AND (${costConditions.join(" OR ")})`;
      }
    }
  }

  // Sorting by Days of the Week
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
}


// Fetches pinned activities by their IDs.
export async function getPinnedActivities(idArray) {
  const query = `      
    SELECT ${ACTIVITY_SELECT_FIELDS}
    FROM activities_simple a
    LEFT JOIN addresses addr ON a.address_id = addr.id
    WHERE a.id = ANY($1)`;

  const { rows } = await pool.query(query, [idArray]);
  return rows;
};

// Insert new address and return ID
export async function insertAddress(street_1, street_2, city, postcode) {
  const query = `
      INSERT INTO addresses (street_1, street_2, city, postcode) 
      VALUES ($1, $2, $3, $4) RETURNING id
  `;
  const values = [street_1, street_2, city, postcode];
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

// Insert new activity
export async function insertActivity(activityData) {
  const query = `
      INSERT INTO activities_simple 
      (title,
      provider_name, 
      description, 
      participating_schools, 
      day, 
      start_date, 
      stop_date,
      start_time, 
      stop_time, 
      total_spaces, 
      spaces_remaining, 
      cost, 
      contact_email, 
      target_group, 
      age_lower, 
      age_upper, 
      website, 
      address_id, 
      added_by_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
  `;
  await pool.query(query, activityData);
}

// Update address
export async function updateAddress(addressData) {
  const query = `
      UPDATE addresses 
      SET street_1 = $1, street_2 = $2, city = $3, postcode = $4 
      WHERE id = $5
  `;
  await pool.query(query, addressData);
}

// Update activity
export async function updateActivity(activityData) {
  const query = `
      UPDATE activities_simple
      SET 
      title = $1,
      provider_name = $2,
      description = $3,
      participating_schools = $4, 
      day = $5,
      start_date = $6, 
      stop_date = $7, 
      start_time = $8, 
      stop_time = $9, 
      total_spaces = $10,
      spaces_remaining = $11, 
      cost = $12, 
      contact_email = $13, 
      target_group = $14, 
      age_lower = $15, 
      age_upper = $16, 
      website = $17, 
      updated_by_id = $18, 
      last_updated = NOW()
      WHERE id = $19
  `;
  await pool.query(query, activityData);
}

// Get enrollment details
export async function getEnrollment(activity_id) {
  const query = `SELECT spaces_remaining, total_spaces FROM activities_simple WHERE id = $1`;
  const result = await pool.query(query, [activity_id]);
  return result.rows[0] || null;
}

// Update enrollment
export async function updateEnrollment(spaces_remaining, activity_id) {
  const query = `UPDATE activities_simple SET spaces_remaining = $1 WHERE id = $2`;
  await pool.query(query, [spaces_remaining, activity_id]);
}

// Delete activity
export async function deleteActivityById(id) {
  const query = `DELETE FROM activities_simple WHERE id = $1 RETURNING address_id`;
  const result = await pool.query(query, [id]);
  return result.rows[0]?.address_id || null;
}

// Delete address
export async function deleteAddressById(address_id) {
  const query = `DELETE FROM addresses WHERE id = $1`;
  await pool.query(query, [address_id]);
}