const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    unique: true,
  },
  password: {
    type: String,
    select: false,
    default: null,
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

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

customerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);
