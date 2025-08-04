const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("trusTissue API is running 🚀");
});

// Mock data
const mockUsers = [
    { _id: "1", name: "John Verifier", email: "john@example.com", role: "verifier" },
    { _id: "2", name: "Jane Verifier", email: "jane@example.com", role: "verifier" },
    { _id: "3", name: "Admin User", email: "admin@example.com", role: "admin" }
];

const mockWithdrawals = [
    { 
        _id: "1", 
        amount: 1500, 
        status: "pending",
        seller: { name: "Seller One", email: "seller1@example.com" },
        createdAt: new Date()
    },
    { 
        _id: "2", 
        amount: 2500, 
        status: "pending",
        seller: { name: "Seller Two", email: "seller2@example.com" },
        createdAt: new Date()
    }
];

// Auth routes
app.post("/api/auth/signup", (req, res) => {
    res.json({ message: "User created successfully" });
});

app.post("/api/auth/login", (req, res) => {
    const { email, role } = req.body;
    
    // Simple mock JWT token
    const token = Buffer.from(JSON.stringify({ email, role })).toString('base64');
    
    res.json({ 
        message: "Login successful",
        token: `header.${token}.signature`
    });
});

// Admin routes
app.get("/api/admin/verifiers", (req, res) => {
    res.json(mockUsers.filter(u => u.role === "verifier"));
});

app.get("/api/admin/withdrawals", (req, res) => {
    res.json(mockWithdrawals);
});

app.post("/api/admin/create-verifier", (req, res) => {
    const { name, email } = req.body;
    const newVerifier = { 
        _id: Date.now().toString(), 
        name, 
        email, 
        role: "verifier" 
    };
    mockUsers.push(newVerifier);
    res.json({ message: "Verifier created successfully" });
});

app.put("/api/admin/edit-verifier/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], name, email };
        res.json({ message: "Verifier updated successfully" });
    } else {
        res.status(404).json({ message: "Verifier not found" });
    }
});

app.delete("/api/admin/delete-verifier/:id", (req, res) => {
    const { id } = req.params;
    const userIndex = mockUsers.findIndex(u => u._id === id);
    
    if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        res.json({ message: "Verifier deleted successfully" });
    } else {
        res.status(404).json({ message: "Verifier not found" });
    }
});

app.patch("/api/admin/withdrawals/:id", (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    
    const withdrawalIndex = mockWithdrawals.findIndex(w => w._id === id);
    if (withdrawalIndex !== -1) {
        mockWithdrawals[withdrawalIndex].status = action;
        res.json({ message: `Withdrawal ${action} successfully` });
    } else {
        res.status(404).json({ message: "Withdrawal not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
    console.log("✅ Connected to Mock Database");
});
