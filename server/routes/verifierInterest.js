const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Interest = require("../models/Interest");

const verifyVerifier = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "trustissue_secret");
        if (decoded.role !== "verifier") return res.status(403).json({ message: "Not a verifier" });

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.get("/pending-interests", verifyVerifier, async (req, res) => {
    try {
        const interests = await Interest.find({ status: "pending" })
            .populate("product")
            .populate("buyer", "name email");

        res.status(200).json(interests);
    } catch (err) {
        console.error("Fetch interests error:", err);
        res.status(500).json({ message: "Failed to fetch interests" });
    }
});

router.patch("/verify-interest/:id", verifyVerifier, async (req, res) => {
    const { featureStatus } = req.body;

    try {
        const interest = await Interest.findByIdAndUpdate(
            req.params.id,
            {
                featureStatus,
                status: featureStatus.some((f) => f.status === "present") ? "verified" : "rejected",
                verifiedBy: req.user.id,
            },
            { new: true }
        );

        if (!interest) return res.status(404).json({ message: "Interest not found" });

        res.status(200).json({ message: "Interest reviewed", interest });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Failed to verify interest" });
    }
});

module.exports = router;
