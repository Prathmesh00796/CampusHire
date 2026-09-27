const express = require("express");
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
} = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticateUser, changePassword);
router.get("/me", authenticateUser, getMe);

module.exports = router;
