const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Buyer",
            required: true,
        },
        featuresRequested: {
            type: [String],
            required: true,
        },
        featureStatus: [
            {
                name: { type: String },
                status: {
                    type: String,
                    enum: ["present", "absent"],
                },
            },
        ],
        status: {
            type: String,
            enum: ["pending", "verified", "rejected", "completed"],
            default: "pending",
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Verifier",
        },

        paymentProofUrl: {
            type: String,
            default: "",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "uploaded", "confirmed", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Interest", interestSchema);
