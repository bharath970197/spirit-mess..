const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld("messAPI", Object.freeze({
  registerUser: invoke("register-user"),
  loginUser: invoke("login-user"),
  studentLogout: invoke("student-logout"),
  createAdmin: invoke("create-admin"),
  adminLogin: invoke("admin-login"),
  getAdminSummary: invoke("get-admin-summary"),
  getMenu: invoke("get-menu"),
  saveMenuItem: invoke("save-menu-item"),
  deleteMenuItem: invoke("delete-menu-item"),
  submitFeedback: invoke("submit-feedback"),
  getAdminFeedback: invoke("get-admin-feedback"),
  createAwayRequest: invoke("create-away-request"),
  getMyAwayRequests: invoke("get-my-away-requests"),
  getAllAwayRequests: invoke("get-all-away-requests"),
  updateAwayRequestStatus: invoke("update-away-request-status"),
  getMealReport: invoke("get-meal-report"),
  adminLogout: invoke("admin-logout")
}));
