const { v4: uuidv4 } = require("uuid");

const sessions = [];

function generateGameCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function startSession(req, res) {
    const { quizId } = req.body;

    if (!quizId) {
        return res.status(400).json({
            success: false,
            message: "quizId is required",
        });
    }

    const session = {
        id: uuidv4(),
        quizId,
        gameCode: generateGameCode(),
        players: [],
        createdAt: new Date(),
    };

    sessions.push(session);

    res.json({
        success: true,
        message: "Session started",
        data: session,
    });
}

function joinSession(req, res) {
    const { gameCode, nickname } = req.body;

    const session = sessions.find(s => s.gameCode === gameCode);

    if (!session) {
        return res.status(404).json({
            success: false,
            message: "Session not found",
        });
    }

    if (!nickname) {
        return res.status(400).json({
            success: false,
            message: "nickname is required",
        });
    }

    const player = {
        id: uuidv4(),
        nickname,
        score: 0,
    };

    session.players.push(player);

    res.json({
        success: true,
        message: "Joined session",
        data: player,
    });
}

module.exports = {
    startSession,
    joinSession,
};
