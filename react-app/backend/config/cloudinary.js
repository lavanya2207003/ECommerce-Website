const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "layastore/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1200, height: 1500, crop: "limit", quality: "auto", fetch_format: "auto" },
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, WEBP, and GIF images are allowed."), false);
    }
  },
});

async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, error.message);
    return false;
  }
}

async function uploadImage(filePath, folder = "layastore/products") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [
        { width: 1200, height: 1500, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Failed to upload image to Cloudinary:", error.message);
    return null;
  }
}

async function uploadImageFromUrl(url, folder = "layastore/products") {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      transformation: [
        { width: 1200, height: 1500, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Failed to upload image URL to Cloudinary:", error.message);
    return null;
  }
}

module.exports = {
  cloudinary,
  upload,
  deleteImage,
  uploadImage,
  uploadImageFromUrl,
};
