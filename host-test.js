const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("🎤 Host connected:", socket.id);

    setTimeout(() => {
        socket.emit("host:start-question", {
            gameCode: "796278",
            question: {
                text: "2 + 2 = ?",
                options: ["1", "2", "3", "4"],
                correctIndex: 3,
                duration: 10 // detik
            },
        });

    }, 2000);
});
