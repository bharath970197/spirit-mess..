
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {
    registerUser,
    authenticateUser
} = require("./database");

function createWindow() {
    const mainWindow = new BrowserWindow({
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

    mainWindow.loadFile(path.join(__dirname, "src", "login.html"));
}

ipcMain.handle("register-user", (event, details) => {
    try {
        return registerUser(details);
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "Registration failed. Please try again."
        };
    }
});

ipcMain.handle("login-user", (event, details) => {
    try {
        return authenticateUser(details.username, details.password);
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "Login failed. Please try again."
        };
    }
});

app.whenReady().then(() => {
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
