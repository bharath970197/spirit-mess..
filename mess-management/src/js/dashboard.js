document.addEventListener("DOMContentLoaded", function () {

    // 1. GET LOGGED-IN USER
    let currentUser;

    try {
        const savedUser = localStorage.getItem("currentUser");

        if (!savedUser) {
            window.location.replace("login.html");
            return;
        }

        currentUser = JSON.parse(savedUser);

    } catch (error) {
        console.error("Login information error:", error);
        window.location.replace("login.html");
        return;
    }

    // 2. CHECK ADMIN ACCOUNT
    if (
        currentUser.role &&
        currentUser.role.toLowerCase() === "admin"
    ) {
        window.location.replace("admin.html");
        return;
    }

    // 3. DISPLAY STUDENT INFORMATION
    const studentName =
        currentUser.name ||
        currentUser.username ||
        currentUser.fullName ||
        "Student";

    const hostelName =
        currentUser.hostel ||
        currentUser.hostelName ||
        "Hostel Student";

    document.getElementById("studentName").textContent = studentName;
    document.getElementById("welcomeName").textContent = studentName;
    document.getElementById("studentHostel").textContent = hostelName;
    document.getElementById("hostelTag").textContent = "ðŸ« " + hostelName;
    document.getElementById("hostelValue").textContent = hostelName;

    // 4. COMPLETE WEEKLY MENU
    const weeklyMenu = [
        {
            day: "Sunday",
            type: "nonveg",
            breakfast: "Masala Dosa, Sambar, Chutney",
            lunch: "Chicken Biryani, Raita and Sweet",
            snacks: "Bajji and Tea",
            dinner: "Rice, Chicken Curry"
        },
        {
            day: "Monday",
            type: "veg",
            breakfast: "Idli, Sambar, Coconut Chutney",
            lunch: "Rice, Dal, Paneer Curry, Curd",
            snacks: "Banana and Tea",
            dinner: "Chapati, Vegetable Kurma"
        },
        {
            day: "Tuesday",
            type: "nonveg",
            breakfast: "Poori, Potato Masala",
            lunch: "Rice, Chicken Curry, Egg, Vegetable Fry",
            snacks: "Samosa and Tea",
            dinner: "Chapati, Egg Curry"
        },
        {
            day: "Wednesday",
            type: "nonveg",
            breakfast: "Dosa, Sambar, Chutney",
            lunch: "Rice, Chicken Fry, Dal, Curd",
            snacks: "Sprouts and Buttermilk",
            dinner: "Chicken Biryani and Raita"
        },
        {
            day: "Thursday",
            type: "veg",
            breakfast: "Pongal, Sambar, Chutney",
            lunch: "Rice, Sambar, Potato Fry, Curd",
            snacks: "Biscuits and Milk",
            dinner: "Chapati, Paneer Curry"
        },
        {
            day: "Friday",
            type: "veg",
            breakfast: "Upma and Chutney",
            lunch: "Rice, Dal, Vegetable Fry",
            snacks: "Boiled Corn and Tea",
            dinner: "Vegetable Pulao and Raita"
        },
        {
            day: "Saturday",
            type: "veg",
            breakfast: "Pesarattu and Ginger Chutney",
            lunch: "Rice, Sambar, Soya Chunks Curry",
            snacks: "Fruit Salad",
            dinner: "Chapati, Mixed Vegetable Curry"
        }
    ];

    // 5. DISPLAY TODAY'S MEALS
    function displayTodayMenu() {

        const today = new Date().getDay();

        const todayMenu = weeklyMenu.find(
            item => item.day === [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ][today]
        );

        if (!todayMenu) return;

        document.getElementById("breakfast").textContent =
            todayMenu.breakfast;

        document.getElementById("lunch").textContent =
            todayMenu.lunch;

        document.getElementById("snacks").textContent =
            todayMenu.snacks;

        document.getElementById("dinner").textContent =
            todayMenu.dinner;

        const foodType = document.getElementById("foodType");

        if (todayMenu.type === "nonveg") {
            foodType.textContent = "NON-VEG DAY";
            foodType.className = "day-label nonveg";
        } else {
            foodType.textContent = "VEG DAY";
            foodType.className = "day-label";
        }
    }

    displayTodayMenu();

    // 6. LOGOUT
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function () {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        localStorage.removeItem("currentUser");

        window.location.replace("login.html");
    });

    // 7. CHECK WEEKLY MENU LINK
    const menuLinks = document.querySelectorAll(
        'a[href="menu.html"]'
    );

    menuLinks.forEach(link => {
        link.addEventListener("click", function () {
            console.log("Opening Weekly Menu");
        });
    });

    console.log("Student dashboard loaded successfully.");

});
