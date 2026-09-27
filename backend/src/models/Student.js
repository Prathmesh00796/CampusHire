const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    studentCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degree: {
      type: DataTypes.ENUM("B.Tech", "B.E.", "MCA", "M.Tech", "BCA", "B.Sc"),
      allowNull: false,
      defaultValue: "B.Tech",
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cgpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    backlogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Skills stored as JSON array e.g. ["Python", "SQL", "React"]
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "students",
    timestamps: true,
  }
);

module.exports = Student;
