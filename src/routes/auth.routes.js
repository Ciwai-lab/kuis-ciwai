const express = require("express");
const router = express.Router();

router.use(express.json()); // 👈 TAMBAHKAN INI

const { register, login, me, logout } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/logout", logout);

module.exports = router;
