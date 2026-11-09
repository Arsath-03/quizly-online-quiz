
const token = localStorage.getItem("token");

const quizSelect = document.getElementById("quizSelect");
const loadButton = document.getElementById("loadButton");
const leaderboardTable = document.getElementById("leaderboardTable");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

if (!token) {
    window.location.href = "login.html";
}


// Load available quizzes
async function loadQuizzes() {

    try {

        const response = await fetch(`${API_BASE_URL}/quizzes`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load quizzes");
        }

        quizSelect.innerHTML = '<option value="">Choose a quiz</option>';

        data.quizzes.forEach((quiz) => {

            const option = document.createElement("option");

            option.value = quiz._id;
            option.textContent = quiz.title;

            quizSelect.appendChild(option);

        });

    } catch (error) {

        quizSelect.innerHTML = '<option value="">Unable to load quizzes</option>';
        message.textContent = error.message;
        message.className = "text-center mt-6 text-red-600";

    }
}


// Load leaderboard for selected quiz
async function loadLeaderboard() {

    const quizId = quizSelect.value;

    if (!quizId) {
        message.textContent = "Please select a quiz first.";
        message.className = "text-center mt-6 text-red-600";
        return;
    }

    leaderboardTable.innerHTML = "";
    message.textContent = "";
    loading.textContent = "Loading leaderboard...";

    try {

        const response = await fetch(
            `${API_BASE_URL}/results/leaderboard/${quizId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load leaderboard");
        }

        loading.textContent = "";

        if (!data.leaderboard || data.leaderboard.length === 0) {
            message.textContent = "No students have attempted this quiz yet.";
            return;
        }

        data.leaderboard.forEach((student) => {

            const row = document.createElement("tr");
            row.className = "border-b hover:bg-slate-50";

            const rankCell = document.createElement("td");
            rankCell.className = "py-4 pr-4 font-bold text-indigo-600";
            rankCell.textContent = `#${student.rank}`;

            const nameCell = document.createElement("td");
            nameCell.className = "py-4 pr-4";
            nameCell.textContent = student.userName;

            const scoreCell = document.createElement("td");
            scoreCell.className = "py-4 pr-4";
            scoreCell.textContent =
                `${student.score} / ${student.totalQuestions}`;

            const percentageCell = document.createElement("td");
            percentageCell.className =
                "py-4 pr-4 font-semibold text-green-600";
            percentageCell.textContent = `${student.percentage}%`;

            const timeCell = document.createElement("td");
            timeCell.className = "py-4";
            timeCell.textContent =
                `${Math.floor(student.timeTakenSeconds / 60)}m ${student.timeTakenSeconds % 60}s`;

            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            row.appendChild(percentageCell);
            row.appendChild(timeCell);

            leaderboardTable.appendChild(row);

        });

    } catch (error) {

        loading.textContent = "";
        message.textContent = error.message;
        message.className = "text-center mt-6 text-red-600";

    }
}


// Button event
loadButton.addEventListener("click", loadLeaderboard);


// Start
if (token) {
    loadQuizzes();
}
