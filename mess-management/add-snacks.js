const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "mess-database.json");

const snacks = [
    ["Monday", "[Vegetarian] Samosa and Tea"],
    ["Tuesday", "[Vegetarian] Veg Sandwich"],
    ["Wednesday", "[Vegetarian] Bhel Puri"],
    ["Thursday", "[Vegetarian] Onion Pakoda"],
    ["Friday", "[Vegetarian] Vegetable Cutlet"],
    ["Saturday", "[Vegetarian] Pav Bhaji"],
    ["Sunday", "[Vegetarian] Fruit Salad"]
];

const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

if (!Array.isArray(data.menu)) {
    data.menu = [];
}

let added = 0;

for (const [day, food] of snacks) {
    const exists = data.menu.some(item =>
        item.day === day &&
        item.meal === "Snacks" &&
        (item.hostel || "All") === "All"
    );

    if (!exists) {
        data.menu.push({
            id: crypto.randomUUID(),
            day,
            meal: "Snacks",
            food,
            hostel: "All"
        });
        added++;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

console.log("Snacks added:", added);
console.log("Total menu items:", data.menu.length);
