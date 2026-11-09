
const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const quizId = params.get("id");

const quizTitle = document.getElementById("quizTitle");
const questionProgress = document.getElementById("questionProgress");
const questionContainer = document.getElementById("questionContainer");
const timerDisplay = document.getElementById("timer");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");

let quiz = null;
let currentQuestion = 0;
let answers = {};
let remainingSeconds = 0;
let timerInterval = null;
let submitted = false;

// Check login and quiz ID
if (!token) {
    window.location.href = "login.html";
}

if (!quizId) {
    quizTitle.textContent = "Quiz ID is missing";
    nextButton.disabled = true;
    previousButton.disabled = true;
    submitButton.disabled = true;
}


// Load quiz details
async function loadQuiz() {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load quiz");
        }

        quiz = data.quiz;

        if (!quiz || !Array.isArray(quiz.questions) ||
            quiz.questions.length === 0) {
            throw new Error("This quiz has no questions.");
        }

        quizTitle.textContent = quiz.title;

        remainingSeconds = quiz.duration * 60;

        displayQuestion();
        startTimer();

    } catch (error) {
        quizTitle.textContent = "Unable to load quiz";
        message.textContent = error.message;
        message.className = "mt-6 text-center text-red-600";
    }
}


// Display current question
function displayQuestion() {

    const question = quiz.questions[currentQuestion];

    questionProgress.textContent =
        `Question ${currentQuestion + 1} of ${quiz.questions.length}`;

    questionContainer.innerHTML = "";

    const heading = document.createElement("h3");
    heading.className = "text-xl font-semibold mb-6";
    heading.textContent = question.questionText;

    questionContainer.appendChild(heading);

    question.options.forEach((option, index) => {

        const label = document.createElement("label");

        label.className =
            "flex items-center gap-3 border border-slate-200 p-4 rounded-lg mb-3 cursor-pointer hover:bg-indigo-50";

        const radio = document.createElement("input");

        radio.type = "radio";
        radio.name = "answer";
        radio.value = index;
        radio.className = "w-4 h-4";

        radio.checked = answers[currentQuestion] === index;
        radio.disabled = submitted;

        radio.addEventListener("change", function () {
            answers[currentQuestion] = index;
        });

        const text = document.createElement("span");
        text.textContent = option;

        label.appendChild(radio);
        label.appendChild(text);

        questionContainer.appendChild(label);
    });

    previousButton.disabled = currentQuestion === 0;
    previousButton.classList.toggle(
        "opacity-50",
        currentQuestion === 0
    );

    nextButton.classList.toggle(
        "hidden",
        currentQuestion === quiz.questions.length - 1
    );

    submitButton.classList.toggle(
        "hidden",
        currentQuestion !== quiz.questions.length - 1
    );
}


// Timer
function startTimer() {

    timerInterval = setInterval(() => {

        if (submitted) return;

        remainingSeconds--;

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}


// Previous question
previousButton.addEventListener("click", function () {

    if (currentQuestion > 0 && !submitted) {
        currentQuestion--;
        displayQuestion();
    }

});


// Next question
nextButton.addEventListener("click", function () {

    if (currentQuestion < quiz.questions.length - 1 && !submitted) {
        currentQuestion++;
        displayQuestion();
    }

});


// Submit quiz
async function submitQuiz() {

    if (submitted || !quiz) return;

    submitted = true;

    clearInterval(timerInterval);

    previousButton.disabled = true;
    nextButton.disabled = true;
    submitButton.disabled = true;

    const formattedAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id,
        selectedOption:
            answers[index] !== undefined ? answers[index] : -1
    }));

    const timeTakenSeconds =
        (quiz.duration * 60) - remainingSeconds;

    try {

        const response = await fetch(
            `${API_BASE_URL}/quizzes/${quizId}/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: formattedAnswers,
                    timeTakenSeconds
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Quiz submission failed");
        }

        localStorage.setItem(
            "latestQuizResult",
            JSON.stringify(data.result)
        );

        message.textContent = "Quiz submitted successfully! Redirecting...";
        message.className = "mt-6 text-center text-green-600";

        setTimeout(() => {
            window.location.href = "results.html";
        }, 1500);

    } catch (error) {

        submitted = false;

        message.textContent = error.message;
        message.className = "mt-6 text-center text-red-600";

        submitButton.disabled = false;
        previousButton.disabled = currentQuestion === 0;
        nextButton.disabled =
            currentQuestion === quiz.questions.length - 1;

        startTimer();
    }
}


// Submit button
submitButton.addEventListener("click", function () {

    if (confirm("Are you sure you want to submit the quiz?")) {
        submitQuiz();
    }

});


// Start loading
if (token && quizId) {
    loadQuiz();
}
