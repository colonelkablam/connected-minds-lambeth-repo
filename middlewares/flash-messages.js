export function setFlashMessage(req, res, next) {
  // Read flash messages from cookies (if any)
  const flashMessage = req.cookies.flash ? JSON.parse(req.cookies.flash) : {};

  // Pass flash message to all views
  res.locals.flash = flashMessage;

  // Do not clear the flash message cookie after it's read - this is done in client JS
  //res.clearCookie("flash");

  next();
}

export function addFlashMessage(res, type, message) {
  res.cookie("flash", JSON.stringify({ [type]: message }), {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: 6000 // 6 seconds lifespan
  });

  // Also store it in `res.locals` for immediate rendering
  res.locals.flash = { [type]: message };
}


