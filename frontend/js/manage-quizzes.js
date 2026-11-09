const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

const quizContainer = document.getElementById("quizContainer");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

if (!token || !user) {
  window.location.href = "login.html";
} else if (user.role !== "admin") {
  alert("Access denied! Admin only.");
  window.location.href = "dashboard.html";
} else {
  loadQuizzes();
}

async function loadQuizzes() {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load quizzes.");
    }

    loading.style.display = "none";

    const quizzes = data.quizzes || [];

    if (quizzes.length === 0) {
      message.textContent = "No quizzes found. Create your first quiz!";
      return;
    }

    quizzes.forEach((quiz) => {
      const card = document.createElement("div");

      card.className = "bg-white p-6 rounded-xl shadow";

      const title = document.createElement("h3");
      title.className = "text-xl font-bold text-indigo-700 mb-2";
      title.textContent = quiz.title;

      const description = document.createElement("p");
      description.className = "text-gray-600 mb-3";
      description.textContent = quiz.description || "No description";

      const category = document.createElement("p");
      category.className = "mb-2";
      category.textContent = `Category: ${quiz.category}`;

      const duration = document.createElement("p");
      duration.className = "mb-2";
      duration.textContent = `Duration: ${quiz.duration} minutes`;

      const questions = document.createElement("p");
      questions.className = "mb-4";
      questions.textContent = `Questions: ${quiz.questions ? quiz.questions.length : 0}`;

      const deleteButton = document.createElement("button");

      deleteButton.textContent = "Delete Quiz";
      deleteButton.className =
        "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded";

      deleteButton.addEventListener("click", async () => {
        const confirmDelete = confirm(
          `Are you sure you want to delete "${quiz.title}"?`,
        );

        if (!confirmDelete) return;

        try {
          const response = await fetch(`${API_BASE_URL}/quizzes/${quiz._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to delete quiz.");
          }

          card.remove();

          message.textContent = "Quiz deleted successfully!";
          message.className = "text-center mt-6 text-green-600";
        } catch (error) {
          message.textContent = error.message;
          message.className = "text-center mt-6 text-red-600";
        }
      });

      card.append(
        title,
        description,
        category,
        duration,
        questions,
        deleteButton,
      );

      quizContainer.appendChild(card);
    });
  } catch (error) {
    loading.style.display = "none";
    message.textContent = error.message;
    message.className = "text-center mt-6 text-red-600";
  }
}
