const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
const SessionService = require("./src/services/session.service");
const quizzes = require("./src/controllers/quiz.controller");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // 1. Siswa Join ke Lobby
  socket.on("join-session", (payload = {}) => {
    const { gameCode, nickname } = payload;
    if (!gameCode || !nickname) {
      socket.emit("join:error", { message: "Invalid payload" });
      return;
    }
    const result = SessionService.addPlayer(gameCode, socket.id, nickname);
    if (!result) {
      socket.emit("join:error", { message: "Session not found" });
      return;
    }
    if (result.error) {
      socket.emit("join:error", { message: result.error });
      return;
    }

    socket.join(gameCode);
    const session = SessionService.getSession(gameCode);
    io.to(gameCode).emit("lobby:update", {
      players: session.players.map(p => p.nickname),
      count: session.players.length
    });
  });

  // 2. Player Submit Jawaban & Update Leaderboard
  socket.on("player:submit-answer", (payload = {}) => {
    const { gameCode, answerIndex } = payload;
    if (!gameCode || answerIndex === undefined) {
      socket.emit("answer:error", { message: "Invalid payload" });
      return;
    }
    SessionService.submitAnswer(gameCode, socket.id, answerIndex);
    const session = SessionService.getSession(gameCode);
    if (session) {
      // Broadcast leaderboard terbaru ke semua player di room
      io.to(gameCode).emit("leaderboard:update", session.players);
    }
  });

  // 3. Host Bikin Sesi Baru
  socket.on("host:start-session", (payload = {}) => {
    const { quizId } = payload;
    if (!quizId) {
      socket.emit("session:error", { message: "Invalid payload" });
      return;
    }
    const quiz = quizzes.getQuizByIdDirect(quizId);
    if (!quiz) return;

    const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
    SessionService.createSession(gameCode, quiz);
    socket.emit("session:created", { gameCode, quizTitle: quiz.title });
  });

  // 4. Host Mulai Game (Soal Pertama Muncul)
  socket.on("host:start-game", (payload = {}) => {
    const { gameCode } = payload;
    if (!gameCode) {
      socket.emit("game:error", { message: "Invalid payload" });
      return;
    }
    console.log("🎮 Game started:", gameCode);
    io.to(gameCode).emit("game:started");

    SessionService.startGame(
      gameCode,
      (result) => {
        io.to(gameCode).emit("question", {
          question: result.question,
          index: result.index,
          total: result.total,
        });
      },
      () => {
        io.to(gameCode).emit("game:finished", {
          leaderboard: SessionService.getLeaderboard(gameCode),
        });
      }
    );
  });

  // 5. Host Klik "Next Question"
  socket.on("host:next-question", (payload = {}) => {
    const { gameCode } = payload;
    if (!gameCode) {
      socket.emit("game:error", { message: "Invalid payload" });
      return;
    }
    const result = SessionService.advanceGame(
      gameCode,
      (data) => {
        io.to(gameCode).emit("question", {
          question: data.question,
          index: data.index,
          total: data.total
        });
      },
      () => {
        io.to(gameCode).emit("game:finished", {
          leaderboard: SessionService.getLeaderboard(gameCode)
        });
      }
    );
    if (!result) return;
  });

  // 6. Handle Disconnect (Biar list pemain di lobby update otomatis)
  socket.on("disconnect", () => {
    const gameCode = SessionService.removePlayer(socket.id);
    if (gameCode) {
      const session = SessionService.getSession(gameCode);
      if (session) {
        io.to(gameCode).emit("lobby:update", {
          players: session.players.map(p => p.nickname),
          count: session.players.length
        });
        io.to(gameCode).emit("leaderboard:update", session.players);
      }
    }
    console.log("🔴 User disconnected:", socket.id);
  });

});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
