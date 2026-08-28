const mongoose = require("mongoose");

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("No MongoDB URI configured. Set MONGODB_URI in environment variables.");
  }

  if (!cached.promise) {
    const options = {
      serverSelectionTimeoutMS: 10000,
    };

    if (uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      options.tls = true;
      options.tlsAllowInvalidCertificates = true;
    }

    if (!uri.includes("/laya_store")) {
      options.dbName = "laya_store";
    }

    cached.promise = mongoose.connect(uri, options).then((conn) => {
      console.log("MongoDB connected successfully");
      console.log(`MongoDB host: ${conn.connection.host}`);
      console.log(`MongoDB database: ${conn.connection.name}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
