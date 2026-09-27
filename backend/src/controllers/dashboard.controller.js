const { Student, Company, Job, Application, Interview, Placement } = require("../models");
const { Op } = require("sequelize");

/**
 * GET /api/dashboard/stats
 * Return high-level stats for the admin dashboard.
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      activeJobs,
      totalApplications,
      totalInterviews,
      selectedApplications,
      totalPlacements,
    ] = await Promise.all([
      Student.count(),
      Company.count(),
      Job.count({ where: { status: "OPEN" } }),
      Application.count(),
      Interview.count({ where: { status: "SCHEDULED" } }),
      Application.count({ where: { status: "SELECTED" } }),
      Placement.count(),
    ]);

    // Placement rate = (placed students / total students) * 100
    const placementRate =
      totalStudents > 0
        ? Math.round((totalPlacements / totalStudents) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCompanies,
        activeJobs,
        totalApplications,
        upcomingInterviews: totalInterviews,
        selectedCandidates: selectedApplications,
        totalPlacements,
        placementRate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/dashboard/recent-applications
 * Return the 10 most recent applications.
 */
const getRecentApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "fullName", "email", "branch"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "title"],
          include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
        },
      ],
      order: [["appliedAt", "DESC"]],
      limit: 10,
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/dashboard/upcoming-interviews
 * Return upcoming scheduled interviews.
 */
const getUpcomingInterviews = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interviews = await Interview.findAll({
      where: {
        status: "SCHEDULED",
        scheduledDate: { [Op.gte]: today },
      },
      include: [
        {
          model: Application,
          as: "application",
          include: [
            { model: Student, as: "student", attributes: ["id", "fullName", "email"] },
            {
              model: Job,
              as: "job",
              attributes: ["id", "title"],
              include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
            },
          ],
        },
      ],
      order: [["scheduledDate", "ASC"], ["scheduledTime", "ASC"]],
      limit: 10,
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/dashboard/application-status-chart
 * Return application counts grouped by status for chart rendering.
 */
const getApplicationStatusChart = async (req, res) => {
  try {
    const statuses = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

    const counts = await Promise.all(
      statuses.map((status) => Application.count({ where: { status } }))
    );

    const chartData = statuses.map((status, index) => ({
      status,
      count: counts[index],
    }));

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentApplications,
  getUpcomingInterviews,
  getApplicationStatusChart,
};
