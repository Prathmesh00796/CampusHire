const { Interview, Application, Student, Job, Company } = require("../models");
const { sendInterviewScheduledEmail } = require("../services/email.service");

/**
 * POST /api/interviews
 * Schedule a new interview round for an application (Admin or Recruiter).
 */
const createInterview = async (req, res) => {
  try {
    const {
      applicationId, round, scheduledDate, scheduledTime,
      interviewer, meetingLink, location, notes,
    } = req.body;

    if (!applicationId || !round) {
      return res.status(400).json({
        success: false,
        message: "Application ID and interview round are required.",
      });
    }

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    // Application must be SHORTLISTED or INTERVIEW to schedule an interview
    if (!["SHORTLISTED", "INTERVIEW"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule interview for application with status: ${application.status}. Application must be shortlisted first.`,
      });
    }

    // Update application status to INTERVIEW
    if (application.status === "SHORTLISTED") {
      application.status = "INTERVIEW";
      await application.save();
    }

    const interview = await Interview.create({
      applicationId,
      round,
      scheduledDate,
      scheduledTime,
      interviewer,
      meetingLink,
      location,
      notes,
      status: "SCHEDULED",
      result: "PENDING",
    });

    // Trigger async email notification
    (async () => {
      try {
        const student = await Student.findByPk(application.studentId);
        const job = await Job.findByPk(application.jobId);
        if (student && student.email && job) {
          const company = await Company.findByPk(job.companyId);
          await sendInterviewScheduledEmail(
            student,
            job,
            company || { name: "Recruiting Company" },
            {
              roundType: round,
              roundNumber: 1,
              scheduledAt: `${scheduledDate} ${scheduledTime || ""}`,
              meetingLink,
              interviewerName: interviewer,
            }
          );
        }
      } catch (err) {
        console.error("Email notification error on interview schedule:", err.message);
      }
    })();

    res.status(201).json({
      success: true,
      message: `${round} interview scheduled successfully.`,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/interviews
 * - Admin: all interviews
 * - Student: only their interviews
 * - Recruiter: interviews for their jobs
 */
const getAllInterviews = async (req, res) => {
  try {
    const includeOpts = [
      {
        model: Application,
        as: "application",
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "fullName", "email", "branch"],
          },
          {
            model: Job,
            as: "job",
            include: [{ model: Company, as: "company" }],
          },
        ],
      },
    ];

    let where = {};

    if (req.user.role === "STUDENT") {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) return res.json({ success: true, data: [] });

      // Get all application IDs for this student
      const applications = await Application.findAll({
        where: { studentId: student.id },
        attributes: ["id"],
      });
      const applicationIds = applications.map((a) => a.id);
      where.applicationId = applicationIds;
    }

    const interviews = await Interview.findAll({
      where,
      include: includeOpts,
      order: [["scheduledDate", "ASC"]],
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/interviews/:id
 * Return a single interview by ID.
 */
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [
        {
          model: Application,
          as: "application",
          include: [
            { model: Student, as: "student" },
            { model: Job, as: "job", include: [{ model: Company, as: "company" }] },
          ],
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/interviews/:id
 * Update interview details (date, time, interviewer, etc.)
 */
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const updatable = ["scheduledDate", "scheduledTime", "interviewer", "meetingLink", "location", "notes", "status"];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) interview[field] = req.body[field];
    });

    await interview.save();

    res.json({
      success: true,
      message: "Interview updated successfully.",
      data: interview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/interviews/:id/result
 * Record the result of a completed interview round (PASS or FAIL).
 */
const updateInterviewResult = async (req, res) => {
  try {
    const { result, notes } = req.body;

    if (!["PASS", "FAIL"].includes(result)) {
      return res.status(400).json({
        success: false,
        message: "Result must be PASS or FAIL.",
      });
    }

    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    interview.result = result;
    interview.status = "COMPLETED";
    if (notes) interview.notes = notes;

    await interview.save();

    res.json({
      success: true,
      message: `Interview result recorded: ${result}.`,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewResult,
};
