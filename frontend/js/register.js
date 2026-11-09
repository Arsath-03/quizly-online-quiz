
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");
    const button = document.getElementById("registerButton");

    message.textContent = "Creating your account...";
    message.className = "text-center mt-4 text-sm text-indigo-600";
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        message.textContent = "Registration successful! Redirecting to login...";
        message.className = "text-center mt-4 text-sm text-green-600";

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        message.textContent = error.message;
        message.className = "text-center mt-4 text-sm text-red-600";
    } finally {
        button.disabled = false;
    }
});
