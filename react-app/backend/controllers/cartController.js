const Cart = require("../models/Cart");

const addToCart = async (req, res) => {
  try {
    const { productName, price, image, quantity } = req.body;

    if (!productName || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "productName, price, and image are required",
      });
    }

    let cartItem = await Cart.findOne({ productName });

    if (cartItem) {
      cartItem.quantity += quantity || 1;
      await cartItem.save();
      return res.status(200).json({
        success: true,
        message: "Cart updated (quantity increased)",
        data: cartItem,
      });
    }

    const newItem = await Cart.create({
      productId: productName.toLowerCase().replace(/\s+/g, "-"),
      productName,
      price,
      image,
      quantity: quantity || 1,
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: newItem,
    });
  } catch (error) {
    console.error("addToCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const items = await Cart.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("getCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity == null || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const item = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: item,
    });
  } catch (error) {
    console.error("updateCartItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart item",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const item = await Cart.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("removeFromCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing item",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const filter = userId ? { userId } : {};
    const result = await Cart.deleteMany(filter);
    console.info("clearCart:", { filter, deletedCount: result.deletedCount });
    res.status(200).json({
      success: true,
      message: "Cart cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("clearCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
