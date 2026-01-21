const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("🎮 Player connected:", socket.id);

    socket.emit("join-session", {
        gameCode: "796278",
        nickname: "Player1",
    });
});

socket.on("question", (data) => {
    console.log("📥 Question:", data.question.text);
    console.log("Options:", data.question.options);

    // simulate jawab setelah 2 detik
    setTimeout(() => {
        socket.emit("player:submit-answer", {
            gameCode: "796278",
            answerIndex: 3,
        });
        console.log("📤 Answer submitted");
    }, 2000);
});

socket.on("leaderboard:update", (players) => {
    console.log("🏆 Leaderboard:");
    console.table(players);
});
