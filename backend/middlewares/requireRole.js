// Shared role guard. Thin wrapper on top of the existing requireAuth middleware
// (requireAuth must run first so req.user is populated).
// Usage: requireRole('ADMIN', 'HR')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of: ${roles.join(', ')}.`,
      });
    }
    next();
  };
}

module.exports = { requireRole };
