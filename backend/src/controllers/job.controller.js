const { Job, Company, Student, Application } = require("../models");
const { evaluateEligibility } = require("../services/eligibility.service");

/**
 * GET /api/jobs
 * Return all jobs with company details.
 * Students and public can only see OPEN jobs.
 */
const getAllJobs = async (req, res) => {
  try {
    const where = {};

    // Non-admins / non-recruiters only see OPEN jobs
    if (!req.user || req.user.role === "STUDENT") {
      where.status = "OPEN";
    }

    const jobs = await Job.findAll({
      where,
      include: [{ model: Company, as: "company" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/jobs/:id
 * Return a single job with company info and application count.
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Company, as: "company" }],
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Count total applications for this job
    const applicationCount = await Application.count({ where: { jobId: job.id } });

    res.json({
      success: true,
      data: { ...job.toJSON(), applicationCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/jobs
 * Create a new job opening (Admin or Recruiter).
 */
const createJob = async (req, res) => {
  try {
    const {
      companyId, title, description, location, employmentType,
      package: pkg, minimumCGPA, maximumBacklogs, eligibleBranches,
      requiredSkills, graduationYear, applicationDeadline, status,
    } = req.body;

    if (!companyId || !title) {
      return res.status(400).json({
        success: false,
        message: "Company and job title are required.",
      });
    }

    const job = await Job.create({
      companyId,
      title,
      description,
      location,
      employmentType: employmentType || "Full-time",
      package: pkg,
      minimumCGPA: minimumCGPA || 6.0,
      maximumBacklogs: maximumBacklogs !== undefined ? maximumBacklogs : 0,
      eligibleBranches: eligibleBranches || [],
      requiredSkills: requiredSkills || [],
      graduationYear,
      applicationDeadline,
      status: status || "OPEN",
    });

    const jobWithCompany = await Job.findByPk(job.id, {
      include: [{ model: Company, as: "company" }],
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully.",
      data: jobWithCompany,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/jobs/:id
 * Update an existing job (Admin or Recruiter).
 */
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const updatable = [
      "title", "description", "location", "employmentType", "package",
      "minimumCGPA", "maximumBacklogs", "eligibleBranches", "requiredSkills",
      "graduationYear", "applicationDeadline", "status",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();

    res.json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/jobs/:id
 * Delete a job (Admin only).
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    await job.destroy();

    res.json({ success: true, message: "Job deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/jobs/:jobId/eligible-students
 * Return all students who are eligible for a specific job.
 */
const getEligibleStudents = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const allStudents = await Student.findAll();

    const eligibleStudents = allStudents
      .map((student) => {
        const result = evaluateEligibility(student, job);
        return { student, eligibilityResult: result };
      })
      .filter(({ eligibilityResult }) => eligibilityResult.eligible);

    res.json({
      success: true,
      data: {
        job,
        eligibleCount: eligibleStudents.length,
        students: eligibleStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/students/:studentId/jobs/:jobId/eligibility
 * Check if a specific student is eligible for a specific job.
 * Returns detailed check results.
 */
const checkStudentEligibility = async (req, res) => {
  try {
    const { studentId, jobId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: "company" }],
    });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const result = evaluateEligibility(student, job);

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          cgpa: student.cgpa,
          backlogs: student.backlogs,
          branch: student.branch,
          skills: student.skills,
          graduationYear: student.graduationYear,
        },
        job: {
          id: job.id,
          title: job.title,
          company: job.company?.name,
          minimumCGPA: job.minimumCGPA,
          maximumBacklogs: job.maximumBacklogs,
          eligibleBranches: job.eligibleBranches,
          requiredSkills: job.requiredSkills,
          graduationYear: job.graduationYear,
        },
        eligibilityResult: result,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEligibleStudents,
  checkStudentEligibility,
};
