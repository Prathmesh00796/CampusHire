const jwt = require("jsonwebtoken");

/**
 * Middleware: Verify JWT token from Authorization header
 * Attaches user payload to req.user if valid
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

/**
 * Middleware factory: Check if authenticated user has one of the allowed roles
 * @param {...string} allowedRoles - e.g., "ADMIN", "RECRUITER", "STUDENT"
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authenticateUser, authorizeRole };
