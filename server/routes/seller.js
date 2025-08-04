const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../models/Product");
const Interest = require("../models/Interest");
const Seller = require("../models/seller");
const Withdrawal = require("../models/Withdrawal");

const verifySeller = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "trustissue_secret");
    if (decoded.role !== "seller")
      return res.status(403).json({ message: "Access denied: Not a seller" });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/upload-product", verifySeller, upload.single("file"), async (req, res) => {
  const { name, description, price, category } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

  if (!name || !description || !price || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const product = new Product({
      seller: req.user.id,
      name,
      description,
      price,
      category,
      fileUrl,
    });

    await product.save();
    res.status(201).json({ message: "Product uploaded successfully" });
  } catch (err) {
    console.error("❌ Product upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/products", verifySeller, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching seller products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/edit-product/:id", verifySeller, upload.single("file"), async (req, res) => {
  const { name, description, price, category } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const update = { name, description, price, category };
    if (fileUrl) update.fileUrl = fileUrl;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      update,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("❌ Edit error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-product/:id", verifySeller, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/interest-requests", verifySeller, async (req, res) => {
  try {
    const interests = await Interest.find()
      .populate({
        path: "product",
        match: { seller: req.user.id },
        select: "name description",
      })
      .populate("buyer", "email name")
      .populate("verifiedBy", "email name");

    const filtered = interests.filter((i) => i.product !== null);
    res.status(200).json(filtered);
  } catch (err) {
    console.error("Error fetching interest requests:", err);
    res.status(500).json({ message: "Failed to fetch interest requests" });
  }
});

router.get("/balance", verifySeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);
    res.status(200).json({ balance: seller.balance || 0 });
  } catch (err) {
    console.error("Balance fetch error:", err);
    res.status(500).json({ message: "Failed to fetch balance" });
  }
});

router.post("/withdraw", verifySeller, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller || seller.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const withdrawal = new Withdrawal({
      seller: req.user.id,
      amount,
      status: "pending",
    });

    await withdrawal.save();

    seller.balance -= amount;
    await seller.save();

    res.status(200).json({ message: "Withdrawal request submitted" });
  } catch (err) {
    console.error("Withdrawal request error:", err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
});

module.exports = router;
