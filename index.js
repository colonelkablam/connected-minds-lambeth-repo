import dotenv from 'dotenv';
dotenv.config();                        // load .env variables into a process.env (for local development)

import express from 'express';
import pg from 'pg';
import path from 'path';                // needed for static files
import { fileURLToPath } from 'url';    // to treat .env as process

const app = express()
const { Pool } = pg;

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 30000, // 30 seconds
});

// handle local vs live deployment
const testEnvVariable = process.env.TESTENV || 999;;
const port = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL || "db url not loaded from process.env";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));  // static files
app.set('view engine', 'ejs');                           // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));          // sets the dir for template engine (.render("*.ejs"))


// ROUTE HANDLING

// landing page
app.get('/', (req, res) => {
  console.log(`Rendering 'pages/index' for route '/' - test ENV: ${testEnvVariable}`);
  res.send(`testing app - to rend pages/index.ejs - test ENV: ${testEnvVariable} - database URL: ${DB_URL}`);
})

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
