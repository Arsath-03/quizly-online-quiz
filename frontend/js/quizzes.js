
const token = localStorage.getItem("token");

const quizContainer = document.getElementById("quizContainer");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

// Check login
if (!token) {
    window.location.href = "login.html";
}

// Fetch available quizzes
async function loadQuizzes() {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load quizzes");
        }

        loading.classList.add("hidden");

        if (!data.quizzes || data.quizzes.length === 0) {
            message.textContent = "No quizzes are available currently.";
            return;
        }

        data.quizzes.forEach((quiz) => {

            const card = document.createElement("div");

            card.className =
                "bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition";

            const title = document.createElement("h3");
            title.className = "text-xl font-bold mb-3 text-slate-800";
            title.textContent = quiz.title;

            const description = document.createElement("p");
            description.className = "text-slate-500 mb-4";
            description.textContent = quiz.description || "No description available.";

            const category = document.createElement("p");
            category.className = "text-indigo-600 font-medium mb-2";
            category.textContent = `Category: ${quiz.category}`;

            const details = document.createElement("p");
            details.className = "text-slate-500 mb-5";
            details.textContent =
                `Questions: ${quiz.totalQuestions} | Duration: ${quiz.duration} minutes`;

            const button = document.createElement("button");
            button.className =
                "w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700";

            button.textContent = "Start Quiz";

            button.addEventListener("click", () => {
                window.location.href =
                    `take-quiz.html?id=${encodeURIComponent(quiz._id)}`;
            });

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(category);
            card.appendChild(details);
            card.appendChild(button);

            quizContainer.appendChild(card);
        });

    } catch (error) {
        loading.classList.add("hidden");
        message.textContent = error.message;
        message.className = "text-center text-red-600 mt-8";
    }
}

if (token) {
    loadQuizzes();
}
