const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRecentApplications,
  getUpcomingInterviews,
  getApplicationStatusChart,
} = require("../controllers/dashboard.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.use(authenticateUser);

router.get("/stats", getDashboardStats);
router.get("/recent-applications", getRecentApplications);
router.get("/upcoming-interviews", getUpcomingInterviews);
router.get("/application-status-chart", getApplicationStatusChart);

module.exports = router;
