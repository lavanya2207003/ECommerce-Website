const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const router = express.Router();

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

router.post("/create-order", async (req, res) => {
  try {
    const { amount, receipt, order_id, customer_email } = req.body;
    console.info("[payment:create-order] request", { order_id, amount, receipt });

    if (customer_email) {
      const customer = await Customer.findOne({ email: customer_email.toLowerCase().trim() });
      if (customer && (customer.status === "disabled" || customer.status === "blocked")) {
        console.warn("[payment:create-order] blocked customer attempted order creation", { email: customer_email, status: customer.status });
        return res.status(403).json({
          success: false,
          error: customer.status === "disabled"
            ? "Your account has been temporarily disabled. Please contact support."
            : "Your account has been blocked. Please contact support.",
        });
      }
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials are not configured");
      return res.status(503).json({
        success: false,
        error: "Payment gateway is not configured",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      console.warn("[payment:create-order] invalid amount", { amount });
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ success: false, error: "Payment gateway is not configured" });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: receipt || "receipt_" + Date.now(),
    });

    const payload = {
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      merchant_order_id: order_id || null,
    };
    console.info("[payment:create-order] Razorpay order created", {
      order_id: payload.order.id,
      amount: payload.order.amount,
      currency: payload.order.currency,
    });
    res.json(payload);
  } catch (error) {
    const gatewayError = error?.error?.description || error?.error?.reason || error?.message || "Razorpay request failed";
    const actionableError = gatewayError.includes("Cannot read properties of undefined")
      ? "Unable to reach Razorpay API. Check backend internet access/firewall for api.razorpay.com:443."
      : gatewayError;
    console.error("[payment:create-order] Razorpay order creation error", {
      message: actionableError,
      statusCode: error?.statusCode,
      code: error?.error?.code,
    });
    res.status(500).json({
      success: false,
      error: actionableError,
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      amount,
      currency,
      customer_details,
      delivery_address,
      ordered_products,
      price_breakdown,
      delivery_info,
      order_notes,
    } = req.body;
    console.info("[payment:verify] request", { order_id, razorpay_order_id, razorpay_payment_id });

    if (customer_details?.email) {
      const customer = await Customer.findOne({ email: customer_details.email.toLowerCase().trim() });
      if (customer && (customer.status === "disabled" || customer.status === "blocked")) {
        console.warn("[payment:verify] blocked customer attempted order", { email: customer_details.email, status: customer.status });
        return res.status(403).json({
          success: false,
          error: customer.status === "disabled"
            ? "Your account has been temporarily disabled. Please contact support."
            : "Your account has been blocked. Please contact support.",
        });
      }
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details",
      });
    }

    const existingPayment = await Payment.findOne({
      $or: [{ razorpay_payment_id }, { razorpay_order_id }],
    });
    if (existingPayment && existingPayment.payment_status === "completed") {
      console.info("[payment:verify] duplicate verification detected, returning existing record", {
        razorpay_payment_id,
        payment_record_id: existingPayment._id.toString(),
      });
      return res.json({
        success: true,
        verified: true,
        duplicate: true,
        payment: {
          id: existingPayment.razorpay_payment_id,
          amount: Math.round(existingPayment.amount * 100),
          currency: existingPayment.currency,
          status: existingPayment.payment_status,
          method: existingPayment.payment_method,
        },
        payment_record_id: existingPayment._id,
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedSignatureBuffer = Buffer.from(razorpay_signature, "utf8");
    const isAuthentic =
      expectedSignatureBuffer.length === receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);

    if (!isAuthentic) {
      const failedPayment = new Payment({
        order_id: order_id || "unknown",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: amount || 0,
        currency: currency || "INR",
        payment_status: "failed",
        order_status: "failed",
        customer_details,
        delivery_address,
        ordered_products,
        price_breakdown,
        delivery_info,
        order_notes,
      });
      await failedPayment.save();
      console.warn("[payment:verify] invalid signature", { order_id, razorpay_payment_id });

      return res.status(400).json({
        success: false,
        verified: false,
        error: "Invalid signature",
      });
    }

    const razorpayFetch = getRazorpay();
    if (!razorpayFetch) {
      return res.status(503).json({ success: false, error: "Payment gateway is not configured" });
    }
    const payment = await razorpayFetch.payments.fetch(razorpay_payment_id);
    console.info("[payment:verify] payment fetched", {
      razorpay_payment_id,
      status: payment.status,
      amount: payment.amount,
    });

    const paymentRecord = new Payment({
      order_id: order_id || "unknown",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: payment.amount / 100,
      currency: payment.currency,
      payment_status: "completed",
      order_status: "confirmed",
      payment_method: payment.method,
      customer_details,
      delivery_address,
      ordered_products,
      price_breakdown,
      delivery_info,
      order_notes,
    });
    await paymentRecord.save();
    console.info("[payment:verify] payment verified and saved", {
      order_id,
      order_status: "confirmed",
      razorpay_payment_id,
      payment_record_id: paymentRecord._id.toString(),
    });

    res.json({
      success: true,
      verified: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
      },
      order_status: paymentRecord.order_status,
      payment_record_id: paymentRecord._id,
    });
  } catch (error) {
    console.error("[payment:verify] Payment verification error:", error.message);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
});

router.get("/orders/:orderId", async (req, res) => {
  try {
    const payment = await Payment.findOne({ order_id: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, payment });
  } catch (error) {
    console.error("[payment:get-order] Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    console.error("[payment:list-orders] Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

module.exports = router;
