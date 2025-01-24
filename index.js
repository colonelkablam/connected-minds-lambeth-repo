import dotenv from 'dotenv';            // to treat .env as process
dotenv.config();                        // load .env variables into a process.env (for local development)

import express from 'express';
import pg from 'pg';
import bodyParser from "body-parser";

import path from 'path';         // needed for static files/ join
import { fileURLToPath } from 'url';    // needed for static files

const app = express()
const { Pool } = pg;    // using pool instead of client to manage connections

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000, // 30 seconds
});

// handle local vs live deployment
const testEnvVariable = process.env.TESTENV || 999;;
const port = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL || "db url not loaded from process.env";

// Resolve __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// global variables
const defaultSearchData = {
  filtersEnabled: false, 
  filterDays: [], 
  filterAudience: [],
  filterCost: [],
  distance: 999, 
};

let searchData = defaultSearchData;

let activities = [
  {
    name: 'TEST Yoga Class',
    date: '2025-01-28',
    description: 'A relaxing yoga session for all skill levels.',
    location: 'Community Center',
    cost: '0',
  },
  {
    name: 'TEST Art Workshop',
    date: '2025-01-29',
    description: 'Learn the basics of painting and drawing.',
    location: 'Art Studio',
    cost: '10',
  },
];

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));  // static files
app.set('view engine', 'ejs');                           // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));          // sets the dir for template engine (.render("*.ejs"))


// ROUTE HANDLING

// landing page route
app.get('/', (req, res) => {
  const user = null; // Replace with actual user data when logged in

  searchData = defaultSearchData;

  res.render('pages/index.ejs', {
    user,
    activities,
    searchData,
  });
});

// search route
app.post('/search', (req, res) => {

  console.log("filter days - ", req.body.filterDays);

  // Merge submitted form data with defaults
  searchData = {
    ...defaultSearchData,
    ...req.body,
    filtersEnabled: req.body.filtersEnabled === 'true', // Convert to boolean
    filterDays: req.body.filterDays || [], // Use as-is or default to an empty array
    filterAudience: req.body.filterAudience || [], // Use as-is or default to an empty array
    filterCost: req.body.filterCost || [], // Use as-is or default to an empty array
    distance: parseInt(req.body.distance, 10) || 0, // Convert to number
  };

  console.log('Search Data:', searchData); // Debugging

  // Example filtering logic
  const filteredActivities = activities.filter(activity => {
    // Implement filtering logic based on searchData
    return true; // Placeholder logic
  });

  // Pass searchData and results to the template
  res.render('pages/index', {
    title: 'Search Results',
    user: null,
    activities: filteredActivities,
    searchData,
  });
});



// `/testdb` route to return the list of tables
app.get('/testdb', async (req, res) => {
  try {
    // Query to get a list of tables
    const query = `
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    // Execute the query
    const result = await pool.query(query);

    // Extract table names and send as a response
    const tables = result.rows.map(row => row.table_name);
    res.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      error: 'Failed to fetch tables. Please try again later or contact support.',
    });
  }
});


// STARTING SERVER 
const server = app.listen(port, () => {
  console.log(`Listening on ${port}`);
});


// CLEAN UP
// Gracefully shut down the server
process.on('SIGTERM', async () => {
  try {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
      } else {
        console.log('HTTP server closed');
      }
      try {
        await pool.end();
        console.log('Database pool has been closed');
      } catch (dbErr) {
        console.error('Error closing database pool:', dbErr);
      } finally {
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Unexpected error during shutdown:', err);
    process.exit(1);
  }
});
