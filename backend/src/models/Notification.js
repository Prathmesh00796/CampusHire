const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("INFO", "SUCCESS", "WARNING", "OFFER", "REJECT"),
      defaultValue: "INFO",
    },
    emailSubject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailHtml: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    emailStatus: {
      type: DataTypes.ENUM("SENT", "PENDING", "FAILED"),
      defaultValue: "SENT",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

module.exports = Notification;
