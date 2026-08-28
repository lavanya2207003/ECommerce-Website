const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount_price: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount_percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  low_stock_threshold: {
    type: Number,
    default: 5,
  },
  images: [{
    type: String,
    default: "",
  }],
  cloudinaryPublicIds: [{
    type: String,
    default: "",
  }],
  sizes: [{
    type: String,
  }],
  badge: {
    type: String,
    enum: ["New", "Best Seller", "Trending", "Premium", ""],
    default: "",
  },
  is_featured: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  sold_count: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
  }],
}, { timestamps: true });

productSchema.virtual("status").get(function () {
  if (!this.is_active) return "Disabled";
  if (this.stock === 0) return "Out of Stock";
  if (this.stock <= this.low_stock_threshold) return "Low Stock";
  return "Active";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
