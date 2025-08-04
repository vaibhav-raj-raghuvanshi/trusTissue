const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

exports.verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Only admin access allowed" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
