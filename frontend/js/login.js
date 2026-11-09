
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");
    const button = document.getElementById("loginButton");

    message.textContent = "Logging in...";
    message.className = "text-center mt-4 text-sm text-indigo-600";
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        // Save login information
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        message.textContent = "Login successful!";
        message.className = "text-center mt-4 text-sm text-green-600";

        setTimeout(() => {
            if (data.user.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }, 1000);

    } catch (error) {
        message.textContent = error.message;
        message.className = "text-center mt-4 text-sm text-red-600";
    } finally {
        button.disabled = false;
    }
});
