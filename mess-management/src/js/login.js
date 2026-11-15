document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!form || !message) {
        console.error("Login form or message element is missing.");
        return;
    }

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.display = "block";
        message.style.padding = "12px";
        message.style.borderRadius = "8px";
        message.style.background = success ? "#dcfce7" : "#fee2e2";
        message.style.color = success ? "#166534" : "#991b1b";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const button = form.querySelector('button[type="submit"]');

        if (!username || !password) {
            showMessage("Please enter username and password.");
            return;
        }

        if (!window.messAPI || typeof window.messAPI.loginUser !== "function") {
            showMessage("Login connection error. Check preload.js.");
            return;
        }

        button.disabled = true;
        button.textContent = "Checking Login...";

        try {
            const result = await window.messAPI.loginUser({
                username: username,
                password: password
            });

            if (!result || !result.success) {
                showMessage(result?.message || "Invalid username or password.");
                button.disabled = false;
                button.textContent = "Login to Your Account â†’";
                return;
            }

            if (!result.user) {
                showMessage("Login succeeded, but user information was not returned.");
                button.disabled = false;
                button.textContent = "Login to Your Account â†’";
                return;
            }

            // Save the logged-in user's information.
            sessionStorage.setItem("messUser", JSON.stringify(result.user));
            localStorage.setItem("currentUser", JSON.stringify(result.user));

            showMessage("Login successful! Opening dashboard...", true);
            button.textContent = "Opening Dashboard...";

            const destination =
                result.user.role === "admin"
                    ? "admin.html"
                    : "dashboard.html";

            // Navigate relative to the current login page.
            const destinationURL = new URL(destination, window.location.href);

            setTimeout(() => {
                window.location.replace(destinationURL.href);
            }, 700);

        } catch (error) {
            console.error("Login error:", error);
            showMessage("Unable to complete login. Check the application connection.");
            button.disabled = false;
            button.textContent = "Login to Your Account â†’";
        }
    });
});
