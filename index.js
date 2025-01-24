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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// handle local vs live deployment
const testEnvVariable = process.env.TESTENV || 999;;
const port = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL || "db url not loaded from process.env";

// Resolve __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// global variables
const defaultSearchData = {
  searchText: "",
  filtersEnabled: false, 
  filterDays: [], 
  filterAudience: [],
  filterCost: [],
  distance: 999, 
};

let searchData = defaultSearchData;

//let user = {name: "Nick"};
let user = null;

let activities = [
 
];

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));  // static files
app.set('view engine', 'ejs');                           // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));          // sets the dir for template engine (.render("*.ejs"))


// ROUTE HANDLING

// landing page route
app.get('/', (req, res) => {

  searchData = defaultSearchData;

  res.render('pages/index.ejs', {
    user,
    activities,
    searchData,
  });
});

// search route
app.post('/search', async (req, res) => {
  try {
    // Merge submitted form data with defaults
    searchData = {
      ...defaultSearchData,
      searchText: req.body.searchText || '',
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
      distance: parseFloat(req.body.distance) || 0,
    };

    console.log('Search Data:', searchData); // Debugging

    // Query database
    const searchQuery = `
      SELECT 
        a.name, 
        a.description, 
        v.postcode AS location, 
        p.name AS provider_name, 
        asess.activity_date, 
        asess.num_spaces_available, 
        a.cost 
      FROM activities a
      JOIN activity_sessions asess ON a.id = asess.activity_id
      JOIN providers p ON a.provider = p.id
      JOIN venues v ON a.venue = v.id
      WHERE a.name ILIKE $1 OR a.description ILIKE $1
      ORDER BY asess.activity_date ASC;
    `;

    const searchValue = `%${searchData.searchText}%`; // Use % for partial matches
    const { rows } = await pool.query(searchQuery, [searchValue]);

    console.log(rows);

    // Render results
    res.render('pages/index', {
      title: 'Search Results',
      user: user,
      activities: rows,
      searchData,
    });
  } catch (error) {
    console.error('Error executing search query:', error);
    res.status(500).send('An error occurred while performing the search.');
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
