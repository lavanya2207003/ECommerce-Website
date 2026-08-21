const Payment = require("../models/Payment");
const Customer = require("../models/Customer");

exports.getAllCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status && ["active", "disabled", "blocked"].includes(status)) {
      query.status = status;
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ customers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const orders = await Payment.find({
      $or: [
        { "customer_details.email": customer.email },
        { "customer_details.name": customer.name },
      ],
    }).sort({ created_at: -1 });

    res.json({ customer, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, is_active } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (name) customer.name = name;
    if (email) customer.email = email.toLowerCase();
    if (phone) customer.phone = phone;
    if (typeof is_active === "boolean") customer.is_active = is_active;

    await customer.save();
    res.json({ message: "Customer updated successfully.", customer });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.disableCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    customer.status = "disabled";
    customer.is_active = false;
    customer.disabledAt = new Date();
    await customer.save();

    res.json({ message: "Customer disabled successfully.", customer });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.blockCustomer = async (req, res) => {
  try {
    const { reason } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    customer.status = "blocked";
    customer.is_active = false;
    customer.blockedAt = new Date();
    customer.blockReason = reason || "";
    await customer.save();

    res.json({ message: "Customer blocked successfully.", customer });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.enableCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    customer.status = "active";
    customer.is_active = true;
    customer.disabledAt = null;
    customer.blockedAt = null;
    customer.blockReason = "";
    await customer.save();

    res.json({ message: "Customer enabled successfully.", customer });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
