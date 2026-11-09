
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
    createQuiz,
    getAdminQuizzes,
    getAvailableQuizzes,
    getQuizById,
    submitQuiz,
    deleteQuiz
} = require("../controllers/quizController");

// Student routes
router.get("/", protect, getAvailableQuizzes);

// Admin route - keep before /:id
router.get("/admin", protect, adminOnly, getAdminQuizzes);
router.post("/", protect, adminOnly, createQuiz);

// Student quiz submission and details
router.post("/:id/submit", protect, submitQuiz);
router.get("/:id", protect, getQuizById);

router.delete("/:id", protect, adminOnly, deleteQuiz);

module.exports = router;
