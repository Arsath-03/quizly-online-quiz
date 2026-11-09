
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check whether the user is logged in
if (!token || !user) {
    window.location.href = "login.html";
}

// Check whether the user is an admin
else if (user.role !== "admin") {
    alert("Access denied! Admin only.");
    window.location.href = "dashboard.html";
}

// Display admin name
else {
    document.getElementById("adminName").textContent = user.name;
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});
