const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employmentType: {
      type: DataTypes.ENUM("Full-time", "Internship", "Part-time", "Contract"),
      allowNull: false,
      defaultValue: "Full-time",
    },
    // Package in LPA (Lakhs Per Annum)
    package: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    minimumCGPA: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 6.0,
    },
    maximumBacklogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Eligible branches stored as JSON array e.g. ["CSE", "AI & ML", "IT"]
    eligibleBranches: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    // Required skills stored as JSON array e.g. ["Python", "SQL"]
    requiredSkills: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    // Graduation year e.g. 2025
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "CLOSED", "DRAFT"),
      allowNull: false,
      defaultValue: "OPEN",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

module.exports = Job;
