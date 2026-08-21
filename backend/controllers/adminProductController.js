const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");
const { deleteImage } = require("../config/cloudinary");

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (status) {
      if (status === "active") query.is_active = true;
      else if (status === "disabled") query.is_active = false;
      else if (status === "out_of_stock") query.stock = 0;
      else if (status === "low_stock") query.stock = { $gt: 0, $lte: 5 };
      else if (status === "featured") query.is_featured = true;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = new Product(productData);
    await product.save();

    await ProductHistory.create({
      product_id: product._id,
      product_name: product.name,
      action: "created",
      details: `Product "${product.name}" was created.`,
      admin_id: req.admin._id,
      admin_name: req.admin.name,
      new_value: { name: product.name, price: product.price, stock: product.stock },
    });

    res.status(201).json({ message: "Product created successfully.", product });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const previousValue = { name: product.name, price: product.price, stock: product.stock, is_active: product.is_active };
    const updates = req.body;

    if (updates.images && Array.isArray(updates.images)) {
      const oldImages = product.images || [];
      const oldPublicIds = product.cloudinaryPublicIds || [];

      const removedPublicIds = [];
      oldPublicIds.forEach((pid, idx) => {
        if (pid && !updates.images.includes(oldImages[idx])) {
          removedPublicIds.push(pid);
        }
      });

      removedPublicIds.forEach((pid) => deleteImage(pid));

      if (updates.cloudinaryPublicIds && Array.isArray(updates.cloudinaryPublicIds)) {
        product.cloudinaryPublicIds = updates.cloudinaryPublicIds;
      }
      product.images = updates.images;
      delete updates.images;
      delete updates.cloudinaryPublicIds;
    }

    Object.keys(updates).forEach((key) => {
      if (key === "sizes" && Array.isArray(updates[key])) {
        product[key] = updates[key];
      } else if (key === "tags" && Array.isArray(updates[key])) {
        product[key] = updates[key];
      } else {
        product[key] = updates[key];
      }
    });

    await product.save();

    await ProductHistory.create({
      product_id: product._id,
      product_name: product.name,
      action: "updated",
      details: `Product "${product.name}" was updated.`,
      admin_id: req.admin._id,
      admin_name: req.admin.name,
      previous_value: previousValue,
      new_value: { name: product.name, price: product.price, stock: product.stock, is_active: product.is_active },
    });

    res.json({ message: "Product updated successfully.", product });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
      product.cloudinaryPublicIds.forEach((pid) => {
        if (pid) deleteImage(pid);
      });
    }

    await ProductHistory.create({
      product_id: product._id,
      product_name: product.name,
      action: "deleted",
      details: `Product "${product.name}" was deleted.`,
      admin_id: req.admin._id,
      admin_name: req.admin.name,
      previous_value: { name: product.name, price: product.price, stock: product.stock },
    });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const previousStock = product.stock;
    product.stock = stock;
    await product.save();

    await ProductHistory.create({
      product_id: product._id,
      product_name: product.name,
      action: "stock_updated",
      details: `Stock updated from ${previousStock} to ${stock}.`,
      admin_id: req.admin._id,
      admin_name: req.admin.name,
      previous_value: previousStock,
      new_value: stock,
    });

    res.json({ message: "Stock updated successfully.", product });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getProductHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await ProductHistory.countDocuments();
    const history = await ProductHistory.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ history, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
