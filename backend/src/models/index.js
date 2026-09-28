// Central place to define all Sequelize models and their associations
const User = require("./User");
const Student = require("./Student");
const Company = require("./Company");
const Job = require("./Job");
const Application = require("./Application");
const Interview = require("./Interview");
const Placement = require("./Placement");
const Notification = require("./Notification");

// ─── User ↔ Notification ───────────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── User ↔ Student ────────────────────────────────────────────────────────
User.hasOne(Student, { foreignKey: "userId", as: "student" });
Student.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── Company ↔ Job ─────────────────────────────────────────────────────────
Company.hasMany(Job, { foreignKey: "companyId", as: "jobs" });
Job.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// ─── Student ↔ Application ─────────────────────────────────────────────────
Student.hasMany(Application, { foreignKey: "studentId", as: "applications" });
Application.belongsTo(Student, { foreignKey: "studentId", as: "student" });

// ─── Job ↔ Application ─────────────────────────────────────────────────────
Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// ─── Application ↔ Interview ───────────────────────────────────────────────
Application.hasMany(Interview, {
  foreignKey: "applicationId",
  as: "interviews",
});
Interview.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

// ─── Student ↔ Placement ───────────────────────────────────────────────────
Student.hasOne(Placement, { foreignKey: "studentId", as: "placement" });
Placement.belongsTo(Student, { foreignKey: "studentId", as: "student" });

// ─── Company ↔ Placement ───────────────────────────────────────────────────
Company.hasMany(Placement, { foreignKey: "companyId", as: "placements" });
Placement.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// ─── Job ↔ Placement ───────────────────────────────────────────────────────
Job.hasMany(Placement, { foreignKey: "jobId", as: "placements" });
Placement.belongsTo(Job, { foreignKey: "jobId", as: "job" });

module.exports = {
  User,
  Student,
  Company,
  Job,
  Application,
  Interview,
  Placement,
  Notification,
};
