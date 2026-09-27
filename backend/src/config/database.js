const { Sequelize } = require("sequelize");

// Create Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false, // Set to console.log to see SQL queries during debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
