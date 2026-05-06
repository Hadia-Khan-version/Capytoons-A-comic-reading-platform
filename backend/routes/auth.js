const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const db      = require("../db");

// Register
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.execute(
            "INSERT INTO User (Username, Email, PasswordHash) VALUES (?, ?, ?)",
            [username, email, hash]
        );
        res.json({ message: "User registered successfully" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY")
            return res.status(400).json({ error: "Username or email already exists" });
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute(
            "SELECT * FROM User WHERE Email = ?", [email]
        );
        if (rows.length === 0)
            return res.status(401).json({ error: "Invalid email or password" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (!match)
            return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign(
            { userID: user.UserID, username: user.Username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({ token, username: user.Username, userID: user.UserID });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

module.exports = router;