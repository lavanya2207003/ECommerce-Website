const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { customerAuthMiddleware, generateToken } = require("../middleware/customerAuth");

// POST /api/customer/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const customer = await Customer.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(customer._id);
    res.status(201).json({
      message: "Registration successful.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration." });
  }
});

// POST /api/customer/auth/login
// Backward compatible: legacy email-only login still works (auto-creates if missing).
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!customer) {
      const created = await Customer.create({
        name: email.split("@")[0],
        email: email.toLowerCase().trim(),
        password: password || undefined,
      });
      const token = generateToken(created._id);
      return res.json({
        message: "Login successful.",
        token,
        customer: { id: created._id, name: created.name, email: created.email, status: created.status },
      });
    }

    if (customer.status === "disabled") {
      return res.status(403).json({ message: "Your account has been temporarily disabled. Please contact support.", status: "disabled" });
    }
    if (customer.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support.", status: "blocked" });
    }

    if (customer.password) {
      if (!password) {
        return res.status(400).json({ message: "Password is required." });
      }
      const isMatch = await customer.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    }

    const token = generateToken(customer._id);
    res.json({
      message: "Login successful.",
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email, status: customer.status },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/customer/auth/me
router.get("/me", customerAuthMiddleware, (req, res) => {
  res.json({
    customer: {
      id: req.customer._id,
      name: req.customer.name,
      email: req.customer.email,
      phone: req.customer.phone,
      status: req.customer.status,
    },
  });
});

module.exports = router;
