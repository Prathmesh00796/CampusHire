const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/application.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.use(authenticateUser);

router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.patch("/:id/status", authorizeRole("ADMIN", "RECRUITER"), updateApplicationStatus);

module.exports = router;
