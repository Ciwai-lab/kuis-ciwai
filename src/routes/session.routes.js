const express = require("express");
const router = express.Router();

const {
    startSession,
    joinSession
} = require("../controllers/session.controller");

router.post("/start", startSession);
router.post("/join", joinSession);

module.exports = router;
