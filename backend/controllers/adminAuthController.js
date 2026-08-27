const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { JWT_SECRET } = require("../middleware/auth");

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!admin.is_active) {
      return res.status(403).json({ message: "Account has been deactivated." });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    admin.last_login = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("[admin:login] error:", error.message);
    if (error.name === "MongooseError" || error.message.includes("Mongo")) {
      return res.status(503).json({ message: "Authentication service temporarily unavailable. Please try again." });
    }
    res.status(500).json({ message: "Server error during login." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        avatar: req.admin.avatar,
        last_login: req.admin.last_login,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const admin = req.admin;

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (avatar) admin.avatar = avatar;

    await admin.save();

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required." });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
