const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");
const Verifier = require("../models/verifier");
const Buyer = require("../models/buyer");
const Seller = require("../models/seller");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const modelMap = {
    admin: Admin,
    verifier: Verifier,
    buyer: Buyer,
    seller: Seller,
};

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!["buyer", "seller"].includes(role)) {
        return res.status(400).json({
            message: "Signup allowed only for buyer or seller",
        });
    }

    const Model = modelMap[role];

    try {
        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: `${role} with this email already exists`,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Model({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: `${role} registered successfully` });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Signup failed" });
    }
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!modelMap[role]) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const Model = modelMap[role];

    try {
        const user = await Model.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: `${role} not found` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Login failed" });
    }
};
