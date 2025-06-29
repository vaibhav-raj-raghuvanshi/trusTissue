const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Interest = require("../models/Interest");

const verifyVerifier = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "trustissue_secret");
        if (decoded.role !== "verifier") {
            return res.status(403).json({ message: "Access denied: Not a verifier" });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.get("/pending-products", verifyVerifier, async (req, res) => {
    try {
        const products = await Product.find({ status: "pending" }).populate("seller", "name email");
        res.status(200).json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Failed to fetch pending products" });
    }
});

router.patch("/verify/:id", verifyVerifier, async (req, res) => {
    const { action } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
    }

    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { status: action, reviewedBy: req.user.id },
            { new: true }
        );

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({ message: `Product ${action} successfully`, product });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Verification failed" });
    }
});

router.get("/pending-interests", verifyVerifier, async (req, res) => {
    try {
        const interests = await Interest.find({ status: "pending" })
            .populate("buyer", "name email")
            .populate("product", "name description fileUrl category price seller");

        res.status(200).json(interests);
    } catch (err) {
        console.error("Error fetching interests:", err);
        res.status(500).json({ message: "Failed to fetch interests" });
    }
});

router.patch("/verify-interest/:id", verifyVerifier, async (req, res) => {
    const { featureStatus } = req.body; // e.g. [{ name: "metal body", status: "present" }]
    const { id } = req.params;

    if (!Array.isArray(featureStatus)) {
        return res.status(400).json({ message: "featureStatus must be an array" });
    }

    try {
        const interest = await Interest.findByIdAndUpdate(
            id,
            {
                featureStatus,
                status: featureStatus.some(f => f.status === "present") ? "verified" : "rejected",
                verifiedBy: req.user.id,
            },
            { new: true }
        );

        if (!interest) return res.status(404).json({ message: "Interest not found" });

        res.status(200).json({ message: "Interest verified", interest });
    } catch (err) {
        console.error("Interest verification error:", err);
        res.status(500).json({ message: "Interest verification failed" });
    }
});

router.get("/payment-uploads", verifyVerifier, async (req, res) => {
    try {
        const payments = await Interest.find({ paymentStatus: "uploaded" })
            .populate("buyer", "name email")
            .populate("product", "name price");

        res.status(200).json(payments);
    } catch (err) {
        console.error("Payment uploads fetch error:", err);
        res.status(500).json({ message: "Failed to fetch payment uploads" });
    }
});

router.patch("/confirm-payment/:id", verifyVerifier, async (req, res) => {
    const { action } = req.body; // "confirmed" or "rejected"
    const { id } = req.params;

    if (!["confirmed", "rejected"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
    }

    try {
        const interest = await Interest.findById(id);
        if (!interest) return res.status(404).json({ message: "Interest not found" });

        interest.paymentStatus = action;
        if (action === "confirmed") {
            interest.status = "completed";
        }

        await interest.save();
        res.status(200).json({ message: `Payment ${action}`, interest });
    } catch (err) {
        console.error("Payment confirmation error:", err);
        res.status(500).json({ message: "Payment status update failed" });
    }
});

module.exports = router;
