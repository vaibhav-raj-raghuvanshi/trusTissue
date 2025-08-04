const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

module.exports = mongoose.model("Buyer", buyerSchema);
