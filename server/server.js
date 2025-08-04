const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // for files/images

app.get("/", (req, res) => {
    res.send("trusTissue API is running 🚀");
});

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
    });

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const sellerRoutes = require("./routes/seller");
const verifierRoutes = require("./routes/verifier");
const buyerRoutes = require("./routes/buyer");
const verifierInterestRoutes = require("./routes/verifierInterest");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/verifier", verifierRoutes); // product/payout APIs
app.use("/api/buyer", buyerRoutes);
app.use("/api/verifier", verifierInterestRoutes); // transaction interest verify
