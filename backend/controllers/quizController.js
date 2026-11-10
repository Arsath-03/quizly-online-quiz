
const Quiz = require("../models/Quiz");

// CREATE QUIZ
const createQuiz = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            duration,
            questions
        } = req.body;

        // Validate required fields
        if (!title || !duration || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, duration and questions"
            });
        }

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A quiz must contain at least one question"
            });
        }

        if (!Number.isInteger(Number(duration)) || Number(duration) < 1) {
            return res.status(400).json({
                success: false,
                message: "Duration must be a positive number of minutes"
            });
        }

        // Validate each question
        for (const question of questions) {
            if (
                !question.questionText ||
                !Array.isArray(question.options) ||
                question.options.length < 2
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each question needs text and at least two options"
                });
            }

            if (
                !Number.isInteger(question.correctAnswer) ||
                question.correctAnswer < 0 ||
                question.correctAnswer >= question.options.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid correct answer index"
                });
            }
        }

        // Save quiz in MongoDB
        const quiz = await Quiz.create({
            title,
            description,
            category,
            duration: Number(duration),
            questions,
            createdBy: req.userId,
            status: "published"
        });

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create quiz",
            error: error.message
        });
    }
};

// GET QUIZZES CREATED BY LOGGED-IN ADMIN
// GET ALL QUIZZES FOR ADMIN
const getAdminQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({})
            .select("title description category duration status createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes",
            error: error.message
        });
    }
};

// GET ALL PUBLISHED QUIZZES
const getAvailableQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({
            status: "published"
        })
        .select("title description category duration questions createdAt")
        .sort({ createdAt: -1 });

        const availableQuizzes = quizzes.map((quiz) => ({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            duration: quiz.duration,
            totalQuestions: quiz.questions.length,
            createdAt: quiz.createdAt
        }));

        res.status(200).json({
            success: true,
            count: availableQuizzes.length,
            quizzes: availableQuizzes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch available quizzes",
            error: error.message
        });
    }
};


// GET SINGLE QUIZ WITHOUT CORRECT ANSWERS
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            status: "published"
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const safeQuiz = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            duration: quiz.duration,
            totalQuestions: quiz.questions.length,
            questions: quiz.questions.map((question) => ({
                _id: question._id,
                questionText: question.questionText,
                options: question.options,
                points: question.points
            }))
        };

        res.status(200).json({
            success: true,
            quiz: safeQuiz
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch quiz",
            error: error.message
        });
    }
};


const mongoose = require("mongoose");
const Result = require("../models/Result");

// SUBMIT QUIZ AND CALCULATE SCORE
const submitQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { answers, timeTakenSeconds = 0 } = req.body;

        // Validate quiz ID
        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        // Validate submitted answers
        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be provided as an array"
            });
        }

        if (
            !Number.isInteger(timeTakenSeconds) ||
            timeTakenSeconds < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid time taken"
            });
        }

        // Find published quiz
        const quiz = await Quiz.findOne({
            _id: quizId,
            status: "published"
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        // Create a map of submitted answers
        const answerMap = new Map();

        for (const answer of answers) {
            if (
                !answer.questionId ||
                !mongoose.isValidObjectId(answer.questionId) ||
                !Number.isInteger(answer.selectedOption)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid answer format"
                });
            }

            const questionId = answer.questionId.toString();

            if (answerMap.has(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate question answers are not allowed"
                });
            }

            answerMap.set(questionId, answer.selectedOption);
        }

        // Calculate score on the backend
        let score = 0;
        let totalPoints = 0;
        const savedAnswers = [];

        for (const question of quiz.questions) {
            totalPoints += question.points;

            const questionId = question._id.toString();

            // -1 means the question was not answered
            const selectedOption = answerMap.has(questionId)
                ? answerMap.get(questionId)
                : -1;

            // Validate selected option
            if (
                selectedOption < -1 ||
                selectedOption >= question.options.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid selected option"
                });
            }

            // Calculate marks
            if (selectedOption !== -1 &&
                selectedOption === question.correctAnswer) {
                score += question.points;
            }

            savedAnswers.push({
                questionId: question._id,
                selectedOption
            });
        }

        // Calculate percentage
        const percentage = totalPoints > 0
            ? Number(((score / totalPoints) * 100).toFixed(2))
            : 0;

        // Save result in MongoDB
        const result = await Result.create({
            user: req.userId,
            quiz: quiz._id,
            answers: savedAnswers,
            score,
            totalQuestions: quiz.questions.length,
            percentage,
            timeTakenSeconds
        });

        // Send result to student
        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            result: {
                resultId: result._id,
                quizTitle: quiz.title,
                score,
                totalPoints,
                totalQuestions: quiz.questions.length,
                percentage,
                timeTakenSeconds,
                submittedAt: result.submittedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Quiz submission failed",
            error: error.message
        });
    }
};


const deleteQuiz = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        const quiz = await Quiz.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or you are not authorized to delete it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

 


module.exports = {
    createQuiz,
    getAdminQuizzes,
    getAvailableQuizzes,
    getQuizById,
    submitQuiz,
    deleteQuiz
};