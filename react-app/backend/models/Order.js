const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  brand: { type: String, default: "" },
  size: { type: String, default: "" },
  color: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total_price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  order_id: { type: String, unique: true, sparse: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  shipping_address: { type: Object, default: {} },
  price_breakdown: { type: Object, default: {} },
  delivery_info: { type: Object, default: {} },
  order_notes: { type: String, default: "" },
  coupon: { type: Object, default: null },
  payment_method: { type: String, default: "razorpay" },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  order_status: {
    type: String,
    enum: ["confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "confirmed",
  },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
