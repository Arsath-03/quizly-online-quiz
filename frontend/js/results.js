
const token = localStorage.getItem("token");

const latestResultContainer = document.getElementById("latestResult");
const resultMessage = document.getElementById("resultMessage");
const resultsTable = document.getElementById("resultsTable");
const loading = document.getElementById("loading");
const historyMessage = document.getElementById("historyMessage");

if (!token) {
    window.location.href = "login.html";
}


// Display latest quiz result
function displayLatestResult() {

    const savedResult = localStorage.getItem("latestQuizResult");

    if (!savedResult) {
        resultMessage.textContent =
            "You can view your previous quiz attempts below.";
        return;
    }

    const result = JSON.parse(savedResult);

    latestResultContainer.classList.remove("hidden");

    document.getElementById("quizTitle").textContent =
        result.quizTitle;

    document.getElementById("score").textContent =
        `${result.score} / ${result.totalPoints}`;

    document.getElementById("percentage").textContent =
        `${result.percentage}%`;

    const minutes = Math.floor(result.timeTakenSeconds / 60);
    const seconds = result.timeTakenSeconds % 60;

    document.getElementById("timeTaken").textContent =
        `${minutes}m ${seconds}s`;

    if (result.percentage >= 80) {
        resultMessage.textContent = "Excellent work! Keep it up!";
    } else if (result.percentage >= 50) {
        resultMessage.textContent = "Good effort! Keep practicing!";
    } else {
        resultMessage.textContent = "Keep learning. You can improve!";
    }

    localStorage.removeItem("latestQuizResult");
}


// Load previous attempts
async function loadPreviousResults() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/results/my-results`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load results");
        }

        loading.classList.add("hidden");

        if (!data.results || data.results.length === 0) {
            historyMessage.textContent = "No previous quiz attempts found.";
            return;
        }

        data.results.forEach((result) => {

            const row = document.createElement("tr");
            row.className = "border-b";

            const quizCell = document.createElement("td");
            quizCell.className = "py-4 pr-4";
            quizCell.textContent = result.quizTitle;

            const scoreCell = document.createElement("td");
            scoreCell.className = "py-4 pr-4";
            scoreCell.textContent =
                `${result.score} / ${result.totalQuestions}`;

            const percentageCell = document.createElement("td");
            percentageCell.className = "py-4 pr-4 font-semibold text-indigo-600";
            percentageCell.textContent = `${result.percentage}%`;

            const dateCell = document.createElement("td");
            dateCell.className = "py-4";
            dateCell.textContent =
                new Date(result.submittedAt).toLocaleDateString();

            row.appendChild(quizCell);
            row.appendChild(scoreCell);
            row.appendChild(percentageCell);
            row.appendChild(dateCell);

            resultsTable.appendChild(row);
        });

    } catch (error) {

        loading.classList.add("hidden");
        historyMessage.textContent = error.message;
        historyMessage.className = "text-center text-red-600 mt-6";

    }
}


// Start
if (token) {
    displayLatestResult();
    loadPreviousResults();
}
