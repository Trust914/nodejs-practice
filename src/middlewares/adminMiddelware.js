export function isAdminMiddleware(req, res, next) {
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      roleAdmin: false,
      message: "You are not authorised to view page, admin rights required",
    });
  }
  next();
}
