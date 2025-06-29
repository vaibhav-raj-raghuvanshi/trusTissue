const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Verifier = require("../models/verifier");
const Product = require("../models/Product");
const Withdrawal = require("../models/withdrawal");

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "trustissue_secret");
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Not an admin" });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.post("/create-verifier", verifyAdmin, async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exists = await Verifier.findOne({ email });
        if (exists) return res.status(400).json({ message: "Verifier already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifier = new Verifier({
            name,
            email,
            password: hashedPassword,
            approvedBy: req.user.id,
        });

        await verifier.save();
        res.status(201).json({ message: "Verifier created successfully" });
    } catch (err) {
        console.error("Verifier creation error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/verifiers", verifyAdmin, async (req, res) => {
    try {
        const verifiers = await Verifier.find();
        res.status(200).json(verifiers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching verifiers" });
    }
});

router.put("/edit-verifier/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const updateData = { name, email };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updated = await Verifier.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: "Verifier not found" });

        res.status(200).json({ message: "Verifier updated successfully", verifier: updated });
    } catch (err) {
        console.error("Edit error:", err);
        res.status(500).json({ message: "Update failed" });
    }
});

router.delete("/delete-verifier/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Verifier.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Verifier not found" });

        res.status(200).json({ message: "Verifier deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Delete failed" });
    }
});

router.get("/all-products", verifyAdmin, async (req, res) => {
    const { status } = req.query;
    const query = status ? { status } : {};

    try {
        const products = await Product.find(query)
            .populate("seller", "name email")
            .populate("reviewedBy", "name email");

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

router.get("/withdrawals", verifyAdmin, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ status: "pending" })
            .populate("seller", "name email");
        res.status(200).json(withdrawals);
    } catch (err) {
        console.error("Fetch withdrawal error:", err);
        res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
});

router.patch("/withdrawals/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    if (!["processed", "rejected"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
    }

    try {
        const withdrawal = await Withdrawal.findByIdAndUpdate(
            id,
            { status: action },
            { new: true }
        );

        if (!withdrawal) {
            return res.status(404).json({ message: "Withdrawal request not found" });
        }

        res.status(200).json({ message: `Withdrawal ${action}`, withdrawal });
    } catch (err) {
        console.error("Withdrawal approval error:", err);
        res.status(500).json({ message: "Failed to update withdrawal" });
    }
});

module.exports = router;
