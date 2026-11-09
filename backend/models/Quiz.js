
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (options) {
                return options.length >= 2;
            },
            message: "A question must have at least 2 options."
        }
    },

    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    },

    points: {
        type: Number,
        default: 1,
        min: 1
    }
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            default: "General"
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        questions: {
            type: [questionSchema],
            default: []
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
