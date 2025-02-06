export function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next(); // User is logged in
    }
    res.redirect('/login'); // Redirect to login if not authenticated
  }
  
  export function isAuthorized(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      return next(); // User is logged in and has admin role
    }
    res.status(403).send("Unauthorized: You do not have permission to perform this action.");
  }
  