const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [1, "Withdrawal amount must be at least 1"],
    },
    status: {
        type: String,
        enum: ["pending", "processed", "rejected"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports =
    mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
