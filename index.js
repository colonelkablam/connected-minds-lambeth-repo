import dotenv from 'dotenv';            // to treat .env as process
dotenv.config();                        // load .env variables into a process.env (for local development)
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import path from 'path';                // needed for static files/ join
import { fileURLToPath } from 'url';    // needed for static files


// my stuff

// PostgreSQL connection configuration
import pool from './database/db.js'; // Import shared database connection
import formatDate from "./utility.js";  // returns a doy of week and date object
import loginRoutes from './routes/login.js';
import manageActivity from './routes/manage-activity.js';

const app = express()

// handle local vs live deployment
const port = process.env.PORT || 3000;

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
let activities = [];

// MIDDLEWARE
app.use(express.json());                                  // Add this to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));       // For form-encoded requests
app.use(cookieParser());                                  // Needed to read JWT cookies
app.use(express.static(path.join(__dirname, 'public')));  // static files
app.set('view engine', 'ejs');                            // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));          // sets the dir for template engine (.render("*.ejs"))


// Extract user from JWT in a middleware
app.use((req, res, next) => {
  let user = null;
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = decoded;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  res.locals.user = user; // Make `user` available in all templates
  next();
});


// ROUTE HANDLING

// Use Routes
app.use(loginRoutes);
app.use(manageActivity);

// landing page route
app.get('/', (req, res) => {
  searchData = defaultSearchData;

  res.render('pages/index.ejs', {
    activities,
    searchData,
    user: res.locals.user, // User from JWT
  });
});

// Search Route - Ensure `user` is passed
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

    // Apply date formatting
    rows.forEach(activity => {
      if (activity.activity_date) {
        const formattedDate = formatDate(activity.activity_date);
        activity.day = formattedDate.day;
        activity.formattedDate = formattedDate.date;
      }
    });

    // Render results
    res.render('pages/index', {
      title: 'Search Results',
      activities: rows,
      searchData,
      user: res.locals.user, // User from JWT
    });
  } catch (error) {
    console.error('Error executing search query:', error);
    res.status(500).send('An error occurred while performing the search.');
  }
});


// STARTING SERVER 
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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
