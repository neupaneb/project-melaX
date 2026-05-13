const { authenticateToken } = require('./auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // First check if user is authenticated
  authenticateToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  });
};

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  // First check if user is authenticated
  authenticateToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is super admin
    if (!req.user.isSuperAdminUser()) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }

    next();
  });
};

module.exports = {
  requireAdmin,
  requireSuperAdmin
};
