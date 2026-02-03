const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth.middleware");

const {
    createQuiz,
    addQuestion,
    getAllQuizzes,
    getQuizById,
    getQuizByIdDirect,
    getMyQuizzes,
    deleteQuiz,
    updateQuizTitle,
    updateQuestion

} = require("../controllers/quiz.controller");

router.post("/", requireAuth, createQuiz);
router.post("/:id/question", requireAuth, addQuestion);

router.get("/", getAllQuizzes);
router.get("/mine", requireAuth, getMyQuizzes);
router.get("/:id", getQuizById);

router.delete("/:id", requireAuth, deleteQuiz);

router.put("/:id", requireAuth, updateQuizTitle);
router.put("/question/:id", requireAuth, updateQuestion);



module.exports = router;
