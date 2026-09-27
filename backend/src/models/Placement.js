const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Placement = sequelize.define(
  "Placement",
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
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Package in LPA
    package: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    placementDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("CONFIRMED", "PENDING", "CANCELLED"),
      allowNull: false,
      defaultValue: "CONFIRMED",
    },
  },
  {
    tableName: "placements",
    timestamps: true,
  }
);

module.exports = Placement;
