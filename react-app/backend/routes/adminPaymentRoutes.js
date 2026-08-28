const express = require("express");
const router = express.Router();
const {
  getPaymentStats,
  getAllPayments,
  getPayment,
  refundPayment,
} = require("../controllers/adminPaymentController");
const { authMiddleware } = require("../middleware/auth");

router.get("/stats", authMiddleware, getPaymentStats);
router.get("/", authMiddleware, getAllPayments);
router.get("/:id", authMiddleware, getPayment);
router.patch("/:id/refund", authMiddleware, refundPayment);

module.exports = router;
