
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const quizRoutes = require("./routes/quizRoutes");

const resultRoutes = require("./routes/resultRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Online Quiz Application Backend is Running!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Online Quiz API is working successfully!"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/api/results", resultRoutes);

// Start server
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
