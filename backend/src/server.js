require("dotenv").config();

const app = require("./app");
const { sequelize, testConnection } = require("./config/database");
require("./models"); // Import all models so they are registered with Sequelize

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Test database connection
  await testConnection();

  // 2. Sync all Sequelize models with MySQL
  //    alter: true — updates existing tables if schema changes (safe for dev)
  //    force: false — never drops and recreates tables
  await sequelize.sync({ alter: true });
  console.log("✅ Database schema synchronized.");

  // Check if database needs seeding
  const { Student } = require("./models");
  const studentCount = await Student.count();
  if (studentCount === 0) {
    console.log("🌱 Database is empty. Seeding initial DKTE placement data...");
    const { seed } = require("./seed/seed");
    await seed();
  }

  // 3. Start Express server
  app.listen(PORT, () => {
    console.log(`🚀 CampusHire API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
};

startServer();
