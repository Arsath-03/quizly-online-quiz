const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
    getMyResults,
    getLeaderboard
} = require("../controllers/resultController");

// View logged-in user's results
router.get("/my-results", protect, getMyResults);

// Admin leaderboard for all quizzes
router.get(
    "/admin/leaderboard/:quizId",
    protect,
    adminOnly,
    getLeaderboard
);

// Existing student leaderboard
router.get("/leaderboard/:quizId", protect, getLeaderboard);

module.exports = router;