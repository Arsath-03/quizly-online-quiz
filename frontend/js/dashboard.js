
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

// Check whether the user is logged in
if (!token || !userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    // Display user's name
    document.getElementById("userName").textContent = user.name;
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", function () {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});
