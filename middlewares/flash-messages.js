export function setFlashMessage(req, res, next) {
  // Read flash messages from cookies (if any)
  const flashMessage = req.cookies.flash ? JSON.parse(req.cookies.flash) : {};

  // Pass flash message to all views
  res.locals.flash = flashMessage;

  // Clear flash message cookie after it's read
  res.clearCookie("flash");

  next();
}
  
export function addFlashMessage(res, type, message) {
  // Store flash message in cookie (so it persists after redirects)
  res.cookie("flash", JSON.stringify({ [type]: message }), {
    httpOnly: false, // Allow client-side JavaScript to read it
    sameSite: "strict",
    maxAge: 5000 // Flash message disappears after 5 seconds
  });

  // Store in `res.locals` for immediate rendering
  res.locals.flash = { [type]: message };
}
  