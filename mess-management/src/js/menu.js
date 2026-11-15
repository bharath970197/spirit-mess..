"use strict";

// ==========================================
// WEEKLY MENU DATA
// ==========================================

const weeklyMenu = [
    {
        day: "Monday",
        type: "veg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Idli, Sambar, Coconut Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Dal, Paneer Curry, Vegetable Fry, Curd", type: "veg" },
            { name: "â˜• Evening Snacks", food: "Banana and Tea", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Chapati, Vegetable Kurma, Rice", type: "veg" }
        ]
    },
    {
        day: "Tuesday",
        type: "nonveg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Poori, Potato Masala, Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Chicken Curry, Egg, Vegetable Fry", type: "nonveg" },
            { name: "â˜• Evening Snacks", food: "Samosa and Tea", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Chapati, Egg Curry, Rice", type: "nonveg" }
        ]
    },
    {
        day: "Wednesday",
        type: "nonveg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Dosa, Sambar, Coconut Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Chicken Fry, Dal, Curd", type: "nonveg" },
            { name: "â˜• Evening Snacks", food: "Sprouts and Buttermilk", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Chicken Biryani and Raita", type: "nonveg" }
        ]
    },
    {
        day: "Thursday",
        type: "veg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Pongal, Sambar, Coconut Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Sambar, Potato Fry, Curd", type: "veg" },
            { name: "â˜• Evening Snacks", food: "Biscuits and Milk", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Chapati, Paneer Curry, Rice", type: "veg" }
        ]
    },
    {
        day: "Friday",
        type: "veg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Upma and Coconut Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Dal, Vegetable Fry, Rasam", type: "veg" },
            { name: "â˜• Evening Snacks", food: "Boiled Corn and Tea", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Vegetable Pulao and Raita", type: "veg" }
        ]
    },
    {
        day: "Saturday",
        type: "veg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Pesarattu and Ginger Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Rice, Sambar, Soya Chunks Curry, Curd", type: "veg" },
            { name: "â˜• Evening Snacks", food: "Fruit Salad", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Chapati and Mixed Vegetable Curry", type: "veg" }
        ]
    },
    {
        day: "Sunday",
        type: "nonveg",
        meals: [
            { name: "ðŸŒ… Breakfast", food: "Masala Dosa, Sambar, Chutney", type: "veg" },
            { name: "ðŸ› Lunch", food: "Chicken Biryani, Raita and Sweet", type: "nonveg" },
            { name: "â˜• Evening Snacks", food: "Bajji and Tea", type: "veg" },
            { name: "ðŸŒ™ Dinner", food: "Rice and Chicken Curry", type: "nonveg" }
        ]
    }
];

// ==========================================
// MENU DISPLAY FUNCTION
// ==========================================

function displayMenu(filter = "all") {

    const menuGrid = document.getElementById("menuGrid");
    const hostelSelect = document.getElementById("hostelSelect");

    if (!menuGrid) {
        console.error("Cannot find #menuGrid. Check menu.html.");
        return;
    }

    const hostel = hostelSelect
        ? hostelSelect.value
        : "Sophia";

    const filteredMenu = weeklyMenu.filter(day => {
        if (filter === "veg") return day.type === "veg";
        if (filter === "nonveg") return day.type === "nonveg";
        return true;
    });

    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `
            <div class="error">No menu found.</div>
        `;
        return;
    }

    menuGrid.innerHTML = filteredMenu.map(day => {

        const meals = day.meals.map(meal => {

            const tagClass = meal.type === "nonveg" ? "nonveg" : "veg";
            const tagText = meal.type === "nonveg" ? "NON-VEG" : "VEG";

            return `
                <div class="meal">
                    <h4>${meal.name}</h4>
                    <p>${meal.food}</p>
                    <span class="tag ${tagClass}">${tagText}</span>
                </div>
            `;

        }).join("");

        return `
            <article class="day-card">

                <div class="day-header">
                    <h3>${day.day}</h3>
                    <p>${hostel} Hostel</p>
                    <p>${day.type === "nonveg"
                        ? "Vegetarian + Non-Vegetarian"
                        : "Vegetarian Only"}</p>
                </div>

                ${meals}

            </article>
        `;

    }).join("");
}

// ==========================================
// FILTER BUTTONS
// ==========================================

function initializeMenu() {

    const buttons = document.querySelectorAll(".filter-btn");
    const hostelSelect = document.getElementById("hostelSelect");

    let currentFilter = "all";

    buttons.forEach(button => {
        button.addEventListener("click", function () {

            buttons.forEach(btn => btn.classList.remove("active"));

            this.classList.add("active");

            currentFilter = this.dataset.filter || "all";

            displayMenu(currentFilter);
        });
    });

    if (hostelSelect) {
        hostelSelect.addEventListener("change", function () {
            displayMenu(currentFilter);
        });
    }

    displayMenu(currentFilter);

    console.log("Weekly menu initialized successfully.");
}

// ==========================================
// START WHEN HTML IS READY
// ==========================================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMenu);
} else {
    initializeMenu();
}
