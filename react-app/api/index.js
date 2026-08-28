const connectDB = require("../backend/config/db");

let app;
let ready = false;

async function init() {
  if (ready) return app;
  await connectDB();
  app = require("../backend/server");
  ready = true;
  return app;
}

module.exports = async function handler(req, res) {
  try {
    const expressApp = await init();
    return expressApp(req, res);
  } catch (error) {
    console.error("[api/index] init error:", error.message);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
