import express from 'express';
import { isAuthenticated } from '../middlewares/auth-JWT.js';
import pool from '../database/db.js'; // Import shared database connection

const router = express.Router();

router.get('/add', isAuthenticated, (req, res) => {
    res.render('./pages/add-activity.ejs'); // Make sure add-activity.ejs is in the views folder
});


// Handle adding a new activity
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const {
            title, provider_name, description, day, total_spaces, spaces_remaining,
            cost, contact_email, target_group, website, street_1, street_2, city, postcode
        } = req.body;

        // Insert into addresses table first
        const addressQuery = `
            INSERT INTO addresses (street_1, street_2, city, postcode) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const addressValues = [street_1, street_2, city, postcode];
        const addressResult = await pool.query(addressQuery, addressValues);
        const address_id = addressResult.rows[0].id;

        // Insert into activities table
        const activityQuery = `
            INSERT INTO activities_simple 
            (title, provider_name, description, day, total_spaces, spaces_remaining, cost, 
            contact_email, target_group, website, address_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const activityValues = [
            title, provider_name, description, day, total_spaces, spaces_remaining, cost,
            contact_email, target_group, website, address_id
        ];
        await pool.query(activityQuery, activityValues);

        res.redirect('/'); // Redirect to home page or activities list after submission
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
