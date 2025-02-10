import dotenv from 'dotenv';            // to treat .env as process
dotenv.config();                        // load .env variables into a process.env (for local development)
import express from 'express';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import path from 'path';                // needed for static files/ join
import { fileURLToPath } from 'url';    // needed for static files


// my stuff

// PostgreSQL connection configuration
import pool from './database/db.js'; // Import shared database connection
import loginRoutes from './routes/login.js';
import manageActivity from './routes/manage-activities.js';
import searchRoutes from './routes/search.js';
import pinnedRoutes from './routes/pinned.js';
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
app.use("/", searchRoutes);
app.use("/", pinnedRoutes);

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
