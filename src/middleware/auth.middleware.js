const jwt = require("jsonwebtoken");

const JWT_SECRET = "ciwai-secret-key";

function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = { requireAuth };
