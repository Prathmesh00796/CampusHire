const { Job, Company, Student, Application, Interview, Placement } = require("../models");
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

    const {
      companyId, title, description, location, employmentType, package: pkg,
      minimumCGPA, maximumBacklogs, eligibleBranches, requiredSkills,
      graduationYear, applicationDeadline, status,
    } = req.body;

    if (companyId !== undefined) job.companyId = parseInt(companyId);
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (location !== undefined) job.location = location;
    if (employmentType !== undefined) job.employmentType = employmentType;
    if (pkg !== undefined) job.package = pkg ? parseFloat(pkg) : null;
    if (minimumCGPA !== undefined) job.minimumCGPA = parseFloat(minimumCGPA);
    if (maximumBacklogs !== undefined) job.maximumBacklogs = parseInt(maximumBacklogs);
    if (eligibleBranches !== undefined) job.eligibleBranches = eligibleBranches;
    if (requiredSkills !== undefined) job.requiredSkills = requiredSkills;
    if (graduationYear !== undefined) job.graduationYear = graduationYear ? parseInt(graduationYear) : null;
    if (applicationDeadline !== undefined) job.applicationDeadline = applicationDeadline;
    if (status !== undefined) job.status = status;

    await job.save();

    const updatedJob = await Job.findByPk(job.id, {
      include: [{ model: Company, as: "company" }],
    });

    res.json({ success: true, message: "Job updated successfully.", data: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/jobs/:id
 * Delete a job (Admin only).
 * Performs safe cascade deletion of dependent applications, interviews, and placements.
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // 1. Find all applications for this job
    const applications = await Application.findAll({ where: { jobId: job.id } });
    const appIds = applications.map((a) => a.id);

    // 2. Delete interviews linked to these applications
    if (appIds.length > 0) {
      await Interview.destroy({ where: { applicationId: appIds } });
    }

    // 3. Delete any placement offers recorded for this job
    await Placement.destroy({ where: { jobId: job.id } });

    // 4. Delete applications for this job
    await Application.destroy({ where: { jobId: job.id } });

    // 5. Delete the job record itself
    await job.destroy();

    res.json({ success: true, message: "Job deleted successfully." });
  } catch (error) {
    console.error("Error deleting job:", error);
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
