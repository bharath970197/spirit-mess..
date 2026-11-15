
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const file = path.join(__dirname, "mess-database.json");

try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!Array.isArray(data.menu)) {
        data.menu = [];
    }

    if (data.menu.length > 0) {
        console.log("Menu already exists:", data.menu.length);
        process.exit(0);
    }

    const menu = {
        Monday: [
            ["Breakfast", "[Vegetarian] Idli and Sambar"],
            ["Lunch", "[Vegetarian] Rice, Dal and Chapati"],
            ["Dinner", "[Non-Vegetarian] Chicken Curry and Rice"]
        ],
        Tuesday: [
            ["Breakfast", "[Vegetarian] Dosa and Chutney"],
            ["Lunch", "[Vegetarian] Vegetable Pulao"],
            ["Dinner", "[Vegetarian] Chapati and Paneer Curry"]
        ],
        Wednesday: [
            ["Breakfast", "[Vegetarian] Poha"],
            ["Lunch", "[Non-Vegetarian] Chicken Biryani"],
            ["Dinner", "[Vegetarian] Rice and Dal"]
        ],
        Thursday: [
            ["Breakfast", "[Vegetarian] Upma"],
            ["Lunch", "[Vegetarian] Rice and Sambar"],
            ["Dinner", "[Non-Vegetarian] Egg Curry and Rice"]
        ],
        Friday: [
            ["Breakfast", "[Vegetarian] Puri and Potato Curry"],
            ["Lunch", "[Vegetarian] Rice and Vegetable Curry"],
            ["Dinner", "[Vegetarian] Fried Rice"]
        ],
        Saturday: [
            ["Breakfast", "[Vegetarian] Pongal"],
            ["Lunch", "[Non-Vegetarian] Chicken Curry and Rice"],
            ["Dinner", "[Vegetarian] Chapati and Dal"]
        ],
        Sunday: [
            ["Breakfast", "[Vegetarian] Poori and Chana Masala"],
            ["Lunch", "[Vegetarian] Vegetable Biryani"],
            ["Dinner", "[Vegetarian] Paneer Curry and Rice"]
        ]
    };

    let count = 0;

    for (const [day, meals] of Object.entries(menu)) {
        for (const [meal, food] of meals) {
            data.menu.push({
                id: crypto.randomUUID(),
                day,
                meal,
                food,
                hostel: "All"
            });
            count++;
        }
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");

    console.log("Weekly menu added successfully!");
    console.log("Total items:", count);

} catch (error) {
    console.error("Error:", error.message);
}
