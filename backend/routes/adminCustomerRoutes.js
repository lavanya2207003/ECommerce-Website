const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomer,
  updateCustomer,
  disableCustomer,
  blockCustomer,
  enableCustomer,
  deleteCustomer,
} = require("../controllers/adminCustomerController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getAllCustomers);
router.get("/:id", authMiddleware, getCustomer);
router.put("/:id", authMiddleware, updateCustomer);
router.patch("/:id/disable", authMiddleware, disableCustomer);
router.patch("/:id/block", authMiddleware, blockCustomer);
router.patch("/:id/enable", authMiddleware, enableCustomer);
router.delete("/:id", authMiddleware, deleteCustomer);

module.exports = router;
