// database/activityQueries.js
import pool from '../database/db.js'; // Ensure correct PostgreSQL connection import

/** Get the address_id for a given activity ID */
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