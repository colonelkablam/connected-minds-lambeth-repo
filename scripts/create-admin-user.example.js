    import dotenv from 'dotenv';
    dotenv.config();
    
    import pg from 'pg';
    import bcrypt from 'bcrypt';
    
    const { Pool } = pg;     // using pool instead of client to manage connections
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    const createSuperUser = async () => {
      try {
        // THIS IS AN EXAMPLE!
        const username = 'testName';  // Change this to your desired username
        const plainPassword = 'megaSecretPassword123!'; // Change this to a strong password
        const email = 'test@email.com';
        const role = 'supa_admin';
        const fname = 'Nick';
        const lname = 'Harding';
    
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
        // Insert user into database
        const insertQuery = `
          INSERT INTO admin_accounts (username, password_hash, email, role, fname, lname)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, username, role;
        `;
    
        const { rows } = await pool.query(insertQuery, [username, hashedPassword, email, role, fname, lname]);
    
        console.log("Super user created:", rows[0]);
        await pool.end();
      } catch (error) {
        console.error("Error creating super user:", error);
      }
    };
    
    // Run the function
    createSuperUser();
    