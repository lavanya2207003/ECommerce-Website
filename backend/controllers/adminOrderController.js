const Payment = require("../models/Payment");

exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.order_status = status;
    }

    if (search) {
      query.$or = [
        { "customer_details.name": { $regex: search, $options: "i" } },
        { "customer_details.email": { $regex: search, $options: "i" } },
        { order_id: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Payment.countDocuments(query);
    const orders = await Payment.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Payment.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const order = await Payment.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;

    await order.save();

    res.json({ message: "Order status updated successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const pending = await Payment.countDocuments({ order_status: "pending" });
    const confirmed = await Payment.countDocuments({ order_status: { $in: ["confirmed", "paid"] } });
    const processing = await Payment.countDocuments({ order_status: "processing" });
    const shipped = await Payment.countDocuments({ order_status: "shipped" });
    const delivered = await Payment.countDocuments({ order_status: "delivered" });
    const cancelled = await Payment.countDocuments({ order_status: "cancelled" });

    res.json({
      total,
      pending,
      confirmed: confirmed + processing,
      shipped,
      delivered,
      cancelled,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
