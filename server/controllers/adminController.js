const bcrypt = require("bcryptjs");
const Verifier = require("../models/verifier");

exports.createVerifier = async (req, res) => {
  const { name, email, password } = req.body;
  const adminId = req.user.id; 
  
  try {
    const existing = await Verifier.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Verifier with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifier = new Verifier({
      email,
      name,
      password: hashedPassword,
      approvedBy: adminId,
    });

    await verifier.save();
    res.status(201).json({ message: "Verifier created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create verifier" });
  }
};
