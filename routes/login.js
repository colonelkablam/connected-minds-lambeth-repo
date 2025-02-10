import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addFlashMessage } from '../middlewares/flash-messages.js';

// Import shared database connection
import pool from '../database/db.js';

const router = express.Router();

// **Login Route - Generates JWT**
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM admin_accounts WHERE email = $1';
    const { rows } = await pool.query(userQuery, [email]);

    if (rows.length === 0) {
      console.log("Login failed: Invalid email.");
      addFlashMessage(res, "error", "Invalid email or password."); // Flash message for invalid email
      return res.json({ success: false, message: "Invalid email." });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log("Login failed: Incorrect password.");
      addFlashMessage(res, "error", "Invalid email or password."); // Flash message for invalid password
      return res.json({ success: false, message: "Invalid password." });
    }

    // Update last_login timestamp
    const updateQuery = 'UPDATE admin_accounts SET last_login = NOW() WHERE id = $1';
    await pool.query(updateQuery, [user.id]);

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Store token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,  
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    console.log("Login successful for:", user.email);
    addFlashMessage(res, "success", "Login successful!"); // Success message
    return res.json({ success: true, message: "Login successful!" });

  } catch (error) {
    console.error("Login error:", error);
    addFlashMessage(res, "error", "An error occurred during login.");
    return res.status(500).json({ success: false, message: "An error occurred during login." });
  }
});

// **Logout Route - Clears the JWT Cookie**
router.post('/logout', (req, res) => {
  console.log(`Logging out...`);
  res.clearCookie("token");

  addFlashMessage(res, "success", "You have been logged out.");

  // Send JSON response instead of redirecting
  return res.json({ success: true });
});


export default router;
