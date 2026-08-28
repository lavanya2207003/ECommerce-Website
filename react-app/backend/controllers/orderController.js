const Order = require("../models/Order");

// POST /api/orders  (customer)
exports.createOrder = async (req, res) => {
  try {
    const {
      items, total, shipping_address, price_breakdown,
      delivery_info, order_notes, coupon, payment_method,
      payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }
    if (total == null) {
      return res.status(400).json({ message: "Order total is required." });
    }

    const order = await Order.create({
      user: req.customer ? req.customer._id : null,
      order_id,
      items,
      total,
      shipping_address,
      price_breakdown,
      delivery_info,
      order_notes,
      coupon,
      payment_method: payment_method || "razorpay",
      payment_status: payment_status || "pending",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating order." });
  }
};

// GET /api/orders/my-orders (customer)
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.customer) {
      return res.status(401).json({ message: "Not authorized." });
    }
    const orders = await Order.find({ user: req.customer._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

// GET /api/orders/:id (customer or admin)
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (req.customer && order.user && String(order.user) !== String(req.customer._id)) {
      return res.status(403).json({ message: "Access denied." });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.order_status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;
    await order.save();
    res.json({ message: "Order updated successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
