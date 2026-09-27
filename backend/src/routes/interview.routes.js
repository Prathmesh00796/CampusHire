const express = require("express");
const router = express.Router();
const {
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewResult,
} = require("../controllers/interview.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.use(authenticateUser);

router.get("/", getAllInterviews);
router.get("/:id", getInterviewById);
router.post("/", authorizeRole("ADMIN", "RECRUITER"), createInterview);
router.patch("/:id", authorizeRole("ADMIN", "RECRUITER"), updateInterview);
router.patch("/:id/result", authorizeRole("ADMIN", "RECRUITER"), updateInterviewResult);

module.exports = router;
