const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (customer.status === "disabled") {
      return res.status(403).json({
        message: "Your account has been temporarily disabled. Please contact support.",
        status: "disabled",
      });
    }

    if (customer.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        status: "blocked",
      });
    }

    res.json({
      message: "Login successful.",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
