const { Student, User, Application, Job, Company } = require("../models");

/**
 * GET /api/students
 * Return list of all students (Admin only).
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/students/:id
 * Return a single student by ID.
 */
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/students/me
 * Return the student profile of the currently logged-in student user.
 */
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/students
 * Create a new student profile (linked to a user).
 */
const createStudent = async (req, res) => {
  try {
    const {
      userId,
      studentCode,
      fullName,
      email,
      phone,
      branch,
      degree,
      graduationYear,
      cgpa,
      backlogs,
      skills,
    } = req.body;

    const student = await Student.create({
      userId,
      studentCode,
      fullName,
      email,
      phone,
      branch,
      degree,
      graduationYear,
      cgpa,
      backlogs,
      skills: skills || [],
    });

    res.status(201).json({
      success: true,
      message: "Student profile created successfully.",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/students/:id
 * Update a student's profile.
 */
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Students can only update their own profile; admins can update any
    if (req.user.role === "STUDENT" && student.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile.",
      });
    }

    const updatableFields = [
      "fullName", "phone", "branch", "degree", "graduationYear",
      "cgpa", "backlogs", "skills", "resumeUrl", "profileImage",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    res.json({
      success: true,
      message: "Student profile updated successfully.",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getMyProfile,
  createStudent,
  updateStudent,
};
