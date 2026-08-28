const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
} = require("../controllers/adminOrderController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getAllOrders);
router.get("/stats", authMiddleware, getOrderStats);
router.get("/:id", authMiddleware, getOrder);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
