const express = require("express");
const router = express.Router();
const { login, register, getMe } = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticateUser, getMe);

module.exports = router;
