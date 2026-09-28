const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Student } = require("../models");
const { sendPasswordResetEmail } = require("../services/email.service");

/**
 * POST /api/auth/login
 * Authenticate a user with email and password, return JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email (or allow studentCode/PRN)
    let user = await User.findOne({
      where: { email },
      include: [{ model: Student, as: "student" }],
    });

    if (!user) {
      // Check if user entered PRN instead of email
      const student = await Student.findOne({ where: { studentCode: email } });
      if (student) {
        user = await User.findByPk(student.userId, {
          include: [{ model: Student, as: "student" }],
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          student: user.student || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/register
 * Student self-registration with complete profile.
 */
const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      studentCode,
      branch,
      degree,
      graduationYear,
      cgpa,
      backlogs,
      skills,
      phone,
    } = req.body;

    const studentName = fullName || name;

    if (!studentName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check if PRN already exists
    if (studentCode) {
      const existingPRN = await Student.findOne({ where: { studentCode } });
      if (existingPRN) {
        return res.status(409).json({
          success: false,
          message: `A student with PRN ${studentCode} is already registered.`,
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: studentName,
      email,
      password: hashedPassword,
      role: "STUDENT",
    });

    // Create Student profile
    let studentProfile = null;
    try {
      const parsedSkills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Python", "SQL", "Git"];

      studentProfile = await Student.create({
        userId: newUser.id,
        studentCode: studentCode || `DKTE${String(newUser.id).padStart(5, "0")}`,
        fullName: studentName,
        email,
        phone: phone || "9876543210",
        branch: branch || "Computer Science and Engineering",
        degree: degree || "B.Tech",
        graduationYear: parseInt(graduationYear) || 2027,
        cgpa: parseFloat(cgpa) || 7.0,
        backlogs: parseInt(backlogs) || 0,
        skills: parsedSkills,
      });
    } catch (profileErr) {
      console.error("Error creating student profile on registration:", profileErr.message);
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Student account created successfully! Welcome to DKTE Placement Cell.",
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          student: studentProfile,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 * Request OTP to reset password.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your registered email address or PRN.",
      });
    }

    let user = await User.findOne({ where: { email } });

    // Also check by PRN if not found by email
    if (!user) {
      const student = await Student.findOne({ where: { studentCode: email } });
      if (student) {
        user = await User.findByPk(student.userId);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or PRN.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email with OTP
    (async () => {
      try {
        await sendPasswordResetEmail(user, otp);
      } catch (err) {
        console.error("Failed to send reset email:", err.message);
      }
    })();

    res.json({
      success: true,
      message: `Password reset verification code (OTP) sent to ${user.email}.`,
      data: { email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using verification code (OTP).
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP verification code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/change-password
 * Change password for authenticated logged-in user.
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's info.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "createdAt"],
      include: [{ model: Student, as: "student" }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
