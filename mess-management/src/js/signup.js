document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const username = document.getElementById("username").value.trim();
        const hostel = document.getElementById("hostel").value;
        const foodPreference = document.getElementById("foodPreference").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const button = form.querySelector('button[type="submit"]');

        function showMessage(text, success = false) {
            message.textContent = text;
            message.style.display = "block";
            message.style.color = success ? "#166534" : "#991b1b";
            message.style.background = success ? "#dcfce7" : "#fee2e2";
        }

        if (!name || !username || !hostel || !foodPreference || !password || !confirmPassword) {
            showMessage("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        if (!window.messAPI || !window.messAPI.registerUser) {
            showMessage("Application connection error. Check preload.js and main.js.");
            return;
        }

        button.disabled = true;
        button.textContent = "Creating Account...";

        try {
            const result = await window.messAPI.registerUser({
                name,
                username,
                hostel,
                foodPreference,
                password
            });

            if (result.success) {
                showMessage("Account created successfully! Opening login page...", true);
                form.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                showMessage(result.message || "Account could not be created.");
            }
        } catch (error) {
            console.error(error);
            showMessage("An error occurred while creating your account.");
        } finally {
            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
});
