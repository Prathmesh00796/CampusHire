const express = require("express");
const router = express.Router();
const { getAllPlacements, createPlacement } = require("../controllers/placement.controller");
const { authenticateUser, authorizeRole } = require("../middleware/auth.middleware");

router.use(authenticateUser);

router.get("/", getAllPlacements);
router.post("/", authorizeRole("ADMIN"), createPlacement);

module.exports = router;
