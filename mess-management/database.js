
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_FILE = path.join(__dirname, "mess-database.json");

const VALID_DAYS = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
];

const VALID_MEALS = [
    "Breakfast", "Snacks", "Lunch", "Dinner"
];

const MEAL_TIMES = {
    Breakfast: "08:00",
    Snacks: "16:00",
    Lunch: "13:00",
    Dinner: "20:00"
};

const VALID_HOSTELS = ["Sophia", "Cicily", "Joseph", "Alphonsa"];

/* ==================================
   DATABASE
================================== */

function loadDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const initial = {
            users: [],
            admins: [],
            feedback: [],
            menu: [],
            awayRequests: [],
            mealRegistrations: []
        };

        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }

    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.admins)) data.admins = [];
    if (!Array.isArray(data.feedback)) data.feedback = [];
    if (!Array.isArray(data.menu)) data.menu = [];
    if (!Array.isArray(data.awayRequests)) data.awayRequests = [];

    if (!Array.isArray(data.mealRegistrations)) {
        data.mealRegistrations = [];
    }

    return data;
}

function saveDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function hashPassword(password, salt) {
    return crypto.scryptSync(String(password), salt, 64).toString("hex");
}

function verifyPassword(password, account) {
    try {
        if (!account || !account.salt) return false;

        const storedHash = account.passwordHash || account.password;

        if (!storedHash || typeof storedHash !== "string") {
            return false;
        }

        const supplied = Buffer.from(
            hashPassword(password, account.salt), "hex"
        );

        const stored = Buffer.from(storedHash, "hex");

        return supplied.length === stored.length &&
            crypto.timingSafeEqual(supplied, stored);
    } catch (error) {
        console.error("Password verification error:", error);
        return false;
    }
}

/* ==================================
   STUDENT REGISTRATION
================================== */

function registerUser(details) {
    const data = loadDatabase();

    const name = String(details.name || "").trim();
    const username = String(details.username || "").trim();
    const password = String(details.password || "");

    if (
        !name ||
        !username ||
        !password ||
        !details.hostel ||
        !details.foodPreference
    ) {
        return {
            success: false,
            message: "Please fill all fields."
        };
    }

    if (!VALID_HOSTELS.includes(details.hostel)) {
        return {
            success: false,
            message: "Please select a valid hostel."
        };
    }

    const preference = String(details.foodPreference)
        .trim()
        .toLowerCase();

    if (!["vegetarian", "non-vegetarian", "veg", "nonveg"].includes(preference)) {
        return {
            success: false,
            message: "Please select a valid food preference."
        };
    }

    if (data.users.some(u =>
        normalizeUsername(u.username) === normalizeUsername(username)
    )) {
        return {
            success: false,
            message: "Username already exists."
        };
    }

    const salt = crypto.randomBytes(16).toString("hex");

    data.users.push({
        id: crypto.randomUUID(),
        name,
        username,
        salt,
        passwordHash: hashPassword(password, salt),
        role: "student",
        hostel: details.hostel,
        foodPreference: details.foodPreference,
        createdAt: new Date().toISOString()
    });

    saveDatabase(data);

    return {
        success: true,
        message: "Account created successfully."
    };
}

/* ==================================
   STUDENT LOGIN
================================== */

function authenticateUser(username, password) {
    const data = loadDatabase();

    const user = data.users.find(u =>
        normalizeUsername(u.username) === normalizeUsername(username)
    );

    if (!user || !verifyPassword(password, user)) {
        return {
            success: false,
            message: "Invalid username or password."
        };
    }

    return {
        success: true,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            hostel: user.hostel,
            foodPreference: user.foodPreference,
            role: "student"
        }
    };
}

/* ==================================
   ADMIN
================================== */

function createAdmin(details) {
    const data = loadDatabase();

    const username = String(details.username || "").trim();
    const password = String(details.password || "");

    if (!username || !password) {
        return {
            success: false,
            message: "Enter admin credentials."
        };
    }

    if (data.admins.length > 0) {
        return {
            success: false,
            message: "Admin already exists."
        };
    }

    const salt = crypto.randomBytes(16).toString("hex");

    data.admins.push({
        id: crypto.randomUUID(),
        username,
        salt,
        passwordHash: hashPassword(password, salt),
        role: "admin",
        createdAt: new Date().toISOString()
    });

    saveDatabase(data);

    return {
        success: true,
        message: "Admin created successfully."
    };
}

function authenticateAdmin(username, password) {
    const data = loadDatabase();

    const admin = data.admins.find(a =>
        normalizeUsername(a.username) === normalizeUsername(username)
    );

    if (!admin || !verifyPassword(password, admin)) {
        return {
            success: false,
            message: "Invalid admin username or password."
        };
    }

    return {
        success: true,
        admin: {
            username: admin.username,
            role: "admin"
        }
    };
}

/* ==================================
   STUDENT FEEDBACK
================================== */

function submitFeedback(details) {
    const data = loadDatabase();

    const username = normalizeUsername(details.username);

    const student = data.users.find(u =>
        normalizeUsername(u.username) === username
    );

    if (!student) {
        return {
            success: false,
            message: "Student not found."
        };
    }

    const rating = Number(details.rating);
    const category = String(details.category || "").trim();
    const message = String(details.message || "").trim();

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5 ||
        !category ||
        !message
    ) {
        return {
            success: false,
            message: "Complete all feedback fields."
        };
    }

    data.feedback.push({
        id: crypto.randomUUID(),
        name: student.name,
        username: student.username,
        hostel: student.hostel,
        rating,
        feeling: details.feeling || "",
        category,
        message,
        date: new Date().toISOString()
    });

    saveDatabase(data);

    return {
        success: true,
        message: "Feedback submitted successfully."
    };
}

function getAllFeedback() {
    return loadDatabase().feedback.slice().reverse();
}

/* ==================================
   DATE AND TIME HELPERS
================================== */

function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
}

function parseLocalDateTime(value) {
    const text = String(value || "");

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) {
        return null;
    }

    const [datePart, timePart] = text.split("T");

    if (!isValidDateString(datePart)) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
    }

    const date = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) {
        return null;
    }

    return date;
}

function formatLocalDate(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function makeLocalMealDate(dateString, meal) {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hour, minute] = MEAL_TIMES[meal].split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/* ==================================
   LEGACY MEAL REGISTRATION
   Kept for compatibility with existing
   main.js and preload.js.
   It is NOT used by the meal report.
================================== */

function registerStudentMeals(username, dateString, selectedMeals) {
    const data = loadDatabase();

    const student = data.users.find(user =>
        normalizeUsername(user.username) === normalizeUsername(username)
    );

    if (!student) {
        return {
            success: false,
            message: "Student account not found."
        };
    }

    if (!isValidDateString(dateString)) {
        return {
            success: false,
            message: "Please select a valid meal registration date."
        };
    }

    if (!Array.isArray(selectedMeals)) {
        return {
            success: false,
            message: "Please select your meals."
        };
    }

    const meals = [...new Set(selectedMeals)];

    if (
        meals.length === 0 ||
        meals.some(meal => !VALID_MEALS.includes(meal))
    ) {
        return {
            success: false,
            message: "Please select at least one valid meal."
        };
    }

    const now = new Date();

    for (const meal of meals) {
        const mealDateTime = makeLocalMealDate(dateString, meal);
        const deadline = new Date(
            mealDateTime.getTime() - 6 * 60 * 60 * 1000
        );

        if (now > deadline) {
            return {
                success: false,
                message:
                    `Registration deadline has passed for ${meal} on ${dateString}.`
            };
        }
    }

    const existingIndex = data.mealRegistrations.findIndex(record =>
        record.studentId === student.id &&
        record.date === dateString
    );

    const registration = {
        id: existingIndex >= 0
            ? data.mealRegistrations[existingIndex].id
            : crypto.randomUUID(),
        studentId: student.id,
        name: student.name,
        username: student.username,
        hostel: student.hostel,
        foodPreference: student.foodPreference,
        date: dateString,
        meals,
        updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        data.mealRegistrations[existingIndex] = registration;
    } else {
        data.mealRegistrations.push(registration);
    }

    saveDatabase(data);

    return {
        success: true,
        message: "Meal registration saved successfully.",
        registration
    };
}

function getStudentMealRegistration(username, dateString) {
    const data = loadDatabase();

    const student = data.users.find(user =>
        normalizeUsername(user.username) === normalizeUsername(username)
    );

    if (!student) return null;

    return data.mealRegistrations.find(record =>
        record.studentId === student.id &&
        record.date === dateString
    ) || null;
}

/* ==================================
   SMART AWAY REQUEST MANAGEMENT
================================== */

function getAffectedMeals(departure, returnDate) {
    const affectedMeals = [];

    const cursor = new Date(
        departure.getFullYear(),
        departure.getMonth(),
        departure.getDate()
    );

    const lastDate = new Date(
        returnDate.getFullYear(),
        returnDate.getMonth(),
        returnDate.getDate()
    );

    while (cursor <= lastDate) {
        const dateString = formatLocalDate(cursor);

        for (const meal of VALID_MEALS) {
            const mealDateTime = makeLocalMealDate(dateString, meal);

            if (
                mealDateTime >= departure &&
                mealDateTime < returnDate
            ) {
                affectedMeals.push({
                    meal,
                    date: dateString,
                    dateTime: mealDateTime
                });
            }
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return affectedMeals;
}

function createAwayRequest(username, details) {
    const data = loadDatabase();

    const student = data.users.find(user =>
        normalizeUsername(user.username) === normalizeUsername(username)
    );

    if (!student) {
        return {
            success: false,
            message: "Student account not found."
        };
    }

    details = details || {};

    const departureText = String(details.departureDateTime || "");
    const returnText = String(details.returnDateTime || "");

    const departure = parseLocalDateTime(departureText);
    const returnDate = parseLocalDateTime(returnText);

    if (!departure || !returnDate) {
        return {
            success: false,
            message: "Please select valid departure and return date/time."
        };
    }

    if (departure < new Date()) {
        return {
            success: false,
            message: "Departure date and time cannot be in the past."
        };
    }

    if (returnDate <= departure) {
        return {
            success: false,
            message: "Return date and time must be later than departure."
        };
    }

    const affectedMeals = getAffectedMeals(departure, returnDate);

    if (affectedMeals.length === 0) {
        return {
            success: false,
            message: "No scheduled meals fall within your selected away period."
        };
    }

    const now = new Date();
    const sixHours = 6 * 60 * 60 * 1000;

    for (const item of affectedMeals) {
        if (now.getTime() > item.dateTime.getTime() - sixHours) {
            return {
                success: false,
                message:
                    `The 6-hour cancellation deadline has passed for ` +
                    `${item.meal} on ${item.date}.`
            };
        }
    }

    const hasOverlap = data.awayRequests.some(request => {
        if (
            normalizeUsername(request.username) !==
            normalizeUsername(student.username)
        ) {
            return false;
        }

        if (
            request.status !== "Approved" &&
            request.status !== "Pending"
        ) {
            return false;
        }

        const existingDeparture =
            parseLocalDateTime(request.departureDateTime);

        const existingReturn =
            parseLocalDateTime(request.returnDateTime);

        if (!existingDeparture || !existingReturn) return false;

        return departure < existingReturn &&
            returnDate > existingDeparture;
    });

    if (hasOverlap) {
        return {
            success: false,
            message: "You already have an overlapping away request."
        };
    }

    const meals = [...new Set(affectedMeals.map(item => item.meal))];

    const request = {
        id: crypto.randomUUID(),
        studentId: student.id,
        name: student.name,
        username: student.username,
        hostel: student.hostel,
        departureDateTime: departureText,
        returnDateTime: returnText,
        fromDate: formatLocalDate(departure),
        toDate: formatLocalDate(returnDate),
        meals,
        status: "Approved",
        autoApproved: true,
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString()
    };

    data.awayRequests.push(request);
    saveDatabase(data);

    return {
        success: true,
        message: "Away request automatically approved. Affected meals have been cancelled.",
        request
    };
}

function getStudentAwayRequests(username) {
    return loadDatabase().awayRequests
        .filter(request =>
            normalizeUsername(request.username) === normalizeUsername(username)
        )
        .sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );
}

function getAllAwayRequests() {
    return loadDatabase().awayRequests
        .slice()
        .sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );
}

function updateAwayRequestStatus(requestId, status) {
    const data = loadDatabase();

    if (!["Approved", "Rejected"].includes(status)) {
        return {
            success: false,
            message: "Invalid request status."
        };
    }

    const request = data.awayRequests.find(
        item => item.id === String(requestId)
    );

    if (!request) {
        return {
            success: false,
            message: "Away request not found."
        };
    }

    if (request.autoApproved || request.status !== "Pending") {
        return {
            success: false,
            message: "This request has already been processed."
        };
    }

    request.status = status;
    request.reviewedAt = new Date().toISOString();

    saveDatabase(data);

    return {
        success: true,
        message: "Request " + status.toLowerCase() + " successfully."
    };
}

/* ==================================
   FOOD PREFERENCE
================================== */

function getFoodCategory(foodPreference) {
    const preference = String(foodPreference || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]/g, "");

    if (preference === "vegetarian" || preference === "veg") {
        return "vegetarian";
    }

    if (preference === "nonvegetarian" || preference === "nonveg") {
        return "nonVegetarian";
    }

    return "unclassified";
}

/* ==================================
   CHECK AWAY REQUEST FOR A MEAL
================================== */

function requestCancelsMealOnDate(request, dateString, meal) {
    if (request.status !== "Approved") {
        return false;
    }

    if (
        !Array.isArray(request.meals) ||
        !request.meals.includes(meal)
    ) {
        return false;
    }

    if (request.departureDateTime && request.returnDateTime) {
        const departure =
            parseLocalDateTime(request.departureDateTime);

        const returnDate =
            parseLocalDateTime(request.returnDateTime);

        if (!departure || !returnDate) return false;

        const mealDateTime = makeLocalMealDate(dateString, meal);

        return mealDateTime >= departure &&
            mealDateTime < returnDate;
    }

    // Backward compatibility for older requests.
    return Boolean(
        request.fromDate &&
        request.toDate &&
        dateString >= request.fromDate &&
        dateString <= request.toDate
    );
}

/* ==================================
   DAILY MEAL REPORT
================================== */

function getMealReport(dateString) {
    if (!isValidDateString(dateString)) {
        return {
            success: false,
            message: "Invalid report date."
        };
    }

    const data = loadDatabase();

    // Automatically count every registered student for every meal.
    // No daily meal registration is required.
    const students = data.users.filter(
        user => (user.role || "student") === "student"
    );

    const report = VALID_HOSTELS.map(hostel => {
        const hostelStudents = students.filter(
            student => student.hostel === hostel
        );

        const meals = {};

        VALID_MEALS.forEach(meal => {
            const registeredVegIds = new Set();
            const registeredNonVegIds = new Set();
            const registeredUnclassifiedIds = new Set();

            hostelStudents.forEach(student => {
                const category = getFoodCategory(student.foodPreference);

                if (category === "vegetarian") {
                    registeredVegIds.add(student.id);
                } else if (category === "nonVegetarian") {
                    registeredNonVegIds.add(student.id);
                } else {
                    registeredUnclassifiedIds.add(student.id);
                }
            });

            const cancelledVegIds = new Set();
            const cancelledNonVegIds = new Set();
            const cancelledUnclassifiedIds = new Set();

            data.awayRequests.forEach(request => {
                if (
                    request.hostel !== hostel ||
                    !requestCancelsMealOnDate(request, dateString, meal)
                ) {
                    return;
                }

                const student = hostelStudents.find(user =>
                    user.id === request.studentId
                );

                if (!student) return;

                const category = getFoodCategory(student.foodPreference);

                if (category === "vegetarian") {
                    cancelledVegIds.add(student.id);
                } else if (category === "nonVegetarian") {
                    cancelledNonVegIds.add(student.id);
                } else {
                    cancelledUnclassifiedIds.add(student.id);
                }
            });

            const registeredVeg = registeredVegIds.size;
            const registeredNonVeg = registeredNonVegIds.size;
            const registeredUnclassified = registeredUnclassifiedIds.size;

            const cancelledVeg = cancelledVegIds.size;
            const cancelledNonVeg = cancelledNonVegIds.size;
            const cancelledUnclassified = cancelledUnclassifiedIds.size;

            const expectedVeg = Math.max(0, registeredVeg - cancelledVeg);
            const expectedNonVeg = Math.max(0, registeredNonVeg - cancelledNonVeg);
            const expectedUnclassified = Math.max(
                0,
                registeredUnclassified - cancelledUnclassified
            );

            meals[meal] = {
                registeredVeg,
                cancelledVeg,
                expectedVeg,

                registeredNonVeg,
                cancelledNonVeg,
                expectedNonVeg,

                registeredUnclassified,
                cancelledUnclassified,
                expectedUnclassified,

                registered:
                    registeredVeg +
                    registeredNonVeg +
                    registeredUnclassified,

                cancelled:
                    cancelledVeg +
                    cancelledNonVeg +
                    cancelledUnclassified,

                expected:
                    expectedVeg +
                    expectedNonVeg +
                    expectedUnclassified
            };
        });

        return {
            hostel,
            totalStudents: hostelStudents.length,
            meals
        };
    });

    // Calculate totals separately for each meal across all hostels.
    const overall = {};

    VALID_MEALS.forEach(meal => {
        const totals = {
            registeredVeg: 0,
            cancelledVeg: 0,
            expectedVeg: 0,

            registeredNonVeg: 0,
            cancelledNonVeg: 0,
            expectedNonVeg: 0,

            registeredUnclassified: 0,
            cancelledUnclassified: 0,
            expectedUnclassified: 0,

            registered: 0,
            cancelled: 0,
            expected: 0
        };

        report.forEach(hostelReport => {
            const values = hostelReport.meals[meal];

            Object.keys(totals).forEach(key => {
                totals[key] += values[key];
            });
        });

        overall[meal] = totals;
    });

    return {
        success: true,
        date: dateString,
        hostels: report,
        overall
    };
}

/* ==================================
   EXPORT FUNCTIONS
================================== */

module.exports = {
    loadDatabase,
    saveDatabase,

    registerUser,
    authenticateUser,

    createAdmin,
    authenticateAdmin,

    submitFeedback,
    getAllFeedback,

    // Kept for compatibility with existing main.js/preload.js.
    registerStudentMeals,
    getStudentMealRegistration,

    createAwayRequest,
    getStudentAwayRequests,
    getAllAwayRequests,
    updateAwayRequestStatus,

    getMealReport
};