const mongoose = require("mongoose");

const productHistorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["created", "updated", "deleted", "stock_updated", "price_updated", "status_changed"],
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  admin_name: {
    type: String,
    required: true,
  },
  previous_value: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  new_value: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("ProductHistory", productHistorySchema);
