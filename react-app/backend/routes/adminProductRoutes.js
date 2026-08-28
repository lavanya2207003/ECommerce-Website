const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getProductHistory,
  getCategories,
} = require("../controllers/adminProductController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getAllProducts);
router.get("/categories", authMiddleware, getCategories);
router.get("/history", authMiddleware, getProductHistory);
router.get("/:id", authMiddleware, getProduct);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.patch("/:id/stock", authMiddleware, updateStock);

module.exports = router;
