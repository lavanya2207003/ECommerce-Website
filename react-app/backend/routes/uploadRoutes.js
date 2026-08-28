const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { authMiddleware } = require("../middleware/auth");
const { upload: cloudinaryUpload } = require("../config/cloudinary");

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = ALLOWED_TYPES[file.mimetype] || "bin";
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WEBP, and GIF images are allowed."), false);
  }
};

const localUpload = multer({
  storage: localStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_KEY !== "YOUR_API_KEY"
  );
};

router.post("/", authMiddleware, (req, res) => {
  if (isCloudinaryConfigured()) {
    cloudinaryUpload.array("images", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No images uploaded." });
        }
        const urls = req.files.map((file) => file.path);
        const publicIds = req.files.map((file) => file.filename);
        res.json({ urls, publicIds });
      } catch (error) {
        res.status(500).json({ message: "Upload failed.", error: error.message });
      }
    });
  } else {
    localUpload.array("images", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No images uploaded." });
        }
        const urls = req.files.map(
          (file) => `/api/upload/images/${file.filename}`
        );
        res.json({ urls, publicIds: [] });
      } catch (error) {
        res.status(500).json({ message: "Upload failed.", error: error.message });
      }
    });
  }
});

router.get("/images/:filename", (req, res) => {
  const filePath = path.join(__dirname, "..", "uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "Image not found." });
    }
  });
});

module.exports = router;
