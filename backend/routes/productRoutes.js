const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Public: get all active products
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice, featured, badge, page = 1, limit = 500 } = req.query;
    const query = { is_active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (featured === "true") {
      query.is_featured = true;
    }

    if (badge) {
      query.badge = badge;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    else if (sort === "price-high") sortOption = { price: -1 };
    else if (sort === "name-az") sortOption = { name: 1 };
    else if (sort === "name-za") sortOption = { name: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/products/categories - Public: get all active categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { is_active: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/products/category/:category - Public: products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category.toLowerCase(),
      is_active: true,
    }).sort({ createdAt: -1 });
    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/products/:id - Public: get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.is_active) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
