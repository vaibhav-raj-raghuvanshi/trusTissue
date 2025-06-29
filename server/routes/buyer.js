const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Interest = require("../models/Interest");
const Product = require("../models/Product");

const verifyBuyer = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "trustissue_secret");
        if (decoded.role !== "buyer")
            return res.status(403).json({ message: "Access denied: Not a buyer" });

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/payment_proofs/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

router.get("/approved-products", verifyBuyer, async (req, res) => {
    try {
        const products = await Product.find({ status: "approved" }).populate("seller", "name email");
        res.status(200).json(products);
    } catch (err) {
        console.error("Approved products fetch error:", err);
        res.status(500).json({ message: "Failed to fetch approved products" });
    }
});

router.post("/express-interest", verifyBuyer, async (req, res) => {
    const { productId, features } = req.body;

    if (!productId || !features || !Array.isArray(features)) {
        return res.status(400).json({ message: "Missing product or features list" });
    }

    try {
        const exists = await Interest.findOne({ product: productId, buyer: req.user.id });
        if (exists) {
            return res.status(400).json({ message: "Already expressed interest in this product" });
        }

        const interest = new Interest({
            product: productId,
            buyer: req.user.id,
            featuresRequested: features.map((f) => f.trim()),
        });

        await interest.save();
        res.status(201).json({ message: "Interest submitted successfully" });
    } catch (err) {
        console.error("Interest error:", err);
        res.status(500).json({ message: "Failed to submit interest" });
    }
});

router.get("/my-interests", verifyBuyer, async (req, res) => {
    try {
        const interests = await Interest.find({ buyer: req.user.id })
            .populate("product", "name description price category fileUrl seller")
            .populate("verifiedBy", "name email");

        res.status(200).json(interests);
    } catch (err) {
        console.error("Interest fetch error:", err);
        res.status(500).json({ message: "Failed to fetch interests" });
    }
});

router.get("/verified-products", verifyBuyer, async (req, res) => {
    try {
        const verified = await Interest.find({ buyer: req.user.id, status: "verified" })
            .populate("product", "name description price fileUrl seller")
            .populate("verifiedBy", "name email");

        res.status(200).json(verified);
    } catch (err) {
        console.error("Verified interest fetch error:", err);
        res.status(500).json({ message: "Failed to fetch verified products" });
    }
});

router.post("/upload-payment/:interestId", verifyBuyer, upload.single("proof"), async (req, res) => {
    const { interestId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: "No payment proof uploaded" });
    }

    try {
        const interest = await Interest.findOne({
            _id: interestId,
            buyer: req.user.id,
            status: "verified",
        });

        if (!interest) {
            return res.status(404).json({ message: "Verified interest not found" });
        }

        interest.paymentProofUrl = `/uploads/payment_proofs/${req.file.filename}`;
        interest.paymentStatus = "uploaded";

        await interest.save();
        res.status(200).json({ message: "Payment proof uploaded", interest });
    } catch (err) {
        console.error("Payment upload error:", err);
        res.status(500).json({ message: "Payment upload failed" });
    }
});

router.get("/my-purchases", verifyBuyer, async (req, res) => {
    try {
        const purchases = await Interest.find({
            buyer: req.user.id,
            paymentStatus: { $in: ["confirmed", "rejected"] },
        })
            .populate("product", "name price fileUrl category")
            .populate("verifiedBy", "email");

        res.status(200).json(purchases);
    } catch (err) {
        console.error("Error in /my-purchases:", err);
        res.status(500).json({ message: "Failed to fetch purchases" });
    }
});

module.exports = router;
