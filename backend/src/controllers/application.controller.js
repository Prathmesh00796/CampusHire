const { Application, Student, Job, Company, Interview } = require("../models");
const { evaluateEligibility } = require("../services/eligibility.service");

/**
 * POST /api/jobs/:jobId/apply
 * Student applies for a job.
 * System checks eligibility before allowing application.
 */
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get student profile from the logged-in user
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please complete your profile first.",
      });
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications.",
      });
    }

    // Check if deadline has passed
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed.",
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      where: { studentId: student.id, jobId },
    });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    // Check eligibility
    const eligibilityResult = evaluateEligibility(student, job);
    if (!eligibilityResult.eligible) {
      return res.status(400).json({
        success: false,
        message: "You do not meet the eligibility criteria for this job.",
        data: { eligibilityResult },
      });
    }

    // Create application
    const application = await Application.create({
      studentId: student.id,
      jobId,
      status: "APPLIED",
      appliedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: { application, eligibilityResult },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/applications
 * - Admin: all applications
 * - Student: only their own applications
 * - Recruiter: applications for their company's jobs
 */
const getAllApplications = async (req, res) => {
  try {
    const where = {};

    if (req.user.role === "STUDENT") {
      // Student sees only their applications
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) {
        return res.json({ success: true, data: [] });
      }
      where.studentId = student.id;
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "fullName", "email", "branch", "cgpa", "backlogs", "skills"],
        },
        {
          model: Job,
          as: "job",
          include: [{ model: Company, as: "company" }],
        },
      ],
      order: [["appliedAt", "DESC"]],
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/applications/:id
 * Return a single application with full details.
 */
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "fullName", "email", "branch", "cgpa", "backlogs", "skills"],
        },
        {
          model: Job,
          as: "job",
          include: [{ model: Company, as: "company" }],
        },
        { model: Interview, as: "interviews" },
      ],
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/applications/:id/status
 * Update application status (Admin or Recruiter).
 *
 * Valid transitions:
 * APPLIED → SHORTLISTED | REJECTED
 * SHORTLISTED → INTERVIEW | REJECTED
 * INTERVIEW → SELECTED | REJECTED
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const validTransitions = {
      APPLIED: ["SHORTLISTED", "REJECTED"],
      SHORTLISTED: ["INTERVIEW", "REJECTED"],
      INTERVIEW: ["SELECTED", "REJECTED"],
      SELECTED: [],
      REJECTED: [],
    };

    const allowedNextStatuses = validTransitions[application.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${application.status} to ${status}. Allowed transitions: ${allowedNextStatuses.join(", ") || "none"}`,
      });
    }

    application.status = status;

    if (status === "SHORTLISTED") {
      application.shortlistedAt = new Date();
    } else if (status === "REJECTED") {
      application.rejectedAt = new Date();
    }

    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};
