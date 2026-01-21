const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cookieParser());
app.use("/auth", authRoutes);

const quizRoutes = require("./routes/quiz.routes");
const sessionRoutes = require("./routes/session.routes");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.send("Kuis CiwAI backend is running 🚀");
});

// semua endpoint quiz akan lewat sini
app.use("/quiz", quizRoutes);
app.use("/session", sessionRoutes);
app.use("/auth", authRoutes);

module.exports = app;
