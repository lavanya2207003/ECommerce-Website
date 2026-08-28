const Payment = require("../models/Payment");

exports.getPaymentStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const successful = await Payment.countDocuments({ payment_status: "completed" });
    const pending = await Payment.countDocuments({ payment_status: "pending" });
    const failed = await Payment.countDocuments({ payment_status: "failed" });
    const cancelled = await Payment.countDocuments({ payment_status: "cancelled" });

    const revenueResult = await Payment.aggregate([
      { $match: { payment_status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      total,
      successful,
      pending,
      failed,
      refunded: cancelled,
      totalRevenue,
    });
  } catch (error) {
    console.error("Payment stats error:", error);
    res.status(500).json({ message: "Server error fetching payment stats." });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      method = "",
      sortBy = "newest",
      startDate = "",
      endDate = "",
      minAmount = "",
      maxAmount = "",
    } = req.query;

    const query = {};

    if (status) {
      query.payment_status = status;
    }

    if (method) {
      query.payment_method = method;
    }

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.created_at.$lte = end;
      }
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
        { razorpay_payment_id: { $regex: search, $options: "i" } },
        { "customer_details.name": { $regex: search, $options: "i" } },
        { "customer_details.email": { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    if (sortBy === "oldest") {
      sort.created_at = 1;
    } else if (sortBy === "amount_high") {
      sort.amount = -1;
    } else if (sortBy === "amount_low") {
      sort.amount = 1;
    } else {
      sort.created_at = -1;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Payment.countDocuments(query),
    ]);

    res.json({
      payments,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Server error fetching payments." });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).lean();
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.json({ payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Server error fetching payment." });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.payment_status !== "completed") {
      return res.status(400).json({ message: "Only completed payments can be refunded." });
    }

    payment.payment_status = "cancelled";
    payment.order_status = "cancelled";
    await payment.save();

    res.json({ message: "Payment refunded successfully.", payment });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({ message: "Server error processing refund." });
  }
};
