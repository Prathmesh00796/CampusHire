/**
 * Centralized error handling middleware.
 * Must be the LAST middleware registered in app.js.
 */
const errorHandler = (err, req, res, next) => {
  // Sequelize unique constraint violation
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: err.errors[0]?.message || "Duplicate entry detected.",
    });
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: err.errors[0]?.message || "Validation error.",
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  // Default server error - never expose stack trace in production
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message || "Internal server error";

  console.error("❌ Server Error:", err);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
