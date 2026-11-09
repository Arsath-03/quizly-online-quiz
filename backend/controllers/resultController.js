const mongoose = require("mongoose");
const Result = require("../models/Result");

// 1. VIEW LOGGED-IN USER'S QUIZ RESULTS
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.userId })
            .populate("quiz", "title category")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            totalResults: results.length,
            results: results.map((result) => ({
                resultId: result._id,
                quizTitle: result.quiz ? result.quiz.title : "Quiz deleted",
                category: result.quiz ? result.quiz.category : "General",
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                timeTakenSeconds: result.timeTakenSeconds,
                submittedAt: result.submittedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch your results",
            error: error.message
        });
    }
};


// 2. VIEW LEADERBOARD FOR A QUIZ
const getLeaderboard = async (req, res) => {
    try {
        const quizId = req.params.quizId;

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        const results = await Result.aggregate([
            {
                $match: {
                    quiz: new mongoose.Types.ObjectId(quizId)
                }
            },
            {
                $sort: {
                    percentage: -1,
                    timeTakenSeconds: 1,
                    submittedAt: 1
                }
            },
            {
                $group: {
                    _id: "$user",
                    bestResult: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $sort: {
                    "bestResult.percentage": -1,
                    "bestResult.timeTakenSeconds": 1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    userName: "$userDetails.name",
                    score: "$bestResult.score",
                    totalQuestions: "$bestResult.totalQuestions",
                    percentage: "$bestResult.percentage",
                    timeTakenSeconds: "$bestResult.timeTakenSeconds",
                    submittedAt: "$bestResult.submittedAt"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            quizId,
            totalParticipants: results.length,
            leaderboard: results.map((result, index) => ({
                rank: index + 1,
                ...result
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch leaderboard",
            error: error.message
        });
    }
};


module.exports = {
    getMyResults,
    getLeaderboard
};