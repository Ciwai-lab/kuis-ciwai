const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ciwai-secret-key"; // nanti bisa pindah ke .env

function register(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const existing = db
        .prepare("SELECT * FROM hosts WHERE email = ?")
        .get(email);

    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const hash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
    INSERT INTO hosts (email, password, createdAt)
    VALUES (?, ?, ?)
  `).run(email, hash, new Date().toISOString());

    res.json({ success: true });
}

function login(req, res) {
    const { email, password } = req.body;

    const host = db
        .prepare("SELECT * FROM hosts WHERE email = ?")
        .get(email);

    if (!host) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = bcrypt.compareSync(password, host.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: host.id, email: host.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
    });

    res.json({ success: true });
}

function me(req, res) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({});

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch {
        res.status(401).json({});
    }
}

function logout(req, res) {
    res.clearCookie("token");
    res.json({ success: true });
}

module.exports = { register, login, me, logout };
