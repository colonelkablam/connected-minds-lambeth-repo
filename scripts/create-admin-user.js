import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import bcrypt from 'bcrypt';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const rl = readline.createInterface({ input, output });

const createSuperUser = async () => {
  try {
    console.log("Create a New Admin User");

    const username = await rl.question("Enter username (seen when logged in): ");

    let email;

    while (true) {
      email = await rl.question("Enter email (unique to user): ");
    
      // Check if the email already exists
      const emailCheck = await pool.query(
        'SELECT id FROM admin_accounts WHERE email = $1',
        [email]
      );
    
      if (emailCheck.rows.length > 0) {
        console.log(`❌ That email is already in use. Please enter a different email.`);
      } else {
        break; // Email is unique
      }
    }

    const validRoles = ['supa_admin', 'admin'];

    let role;
    
    while (true) {
      role = await rl.question("Enter role (supa_admin or admin): ");
      if (validRoles.includes(role)) break;
      console.log("❌ Invalid role. Please enter 'supa_admin' or 'admin'.");
    }
    
    const fname = await rl.question("Enter first name: ");
    const lname = await rl.question("Enter last name: ");
    const plainPassword = await rl.question("Enter password: ");
    const confirmPassword = await rl.question("Confirm password: ");

    if (plainPassword !== confirmPassword) {
      console.log("❌ Passwords do not match.");
      rl.close();
      await pool.end();
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const insertQuery = `
      INSERT INTO admin_accounts (username, password_hash, email, role, fname, lname)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, role;
    `;

    const { rows } = await pool.query(insertQuery, [
      username,
      hashedPassword,
      email,
      role,
      fname,
      lname,
    ]);

    console.log("✅ Super user created:", rows[0]);

    rl.close();
    await pool.end();
  } catch (error) {
    console.error("❌ Error creating super user:", error);
    rl.close();
    await pool.end();
  }
};

createSuperUser();
