const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const productRoutes = require("./routes/productRoutes");

connectDB().catch((err) => {
  console.error("Startup MongoDB error:", err.message);
});

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/payment")) {
    console.info(`[payment] ${req.method} ${req.path}`);
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Laya Store API is running" });
});

app.get("/api/health", (req, res) => {
  const ready = require("mongoose").connection.readyState === 1;
  res.json({
    success: true,
    message: "LayaStore API is running",
    mongodb: ready ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Payment API: http://localhost:${PORT}/api/payment`);
    console.log(`Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`Razorpay Test Mode credentials loaded: ${process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "yes" : "no"}`);
  });
}

module.exports = app;
