
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },

                selectedOption: {
                    type: Number,
                    default: -1
                }
            }
        ],

        score: {
            type: Number,
            default: 0
        },

        totalQuestions: {
            type: Number,
            required: true
        },

        percentage: {
            type: Number,
            default: 0
        },

        timeTakenSeconds: {
            type: Number,
            default: 0
        },

        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Result", resultSchema);
