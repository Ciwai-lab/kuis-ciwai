const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("✅ Connected to server:", socket.id);

    // test join session
    socket.emit("join-session", {
        gameCode: "796278",
        nickname: "Bro",
    });
});

socket.on("player-joined", (data) => {
    console.log("📢 Player joined event received:", data);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
});
