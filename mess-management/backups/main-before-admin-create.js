const crypto = require("crypto");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {
    registerUser,
    authenticateUser,
    createAdmin,
    authenticateAdmin,
    loadDatabase
} = require("./database");

const adminSessions = new Map();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 650,
        title: "Mess Management System",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "src", "login.html"));

    win.webContents.on("destroyed", () => {
        adminSessions.delete(win.webContents.id);
    });
}

ipcMain.handle("register-user", (event, details) => {
    try {
        return registerUser(details);
    } catch (error) {
        console.error(error);
        return { success: false, message: "Registration failed." };
    }
});

ipcMain.handle("login-user", (event, details) => {
    try {
        return authenticateUser(details.username, details.password);
    } catch (error) {
        console.error(error);
        return { success: false, message: "Login failed." };
    }
});

ipcMain.handle("create-admin", (event, details) => {
    try {
        return createAdmin(details);
    } catch (error) {
        console.error(error);
        return { success: false, message: "Admin creation failed." };
    }
});

ipcMain.handle("admin-login", (event, details) => {
    try {
        const result = authenticateAdmin(details.username, details.password);

        if (result.success) {
            adminSessions.set(event.sender.id, "admin");
        }

        return result;
    } catch (error) {
        console.error(error);
        return { success: false, message: "Admin login failed." };
    }
});

ipcMain.handle("get-admin-summary", (event) => {
    if (adminSessions.get(event.sender.id) !== "admin") {
        return { success: false, message: "Admin access only." };
    }

    const data = loadDatabase();
    const students = data.users.filter(u => (u.role || "student") === "student");

    const hostels = ["Sophia", "Cicily", "Joseph", "Alphonsa"];
    const hostelCounts = {};

    hostels.forEach(hostel => {
        hostelCounts[hostel] = students.filter(u => u.hostel === hostel).length;
    });

    return {
        success: true,
        total: students.length,
        vegetarian: students.filter(u => u.foodPreference === "Vegetarian").length,
        nonVegetarian: students.filter(u => u.foodPreference === "Non-Vegetarian").length,
        hostelCounts,
        students: students.map(u => ({
            name: u.name,
            username: u.username,
            hostel: u.hostel,
            foodPreference: u.foodPreference
        }))
    };
});

ipcMain.handle("admin-logout", event => {
    adminSessions.delete(event.sender.id);
    return { success: true };
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

