const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jobs",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "APPLIED",
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    shortlistedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    // Prevent duplicate application for the same student and job
    indexes: [
      {
        unique: true,
        fields: ["studentId", "jobId"],
      },
    ],
  }
);

module.exports = Application;
