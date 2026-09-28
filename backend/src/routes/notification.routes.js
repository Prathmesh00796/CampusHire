const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getOutbox,
  sendTestEmail,
} = require("../controllers/notification.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.use(authenticateUser);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

// Admin-only endpoints
router.get("/outbox", authorizeRole("ADMIN"), getOutbox);
router.post("/test-email", authorizeRole("ADMIN"), sendTestEmail);

module.exports = router;
