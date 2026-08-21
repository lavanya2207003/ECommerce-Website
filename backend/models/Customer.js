const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: "",
  },
  total_orders: {
    type: Number,
    default: 0,
  },
  total_spent: {
    type: Number,
    default: 0,
  },
  registration_date: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["active", "disabled", "blocked"],
    default: "active",
  },
  blockReason: {
    type: String,
    default: "",
  },
  disabledAt: {
    type: Date,
    default: null,
  },
  blockedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
