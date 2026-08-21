const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    ref: "Order",
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  payment_status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  order_status: {
    type: String,
    enum: ["pending", "paid", "confirmed", "processing", "shipped", "delivered", "cancelled", "failed"],
    default: "pending",
  },
  payment_method: {
    type: String,
    default: null,
  },
  customer_details: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  delivery_address: {
    full_name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    house_flat: { type: String, default: "" },
    street: { type: String, default: "" },
    area: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    pincode: { type: String, default: "" },
    address_type: { type: String, enum: ["home", "office", "other"], default: "home" },
  },
  ordered_products: [{
    product_id: { type: String },
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    image: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
  }],
  price_breakdown: {
    total_mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon_code: { type: String, default: "" },
    coupon_discount: { type: Number, default: 0 },
    delivery_charges: { type: Number, default: 0 },
    platform_fee: { type: Number, default: 0 },
    gst_tax: { type: Number, default: 0 },
    final_amount: { type: Number, default: 0 },
  },
  delivery_info: {
    expected_date: { type: String, default: "" },
    shipping_method: { type: String, default: "Standard" },
    delivery_charges: { type: Number, default: 0 },
    estimated_time: { type: String, default: "5-7 business days" },
  },
  order_notes: { type: String, default: "" },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
