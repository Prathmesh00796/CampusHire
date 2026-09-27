const { Placement, Student, Company, Job, Application } = require("../models");

/**
 * GET /api/placements
 * Return all placement records.
 */
const getAllPlacements = async (req, res) => {
  try {
    const placements = await Placement.findAll({
      include: [
        { model: Student, as: "student", attributes: ["id", "fullName", "email", "branch"] },
        { model: Company, as: "company", attributes: ["id", "name", "industry", "logo"] },
        { model: Job, as: "job", attributes: ["id", "title", "package"] },
      ],
      order: [["placementDate", "DESC"]],
    });

    res.json({ success: true, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/placements
 * Create a placement record when a student is finally selected (Admin only).
 */
const createPlacement = async (req, res) => {
  try {
    const { studentId, companyId, jobId, role, package: pkg, joiningDate } = req.body;

    if (!studentId || !companyId || !jobId || !role) {
      return res.status(400).json({
        success: false,
        message: "Student, company, job, and role are required.",
      });
    }

    // Verify student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Check if student is already placed
    const existingPlacement = await Placement.findOne({ where: { studentId } });
    if (existingPlacement) {
      return res.status(409).json({
        success: false,
        message: "This student already has a placement record.",
      });
    }

    // Mark the application as SELECTED
    const application = await Application.findOne({ where: { studentId, jobId } });
    if (application && application.status !== "SELECTED") {
      application.status = "SELECTED";
      await application.save();
    }

    const placement = await Placement.create({
      studentId,
      companyId,
      jobId,
      role,
      package: pkg,
      joiningDate,
      placementDate: new Date(),
      status: "CONFIRMED",
    });

    const placementWithDetails = await Placement.findByPk(placement.id, {
      include: [
        { model: Student, as: "student" },
        { model: Company, as: "company" },
        { model: Job, as: "job" },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Placement record created successfully. 🎉",
      data: placementWithDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllPlacements, createPlacement };
