const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const JWT_SECRET = process.env.JWT_SECRET || "laya_store_customer_secret_key_2026";

const generateToken = (id) => {
  return jwt.sign({ id, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
};

const customerAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({ message: "Invalid token or customer not found." });
    }
    req.customer = customer;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { customerAuthMiddleware, generateToken, JWT_SECRET };
