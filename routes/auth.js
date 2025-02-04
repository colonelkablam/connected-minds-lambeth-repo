import express from "express";
const router = express.Router();

// Dummy user database (replace with real database logic)
const users = [
  { email: "nick@email.com", password: "1234", name: "Nick Harding" }
];

// Login Route (Handles POST request from login form)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("user email:", email, "password:", password);

  // Check if user exists
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = { name: user.name, email: user.email };
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
});

// Logout Route (Handles logout)
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

export default router;
