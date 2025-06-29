const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  balance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
