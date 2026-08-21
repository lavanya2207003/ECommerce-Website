const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/", getCart);
router.post("/clear", clearCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeFromCart);

module.exports = router;
