const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { customerAuthMiddleware } = require("../middleware/customerAuth");
const { authMiddleware } = require("../middleware/auth");

router.post("/", customerAuthMiddleware, createOrder);
router.get("/my-orders", customerAuthMiddleware, getMyOrders);
router.get("/", authMiddleware, getAllOrders);
router.get("/:id", customerAuthMiddleware, getOrder);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
