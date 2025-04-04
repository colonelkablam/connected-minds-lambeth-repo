import dotenv from 'dotenv';
dotenv.config(); // Only loads local .env when present

import pg from 'pg';
import bcrypt from 'bcrypt';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const { Pool } = pg;

// Create a new pool using either local .env or Heroku's env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const rl = readline.createInterface({ input, output });

const resetAdminPassword = async () => {
  try {
    console.log("Connected Minds Admin Password Reset");

    const useremail = await rl.question('Enter the admin user email to reset password for: ');

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, username, email FROM admin_accounts WHERE email = $1',
      [useremail]
    );

    if (userCheck.rows.length === 0) {
      console.log(`❌ No admin user found with email "${useremail}".`);
      rl.close();
      await pool.end();
      return;
    }

    const email = userCheck.rows[0].email;
    const username = userCheck.rows[0].username;
    const userId = userCheck.rows[0].id;

    console.log(`✅ Found user ${username} with email: ${email}`);

    const newPassword = await rl.question('Enter new password: ');
    const confirmPassword = await rl.question('Confirm new password: ');

    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match. Try again.');
      rl.close();
      await pool.end();
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE admin_accounts
      SET password_hash = $1
      WHERE username = $2
      RETURNING id, username, email;
    `;

    const { rows } = await pool.query(updateQuery, [hashedPassword, username]);

    console.log(`✅ Password successfully updated for ${rows[0].username} (${rows[0].email})`);

    rl.close();
    await pool.end();
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    rl.close();
    await pool.end();
  }
};

resetAdminPassword();
