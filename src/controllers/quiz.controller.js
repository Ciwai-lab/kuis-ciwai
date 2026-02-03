const db = require("../db");

// CREATE quiz
function createQuiz(req, res) {
    const { title } = req.body;
    const hostId = req.user.id;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    const createdAt = new Date().toISOString();

    const result = db.prepare(`
  INSERT INTO quizzes (title, createdAt, hostId)
  VALUES (?, ?, ?)
`).run(title, createdAt, hostId);


    res.json({
        success: true,
        message: "Quiz created",
        data: { id: result.lastInsertRowid, title, createdAt, questions: [] },
    });
}

function getMyQuizzes(req, res) {
    const hostId = req.user.id;

    const quizzes = db
        .prepare("SELECT * FROM quizzes WHERE hostId = ?")
        .all(hostId);

    const result = quizzes.map(q => {
        const questions = db
            .prepare("SELECT * FROM questions WHERE quizId = ?")
            .all(q.id)
            .map(x => {
                let options = [];
                try {
                    options = JSON.parse(x.options);
                } catch {
                    options = [];
                }
                return {
                    ...x,
                    options,
                };
            });

        return { ...q, questions };
    });

    res.json(result);
}

// ADD question
function addQuestion(req, res) {
    const quizId = parseInt(req.params.id);
    const { question, options, correctIndex } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2 || correctIndex === undefined) {
        return res.status(400).json({ success: false, message: "Invalid format" });
    }

    const quiz = db
        .prepare("SELECT * FROM quizzes WHERE id = ?")
        .get(quizId);

    if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    if (quiz.hostId !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const result = db
        .prepare(`
      INSERT INTO questions (quizId, question, options, correctIndex)
      VALUES (?, ?, ?, ?)
    `)
        .run(
            quizId,
            question,
            JSON.stringify(options),
            correctIndex
        );

    res.json({
        success: true,
        message: "Question added",
        data: {
            id: result.lastInsertRowid,
            question,
            options,
            correctIndex,
        },
    });
}

// GET all quizzes
function getAllQuizzes(req, res) {
    const quizzes = db.prepare("SELECT * FROM quizzes").all();

    const result = quizzes.map(q => {
        const questions = db
            .prepare("SELECT * FROM questions WHERE quizId = ?")
            .all(q.id)
            .map(x => {
                let options = [];
                try {
                    options = JSON.parse(x.options);
                } catch {
                    options = [];
                }
                return {
                    ...x,
                    options,
                };
            });

        return { ...q, questions };
    });

    res.json(result);
}

// GET quiz by id
function getQuizById(req, res) {
    const quizId = parseInt(req.params.id);

    const quiz = db
        .prepare("SELECT * FROM quizzes WHERE id = ?")
        .get(quizId);

    if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const questions = db
        .prepare("SELECT * FROM questions WHERE quizId = ?")
        .all(quizId)
        .map(q => {
            let options = [];
            try {
                options = JSON.parse(q.options);
            } catch {
                options = [];
            }
            return {
                ...q,
                options,
            };
        });

    res.json({
        success: true,
        data: { ...quiz, questions },
    });
}

// DIRECT for socket/service use
function getQuizByIdDirect(id) {
    const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id);
    if (!quiz) return null;

    const questions = db
        .prepare("SELECT * FROM questions WHERE quizId = ?")
        .all(id)
        .map(q => {
            let options = [];
            try {
                options = JSON.parse(q.options);
            } catch {
                options = [];
            }
            return {
                ...q,
                options,
            };
        });

    return { ...quiz, questions };
}

function deleteQuiz(req, res) {
    const id = req.params.id;
    const hostId = req.user.id;

    // hanya boleh hapus kuis milik sendiri
    const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ? AND hostId = ?").get(id, hostId);
    if (!quiz) return res.status(403).json({ message: "Forbidden" });

    db.prepare("DELETE FROM questions WHERE quizId = ?").run(id);
    db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);

    res.json({ success: true });
}

function updateQuizTitle(req, res) {
    const id = req.params.id;
    const { title } = req.body;
    const hostId = req.user.id;

    const quiz = db.prepare(
        "SELECT * FROM quizzes WHERE id = ? AND hostId = ?"
    ).get(id, hostId);

    if (!quiz) return res.status(403).json({ message: "Forbidden" });

    db.prepare("UPDATE quizzes SET title = ? WHERE id = ?").run(title, id);

    res.json({ success: true });
}

function updateQuestion(req, res) {
    const id = req.params.id;
    const { question, options, correctIndex } = req.body;

    db.prepare(`
    UPDATE questions
    SET question = ?, options = ?, correctIndex = ?
    WHERE id = ?
  `).run(question, JSON.stringify(options), correctIndex, id);

    res.json({ success: true });
}



module.exports = {
    createQuiz,
    addQuestion,
    getAllQuizzes,
    getQuizById,
    getQuizByIdDirect,
    getMyQuizzes,
    deleteQuiz,
    updateQuizTitle,
    updateQuestion
};
