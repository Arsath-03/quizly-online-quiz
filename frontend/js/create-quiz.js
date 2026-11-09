
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user) {
    window.location.href = "login.html";
} else if (user.role !== "admin") {
    alert("Access denied! Admin only.");
    window.location.href = "dashboard.html";
}

const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const quizForm = document.getElementById("quizForm");
const message = document.getElementById("message");

let questionCount = 0;

// Add a new question
function addQuestion() {
    questionCount++;

    const questionDiv = document.createElement("div");
    questionDiv.className = "border p-4 rounded-lg mb-5 bg-gray-50";

    questionDiv.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-lg">Question ${questionCount}</h3>
            <button type="button"
                class="removeQuestion bg-red-500 text-white px-3 py-1 rounded">
                Remove
            </button>
        </div>

        <label class="block font-semibold mb-2">Question</label>
        <input type="text" class="questionText w-full border p-2 rounded mb-3"
            placeholder="Enter your question" required>

        <label class="block font-semibold mb-2">Option 1</label>
        <input type="text" class="option w-full border p-2 rounded mb-3" required>

        <label class="block font-semibold mb-2">Option 2</label>
        <input type="text" class="option w-full border p-2 rounded mb-3" required>

        <label class="block font-semibold mb-2">Option 3</label>
        <input type="text" class="option w-full border p-2 rounded mb-3" required>

        <label class="block font-semibold mb-2">Option 4</label>
        <input type="text" class="option w-full border p-2 rounded mb-3" required>

        <label class="block font-semibold mb-2">Correct Answer</label>
        <select class="correctAnswer w-full border p-2 rounded mb-3">
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
        </select>

        <label class="block font-semibold mb-2">Points</label>
        <input type="number" class="points w-full border p-2 rounded"
            value="1" min="1" required>
    `;

    questionDiv.querySelector(".removeQuestion").addEventListener("click", () => {
        questionDiv.remove();
        updateQuestionNumbers();
    });

    questionsContainer.appendChild(questionDiv);
    updateQuestionNumbers();
}

// Update question headings after removing a question
function updateQuestionNumbers() {
    const questionCards = questionsContainer.children;

    for (let i = 0; i < questionCards.length; i++) {
        questionCards[i].querySelector("h3").textContent = `Question ${i + 1}`;
    }
}

addQuestionBtn.addEventListener("click", addQuestion);

// Start with one question
addQuestion();

// Submit quiz
quizForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const questionCards = questionsContainer.children;

    if (questionCards.length === 0) {
        message.textContent = "Please add at least one question.";
        message.className = "text-center mt-4 text-red-600";
        return;
    }

    const questions = [];

    for (const card of questionCards) {
        const questionText = card.querySelector(".questionText").value.trim();

        const options = Array.from(card.querySelectorAll(".option"))
            .map(option => option.value.trim());

        if (!questionText || options.some(option => !option)) {
            message.textContent = "Please fill in all question fields.";
            message.className = "text-center mt-4 text-red-600";
            return;
        }

        questions.push({
            questionText,
            options,
            correctAnswer: Number(card.querySelector(".correctAnswer").value),
            points: Number(card.querySelector(".points").value)
        });
    }

    const quizData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value.trim(),
        duration: Number(document.getElementById("duration").value),
        questions
    };

    try {
        message.textContent = "Creating quiz...";
        message.className = "text-center mt-4 text-indigo-600";

        const response = await fetch(`${API_BASE_URL}/quizzes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(quizData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create quiz.");
        }

        message.textContent = "Quiz created successfully!";
        message.className = "text-center mt-4 text-green-600";

        quizForm.reset();
        questionsContainer.innerHTML = "";
        questionCount = 0;
        addQuestion();

    } catch (error) {
        message.textContent = error.message;
        message.className = "text-center mt-4 text-red-600";
    }
});
