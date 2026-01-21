class SessionService {
    constructor() {
        this.sessions = {};
    }

    createSession(gameCode, quiz) {
        this.sessions[gameCode] = {
            gameCode,
            quizId: quiz.id,
            title: quiz.title,
            questions: quiz.questions,
            currentIndex: -1,
            players: [],
            started: false,
            finished: false,
            timer: null
        };

        return this.sessions[gameCode];
    }

    getSession(gameCode) {
        return this.sessions[gameCode];
    }

    addPlayer(gameCode, socketId, nickname) {
        const session = this.sessions[gameCode];
        if (!session) return null;

        const existing = session.players.find(p => p.nickname === nickname);

        if (existing) {
            // reconnect
            existing.id = socketId;
            existing.connected = true;
            return existing;
        }

        const player = {
            id: socketId,
            nickname,
            score: 0,
            answered: false,
            connected: true,
        };

        session.players.push(player);
        return player;
    }

    startGame(gameCode, onQuestion, onFinish) {
        const session = this.sessions[gameCode];
        if (!session) return;

        session.started = true;

        const next = () => {
            const result = this.nextQuestion(gameCode);

            if (result.finished) {
                onFinish(session);
                return;
            }

            onQuestion(result);

            const duration = result.question.duration || 10;

            session.timer = setTimeout(() => {
                next();
            }, duration * 1000 + 2000); // +2 detik jeda antar soal
        };

        next();
    }

    nextQuestion(gameCode) {
        const session = this.sessions[gameCode];
        if (!session) return null;

        session.currentIndex++;

        if (session.currentIndex >= session.questions.length) {
            session.finished = true;
            return { finished: true };
        }

        // reset answered flags
        session.players.forEach(p => p.answered = false);

        return {
            finished: false,
            question: session.questions[session.currentIndex],
            index: session.currentIndex + 1,
            total: session.questions.length,
        };
    }

    submitAnswer(gameCode, socketId, answerIndex) {
        const session = this.sessions[gameCode];
        if (!session || !session.started || session.finished) return null;

        const player = session.players.find(p => p.id === socketId);
        if (!player || player.answered) return null;

        const q = session.questions[session.currentIndex];

        player.answered = true;

        if (answerIndex === q.correctIndex) {
            player.score += 100;
            return { correct: true };
        }

        return { correct: false };
    }

    getLeaderboard(gameCode) {
        const session = this.sessions[gameCode];
        if (!session) return [];

        return [...session.players].sort((a, b) => b.score - a.score);
    }

    removePlayer(socketId) {
        for (const gameCode in this.sessions) {
            const session = this.sessions[gameCode];
            const player = session.players.find(p => p.id === socketId);

            if (player) {
                player.connected = false;

                // hapus permanen kalau 30 detik gak balik
                setTimeout(() => {
                    if (!player.connected) {
                        session.players = session.players.filter(p => p !== player);
                    }
                }, 30000);

                return gameCode;
            }
        }
        return null;
    }

}

module.exports = new SessionService();
