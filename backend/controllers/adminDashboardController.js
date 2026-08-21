const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");

exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ is_active: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const totalOrders = await Payment.countDocuments();
    const pendingOrders = await Payment.countDocuments({ order_status: "pending" });
    const completedOrders = await Payment.countDocuments({ order_status: "delivered" });
    const cancelledOrders = await Payment.countDocuments({ order_status: "cancelled" });
    const totalCustomers = await Customer.countDocuments();

    const revenueResult = await Payment.aggregate([
      { $match: { payment_status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesResult = await Payment.aggregate([
      { $match: { payment_status: "completed", created_at: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todaySales = todaySalesResult[0]?.total || 0;

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySalesResult = await Payment.aggregate([
      { $match: { payment_status: "completed", created_at: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthlySales = monthlySalesResult[0]?.total || 0;

    res.json({
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers,
      totalRevenue,
      todaySales,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    const now = new Date();
    let groupFormat;
    let startDate;

    if (period === "daily") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } };
    } else if (period === "weekly") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      groupFormat = { $dateToString: { format: "%Y-W%V", date: "$created_at" } };
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$created_at" } };
    }

    const salesData = await Payment.aggregate([
      { $match: { payment_status: "completed", created_at: { $gte: startDate } } },
      { $group: { _id: groupFormat, revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ salesData });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Payment.aggregate([
      { $match: { payment_status: "completed" } },
      { $unwind: "$ordered_products" },
      {
        $group: {
          _id: "$ordered_products.name",
          totalSold: { $sum: "$ordered_products.quantity" },
          revenue: { $sum: "$ordered_products.total_price" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getOrdersByMonth = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const ordersByMonth = await Payment.aggregate([
      { $match: { created_at: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ ordersByMonth });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getCategorySales = async (req, res) => {
  try {
    const categorySales = await Payment.aggregate([
      { $match: { payment_status: "completed" } },
      { $unwind: "$ordered_products" },
      {
        $group: {
          _id: "$ordered_products.brand",
          totalSold: { $sum: "$ordered_products.quantity" },
          revenue: { $sum: "$ordered_products.total_price" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    res.json({ categorySales });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getCustomerGrowth = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const growth = await Customer.aggregate([
      { $match: { registration_date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$registration_date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ growth });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Payment.find()
      .sort({ created_at: -1 })
      .limit(10);

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getSalesHistory = async (req, res) => {
  try {
    const { period, page = 1, limit = 20 } = req.query;
    const query = { payment_status: "completed" };

    if (period) {
      const now = new Date();
      let startDate;

      if (period === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "yesterday") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.created_at = { $gte: startDate, $lt: endDate };
      } else if (period === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (period === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "yearly") {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      if (period !== "yesterday" && startDate) {
        query.created_at = { $gte: startDate };
      }
    }

    const total = await Payment.countDocuments(query);
    const orders = await Payment.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    res.json({ orders, total, totalRevenue, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
