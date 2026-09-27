const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Interview = sequelize.define(
  "Interview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "applications",
        key: "id",
      },
    },
    round: {
      type: DataTypes.ENUM("APTITUDE", "TECHNICAL", "HR"),
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    scheduledTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    interviewer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "SCHEDULED",
    },
    result: {
      type: DataTypes.ENUM("PENDING", "PASS", "FAIL"),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "interviews",
    timestamps: true,
  }
);

module.exports = Interview;
