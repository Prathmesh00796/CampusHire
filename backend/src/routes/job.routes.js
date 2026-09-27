const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEligibleStudents,
} = require("../controllers/job.controller");
const {
  applyForJob,
} = require("../controllers/application.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

// Public: list and view jobs (auth optional — controller handles filtering)
router.get("/", (req, res, next) => {
  // Attach user if token present, but don't block unauthenticated access
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticateUser(req, res, next);
  }
  next();
}, getAllJobs);

router.get("/:id", getJobById);

// Protected job management
router.post("/", authenticateUser, authorizeRole("ADMIN", "RECRUITER"), createJob);
router.put("/:id", authenticateUser, authorizeRole("ADMIN", "RECRUITER"), updateJob);
router.delete("/:id", authenticateUser, authorizeRole("ADMIN"), deleteJob);

// Eligibility — list of eligible students for a job
router.get("/:jobId/eligible-students", authenticateUser, authorizeRole("ADMIN", "RECRUITER"), getEligibleStudents);

// Apply for a job (STUDENT only)
router.post("/:jobId/apply", authenticateUser, authorizeRole("STUDENT"), applyForJob);

module.exports = router;
