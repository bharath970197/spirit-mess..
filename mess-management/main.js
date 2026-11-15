
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const crypto = require("crypto");

const {
    registerUser,
    authenticateUser,
    createAdmin,
    authenticateAdmin,
    loadDatabase,
    saveDatabase,
    submitFeedback,
    getAllFeedback,
    createAwayRequest,
    getStudentAwayRequests,
    getAllAwayRequests,
    updateAwayRequestStatus,
    getMealReport
} = require("./database");

const adminSessions = new Set();
const studentSessions = new Map();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 650,
        title: "Campus Mess Management System",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    const contentsId = win.webContents.id;

    win.loadFile(path.join(__dirname, "src", "login.html"));

    win.webContents.on("destroyed", () => {
        adminSessions.delete(contentsId);
        studentSessions.delete(contentsId);
    });
}

// STUDENT REGISTRATION
ipcMain.handle("register-user", (event, details) => {
    try {
        return registerUser(details);
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "Registration failed."
        };
    }
});

// STUDENT LOGIN
ipcMain.handle("login-user", (event, details) => {
    try {
        const result = authenticateUser(
            details.username,
            details.password
        );

        if (result.success) {
            studentSessions.set(event.sender.id, result.user.username);
            return result;
        }

        // Admin accounts are stored separately from student accounts.
        const adminResult = authenticateAdmin(details.username, details.password);
        if (adminResult.success) {
            adminSessions.add(event.sender.id);
            return {
                success: true,
                message: "Admin login successful!",
                user: {
                    username: adminResult.admin.username,
                    name: "Administrator",
                    role: "admin"
                }
            };
        }

        return result;
    } catch (error) {
        console.error("Student login error:", error);

        return {
            success: false,
            message: "Student login failed."
        };
    }
});

// STUDENT LOGOUT
ipcMain.handle("student-logout", event => {
    studentSessions.delete(event.sender.id);
    return { success: true };
});

// ADMIN CREATION
ipcMain.handle("create-admin", (event, details) => {
    try {
        return createAdmin(details);
    } catch (error) {
        console.error("Admin creation error:", error);

        return {
            success: false,
            message: "Admin creation failed."
        };
    }
});

// ADMIN LOGIN
ipcMain.handle("admin-login", (event, details) => {
    try {
        if (!details || !details.username || !details.password) {
            return {
                success: false,
                message: "Enter username and password."
            };
        }

        const result = authenticateAdmin(
            details.username,
            details.password
        );

        if (result.success) {
            adminSessions.add(event.sender.id);
            console.log("Admin session created:", event.sender.id);
        }

        return result;
    } catch (error) {
        console.error("Admin login error:", error);

        return {
            success: false,
            message: "Admin login failed."
        };
    }
});

// ADMIN SUMMARY
ipcMain.handle("get-admin-summary", event => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Admin access only."
        };
    }

    try {
        const data = loadDatabase();

        const students = (data.users || []).filter(
            user => (user.role || "student") === "student"
        );

        const hostels = ["Sophia", "Cicily", "Joseph", "Alphonsa"];
        const hostelCounts = {};

        hostels.forEach(hostel => {
            hostelCounts[hostel] = students.filter(
                student => student.hostel === hostel
            ).length;
        });

        return {
            success: true,
            total: students.length,
            vegetarian: students.filter(
                student => student.foodPreference === "Vegetarian"
            ).length,
            nonVegetarian: students.filter(
                student => student.foodPreference === "Non-Vegetarian"
            ).length,
            hostelCounts,
            students: students.map(student => ({
                name: student.name,
                username: student.username,
                hostel: student.hostel,
                foodPreference: student.foodPreference
            }))
        };
    } catch (error) {
        console.error("Admin summary error:", error);

        return {
            success: false,
            message: "Unable to load admin dashboard."
        };
    }
});

// GET MENU
ipcMain.handle("get-menu", () => {
    try {
        const data = loadDatabase();

        return {
            success: true,
            menu: Array.isArray(data.menu) ? data.menu : []
        };
    } catch (error) {
        console.error("GET MENU ERROR:", error);

        return {
            success: false,
            menu: [],
            message: error.message
        };
    }
});

// ADD OR EDIT MENU ITEM - ADMIN ONLY
ipcMain.handle("save-menu-item", (event, details) => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Only admin can edit the menu."
        };
    }

    try {
        const data = loadDatabase();

        if (!Array.isArray(data.menu)) data.menu = [];

        if (
            !details ||
            !details.day ||
            !details.meal ||
            !details.food ||
            !String(details.food).trim()
        ) {
            return {
                success: false,
                message: "Enter all menu details."
            };
        }

        const validDays = [
            "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday", "Sunday"
        ];

        const validMeals = [
            "Breakfast", "Snacks", "Lunch", "Dinner"
        ];

        if (
            !validDays.includes(details.day) ||
            !validMeals.includes(details.meal)
        ) {
            return {
                success: false,
                message: "Invalid day or meal."
            };
        }

        const item = {
            id: details.id ? String(details.id) : crypto.randomUUID(),
            day: details.day,
            meal: details.meal,
            food: String(details.food).trim(),
            hostel: details.hostel || "All"
        };

        if (details.id) {
            const index = data.menu.findIndex(
                menuItem => String(menuItem.id) === String(details.id)
            );

            if (index === -1) {
                return {
                    success: false,
                    message: "Menu item not found."
                };
            }

            data.menu[index] = {
                ...data.menu[index],
                ...item
            };
        } else {
            data.menu.push(item);
        }

        saveDatabase(data);

        return {
            success: true,
            message: details.id
                ? "Menu item updated successfully."
                : "Menu item added successfully.",
            item
        };
    } catch (error) {
        console.error("SAVE MENU ERROR:", error);

        return {
            success: false,
            message: "Unable to save menu: " + error.message
        };
    }
});

// DELETE MENU ITEM
ipcMain.handle("delete-menu-item", (event, id) => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Only admin can delete menu items."
        };
    }

    try {
        const data = loadDatabase();
        const before = data.menu.length;

        data.menu = data.menu.filter(
            item => String(item.id) !== String(id)
        );

        if (before === data.menu.length) {
            return {
                success: false,
                message: "Menu item not found."
            };
        }

        saveDatabase(data);

        return {
            success: true,
            message: "Menu item deleted successfully."
        };
    } catch (error) {
        console.error("DELETE MENU ERROR:", error);

        return {
            success: false,
            message: "Unable to delete menu item."
        };
    }
});

// STUDENT FEEDBACK
ipcMain.handle("submit-feedback", (event, details) => {
    try {
        return submitFeedback(details);
    } catch (error) {
        console.error("Feedback error:", error);

        return {
            success: false,
            message: "Unable to submit feedback."
        };
    }
});

// ADMIN FEEDBACK
ipcMain.handle("get-admin-feedback", event => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Admin access only."
        };
    }

    try {
        return {
            success: true,
            feedback: getAllFeedback()
        };
    } catch (error) {
        console.error("Admin feedback error:", error);

        return {
            success: false,
            feedback: []
        };
    }
});

// STUDENT: SUBMIT AWAY REQUEST
ipcMain.handle("create-away-request", (event, details) => {
    const username = studentSessions.get(event.sender.id);

    if (!username) {
        return {
            success: false,
            message: "Please log in as a student first."
        };
    }

    try {
        return createAwayRequest(username, details);
    } catch (error) {
        console.error("Away request error:", error);

        return {
            success: false,
            message: "Unable to submit away request: " + error.message
        };
    }
});

// STUDENT: VIEW OWN REQUESTS
ipcMain.handle("get-my-away-requests", event => {
    const username = studentSessions.get(event.sender.id);

    if (!username) {
        return {
            success: false,
            requests: [],
            message: "Please log in as a student first."
        };
    }

    try {
        return {
            success: true,
            requests: getStudentAwayRequests(username)
        };
    } catch (error) {
        console.error("Student request history error:", error);

        return {
            success: false,
            requests: [],
            message: "Unable to load your requests."
        };
    }
});

// ADMIN: VIEW ALL AWAY REQUESTS
ipcMain.handle("get-all-away-requests", event => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            requests: [],
            message: "Admin access only."
        };
    }

    try {
        return {
            success: true,
            requests: getAllAwayRequests()
        };
    } catch (error) {
        console.error("Admin away requests error:", error);

        return {
            success: false,
            requests: [],
            message: "Unable to load away requests."
        };
    }
});

// ADMIN: APPROVE OR REJECT REQUEST
ipcMain.handle("update-away-request-status", (event, details) => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Admin access only."
        };
    }

    try {
        if (!details) {
            return {
                success: false,
                message: "Request details are missing."
            };
        }

        return updateAwayRequestStatus(details.id, details.status);
    } catch (error) {
        console.error("Update away request error:", error);

        return {
            success: false,
            message: "Unable to update request."
        };
    }
});

// ADMIN: DAILY MEAL REPORT
ipcMain.handle("get-meal-report", (event, date) => {
    if (!adminSessions.has(event.sender.id)) {
        return {
            success: false,
            message: "Admin access only."
        };
    }

    try {
        return getMealReport(date);
    } catch (error) {
        console.error("Meal report error:", error);

        return {
            success: false,
            message: "Unable to generate meal report."
        };
    }
});

// ADMIN LOGOUT
ipcMain.handle("admin-logout", event => {
    adminSessions.delete(event.sender.id);
    return { success: true };
});

// APPLICATION START
app.whenReady().then(() => {
    console.log("Campus Mess Management System started.");

    console.log(
        "Database file:",
        path.join(__dirname, "mess-database.json")
    );

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
