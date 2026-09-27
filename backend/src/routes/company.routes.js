const express = require("express");
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
} = require("../controllers/company.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);

// Protected routes
router.post("/", authenticateUser, authorizeRole("ADMIN"), createCompany);
router.put("/:id", authenticateUser, authorizeRole("ADMIN", "RECRUITER"), updateCompany);

module.exports = router;
