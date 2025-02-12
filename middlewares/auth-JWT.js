import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

/**
 * Middleware 1: Extract user from JWT for all views
 * - Adds `user` to `res.locals` so it's available in templates
 */
export function authenticateUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null; // Ensure this is explicitly set, prevents modal flickering
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.locals.user = null; // Explicitly set to null instead of undefined
      return next();
    }

    res.locals.user = decoded; // Attach user data
    next();
  });
}

/**
 * Middleware 2: Protect routes that require authentication
 * - Rejects requests if no valid token is present
 * - Attaches `req.user` for backend authentication
 */
export function isAuthenticated(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // Attach user to `req.user`
    next(); // Proceed to the protected route
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
}

export function authoriseRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }
    next();
  };
}
