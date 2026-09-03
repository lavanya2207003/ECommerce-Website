const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Product = require("./models/Product");
const { uploadImageFromUrl, uploadImage } = require("./config/cloudinary");

function isCloudinaryUrl(url) {
  return url && url.includes("res.cloudinary.com");
}

function isLocalUpload(url) {
  return url && url.startsWith("/api/upload/images/");
}

function getLocalFilePath(url) {
  const filename = url.replace("/api/upload/images/", "");
  return path.join(__dirname, "uploads", filename);
}

async function migrateProductImages() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error("No MongoDB URI configured. Set MONGODB_URI or MONGO_URI in backend/.env");
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB\n");

    const products = await Product.find({});
    console.log(`LayaStore Cloudinary Migration\n`);
    console.log(`Found: ${products.length} products\n`);

    let uploaded = 0;
    let alreadyMigrated = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const num = `[${i + 1}/${products.length}]`;
      const images = product.images || [];
      const publicIds = product.cloudinaryPublicIds || [];

      if (images.length === 0) {
        console.log(`${num} ${product.name} → skipped (no images)`);
        skipped++;
        continue;
      }

      const newImages = [...images];
      const newPublicIds = [...publicIds];
      let changed = false;

      for (let j = 0; j < images.length; j++) {
        const imgUrl = images[j];
        const existingPid = publicIds[j];

        if (existingPid && existingPid.startsWith("layastore/")) {
          continue;
        }

        if (isCloudinaryUrl(imgUrl)) {
          continue;
        }

        let result = null;

        if (isLocalUpload(imgUrl)) {
          const filePath = getLocalFilePath(imgUrl);
          if (fs.existsSync(filePath)) {
            result = await uploadImage(filePath);
          } else {
            console.log(`${num} ${product.name} → FAILED (local file not found: ${imgUrl})`);
            failed++;
            continue;
          }
        } else if (imgUrl.startsWith("http")) {
          result = await uploadImageFromUrl(imgUrl);
        } else {
          console.log(`${num} ${product.name} → FAILED (unknown image format: ${imgUrl})`);
          failed++;
          continue;
        }

        if (result) {
          newImages[j] = result.secure_url;
          newPublicIds[j] = result.public_id;
          changed = true;
          console.log(`${num} ${product.name} → uploaded ✓`);
          uploaded++;
        } else {
          console.log(`${num} ${product.name} → FAILED (upload error)`);
          failed++;
        }
      }

      if (changed) {
        product.images = newImages;
        product.cloudinaryPublicIds = newPublicIds;
        await product.save();
      } else {
        const allMigrated = newPublicIds.every((pid) => pid && pid.startsWith("layastore/"));
        if (allMigrated) {
          alreadyMigrated++;
        }
      }
    }

    console.log(`\nMigration completed.`);
    console.log(`Successful: ${uploaded}`);
    console.log(`Already migrated: ${alreadyMigrated}`);
    console.log(`Skipped (no images): ${skipped}`);
    console.log(`Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateProductImages();
