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
import manageActivity from './routes/add-activity.js';
import { setFlashMessage } from './middlewares/flash-messages.js';
import { authenticateUser } from './middlewares/auth-JWT.js';

// main 'app'
const app = express()
// handle local vs live deployment
const port = process.env.PORT || 3000;
app.locals.baseUrl = process.env.BASE_URL || ''; // Define base URL globally

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

app.use(setFlashMessage);                                 // Load flash messages from cookies
app.use(authenticateUser);                                // Apply JWT Authentication Middleware Globally (User Available in Views)


// ROUTE HANDLING

// Use Routes
app.use("/user-login", loginRoutes);
app.use("/manage-activity", manageActivity);

// landing page route
app.get('/', (req, res) => {
  searchData = defaultSearchData;

  res.render('pages/index.ejs', {
    activities,
    searchData,
    user: res.locals.user, // User from JWT
    flash: res.locals.flash // Pass flash messages
  });
});

app.post('/search', async (req, res) => {
  try {
    // Merge submitted form data with defaults
    searchData = {
      ...defaultSearchData,
      searchText: req.body.searchText ? req.body.searchText.trim() : '',
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

    console.log('Search Data:', searchData); // Debugging

    // Start building query dynamically
    let searchQuery = `
      SELECT 
        a.provider_name, 
        a.title,
        a.description, 
        a.day, 
        v.postcode AS location, 
        a.total_spaces, 
        a.spaces_remaining, 
        a.cost, 
        a.contact_email,
        a.target_group
      FROM activities_simple a
      LEFT JOIN venues v ON a.venue_id = v.id
      WHERE 1=1 
    `;

    // Query parameters
    const searchParams = [];
    let paramIndex = 1;

    // Add search text filter
    if (searchData.searchText) {
      searchQuery += ` AND (a.provider_name ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`;
      searchParams.push(`%${searchData.searchText}%`);
      paramIndex++;
    }

    // Add day filter if enabled
    if (searchData.filtersEnabled && searchData.filterDays.length > 0) {
      // Convert each abbreviation into a wildcard search (e.g., 'mon%' for 'Monday')
      const partialDays = searchData.filterDays.map(day => `${day}%`);

      searchQuery += ` AND a.day ILIKE ANY($${paramIndex})`;
      searchParams.push(partialDays);
      paramIndex++;
    }

    // Add audience filter if enabled
    if (searchData.filtersEnabled && searchData.filterAudience.length > 0) {
      searchQuery += ` AND a.target_group ILIKE ANY($${paramIndex})`;
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

    // Render results
    res.render('pages/index', {
      title: 'Search Results',
      activities: rows,
      searchData,
      user: res.locals.user, // User from JWT
      flash: res.locals.flash // Pass flash messages
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
