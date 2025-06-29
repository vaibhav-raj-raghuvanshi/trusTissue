const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    interest: { type: mongoose.Schema.Types.ObjectId, ref: "Interest", required: true },
    price: Number,
    paymentProof: String,
    status: {
        type: String,
        enum: ["initiated", "paid", "approved"],
        default: "initiated"
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Verifier" }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
