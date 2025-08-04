const express = require("express");
const router = express.Router();
const { createVerifier } = require("../../controllers/adminController");
const { verifyAdmin } = require("../../middleware/auth");

router.post("/create-verifier", verifyAdmin, createVerifier);

module.exports = router;
