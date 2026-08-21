const express = require("express");
const router = express.Router();
const {
  getStats,
  getSalesChart,
  getTopProducts,
  getOrdersByMonth,
  getCategorySales,
  getCustomerGrowth,
  getRecentOrders,
  getSalesHistory,
} = require("../controllers/adminDashboardController");
const { authMiddleware } = require("../middleware/auth");

router.get("/stats", authMiddleware, getStats);
router.get("/sales-chart", authMiddleware, getSalesChart);
router.get("/top-products", authMiddleware, getTopProducts);
router.get("/orders-by-month", authMiddleware, getOrdersByMonth);
router.get("/category-sales", authMiddleware, getCategorySales);
router.get("/customer-growth", authMiddleware, getCustomerGrowth);
router.get("/recent-orders", authMiddleware, getRecentOrders);
router.get("/sales-history", authMiddleware, getSalesHistory);

module.exports = router;
