import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// my stuff
import pool from '../database/db.js'; // Import shared database connection

const router = express.Router();

// **Login Route - Generates JWT**
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM admin_accounts WHERE email = $1';
    const { rows } = await pool.query(userQuery, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

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
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Store token in an HTTP-only cookie (Secure)
    res.cookie("token", token, {
      httpOnly: true,  // Prevents JavaScript from accessing token (XSS protection)
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 1 * 60 * 60 * 1000 // 1 hour
    });

    res.json({ success: true, message: "Login successful", token }); // Send token to client
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// **Logout Route - Clears the JWT Cookie**
router.post('/logout', (req, res) => {
  res.clearCookie("token"); // Removes JWT cookie
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
