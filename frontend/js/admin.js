const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check admin authentication
if (!token || !user) {
    window.location.href = "login.html";
}
else if (user.role !== "admin") {
    alert("Access denied! Admin only.");
    window.location.href = "dashboard.html";
}
else {
    document.getElementById("adminName").textContent = user.name;

    loadAdminQuizzes();
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// Load all quizzes
async function loadAdminQuizzes() {

    const quizSelect = document.getElementById("adminQuizSelect");
    const message = document.getElementById("adminLeaderboardMessage");

    try {

        const response = await fetch(`${API_BASE_URL}/quizzes/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load quizzes");
        }

        quizSelect.innerHTML = `
            <option value="">Select a quiz</option>
        `;

        if (!data.quizzes || data.quizzes.length === 0) {
            message.textContent = "No quizzes are available.";
            return;
        }

        data.quizzes.forEach(quiz => {

            const option = document.createElement("option");

            option.value = quiz._id;
            option.textContent = quiz.title;

            quizSelect.appendChild(option);

        });

        message.textContent =
            `${data.quizzes.length} quiz(es) available. Select one to view its leaderboard.`;

    }
    catch (error) {

        console.error("Quiz loading error:", error);

        message.textContent = error.message;

    }

}


// Load leaderboard when admin selects a quiz
document.getElementById("adminQuizSelect").addEventListener(
    "change",
    async function () {

        const quizId = this.value;

        const container = document.getElementById(
            "adminLeaderboardContainer"
        );

        const message = document.getElementById(
            "adminLeaderboardMessage"
        );

        container.innerHTML = "";

        if (!quizId) {
            message.textContent = "Select a quiz to view its leaderboard.";
            return;
        }

        message.textContent = "Loading leaderboard...";

        try {

            const response = await fetch(
                `${API_BASE_URL}/results/admin/leaderboard/${quizId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load leaderboard"
                );
            }

            displayAdminLeaderboard(data);

        }
        catch (error) {

            console.error("Leaderboard error:", error);

            message.textContent = error.message;

        }

    }
);


// Display leaderboard
function displayAdminLeaderboard(data) {

    const container = document.getElementById(
        "adminLeaderboardContainer"
    );

    const message = document.getElementById(
        "adminLeaderboardMessage"
    );

    container.innerHTML = "";

    const leaderboard = data.leaderboard || [];

    message.textContent =
        `Total participants: ${data.totalParticipants}`;

    if (leaderboard.length === 0) {

        message.textContent =
            "No students have attempted this quiz yet.";

        return;

    }

    const table = document.createElement("table");

    table.className = "w-full text-sm text-left";

    table.innerHTML = `
        <thead class="bg-gray-100 text-gray-700">
            <tr>
                <th class="p-3">Rank</th>
                <th class="p-3">Student</th>
                <th class="p-3">Score</th>
                <th class="p-3">Percentage</th>
                <th class="p-3">Time Taken</th>
                <th class="p-3">Submitted At</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    leaderboard.forEach(student => {

        const row = document.createElement("tr");

        row.className = "border-b border-gray-200";

        const timeTaken = formatTime(student.timeTakenSeconds);

        const submittedAt = student.submittedAt
            ? new Date(student.submittedAt).toLocaleString()
            : "N/A";

        row.innerHTML = `
            <td class="p-3 font-semibold">
                #${student.rank}
            </td>

            <td class="p-3">
                ${escapeHTML(student.userName)}
            </td>

            <td class="p-3">
                ${student.score} 
            </td>

            <td class="p-3 font-semibold text-indigo-600">
                ${student.percentage}%
            </td>

            <td class="p-3">
                ${timeTaken}
            </td>

            <td class="p-3">
                ${submittedAt}
            </td>
        `;

        tbody.appendChild(row);

    });

    container.appendChild(table);

}


// Format seconds into minutes and seconds
function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes} min ${remainingSeconds} sec`;

}


// Prevent HTML injection in student names
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}