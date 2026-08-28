const express = require("express");
const router = express.Router();
const { login, getProfile, updateProfile, changePassword } = require("../controllers/adminAuthController");
const { authMiddleware } = require("../middleware/auth");

router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
