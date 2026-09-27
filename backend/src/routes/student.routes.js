const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  getMyProfile,
  createStudent,
  updateStudent,
} = require("../controllers/student.controller");
const { checkStudentEligibility } = require("../controllers/job.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authenticateUser);

router.get("/me", getMyProfile);
router.get("/", authorizeRole("ADMIN", "RECRUITER"), getAllStudents);
router.get("/:id", getStudentById);
router.post("/", authorizeRole("ADMIN"), createStudent);
router.put("/:id", updateStudent);

// Eligibility check: GET /api/students/:studentId/jobs/:jobId/eligibility
router.get("/:studentId/jobs/:jobId/eligibility", checkStudentEligibility);

module.exports = router;
