const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getMyResults,
    getLeaderboard
} = require("../controllers/resultController");

// View logged-in user's results
router.get("/my-results", protect, getMyResults);

// View leaderboard for a particular quiz
router.get("/leaderboard/:quizId", protect, getLeaderboard);

module.exports = router;