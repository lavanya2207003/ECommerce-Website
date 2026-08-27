const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("No MongoDB URI configured. Set MONGODB_URI in backend/.env");
    process.exit(1);
  }
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
    };

    if (uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      options.tls = true;
      options.tlsAllowInvalidCertificates = true;
    }

    const conn = await mongoose.connect(uri, options);
    console.log("MongoDB connected successfully");
    console.log(`MongoDB host: ${conn.connection.host}`);
    console.log(`MongoDB database: ${conn.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Check MONGODB_URI, Atlas IP whitelist, and network.");
    process.exit(1);
  }
};

module.exports = connectDB;
