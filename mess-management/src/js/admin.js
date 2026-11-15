document.addEventListener("DOMContentLoaded", async () => {
  const usersTable = document.getElementById("usersTable");
  const feedbackTable = document.getElementById("feedbackTable");
  const userCount = document.getElementById("userCount");
  const feedbackCount = document.getElementById("feedbackCount");

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || currentUser.role !== "admin") {
    window.location.replace("login.html");
    return;
  }

  try {
    const [summary, feedbackResult] = await Promise.all([
      window.messAPI.getAdminSummary(),
      window.messAPI.getAdminFeedback()
    ]);

    if (!summary?.success) throw new Error(summary?.message || "Unable to load admin data.");

    const users = summary.students || [];
    const feedback = feedbackResult?.feedback || [];
    if (userCount) userCount.textContent = summary.total ?? users.length;
    if (feedbackCount) feedbackCount.textContent = feedback.length;

    if (usersTable) usersTable.innerHTML = users.length ? users.map(user => `
      <tr><td>${escapeHTML(user.name)}</td><td>${escapeHTML(user.username)}</td>
      <td>${escapeHTML(user.hostel)}</td><td>Student</td></tr>`).join("")
      : '<tr><td colspan="4">No students registered.</td></tr>';

    if (feedbackTable) feedbackTable.innerHTML = feedback.length ? feedback.slice(0, 20).map(item => `
      <tr><td>${escapeHTML(item.rating)}/5</td>
      <td>${escapeHTML(item.message || item.category || "")}</td>
      <td>${escapeHTML(item.date ? new Date(item.date).toLocaleString() : "")}</td></tr>`).join("")
      : '<tr><td colspan="3">No feedback submitted.</td></tr>';
  } catch (error) {
    console.error("Admin dashboard error:", error);
    if (usersTable) usersTable.innerHTML = `<tr><td colspan="4">${escapeHTML(error.message)}</td></tr>`;
  }
});

function logoutAdmin() {
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("messUser");
  if (window.messAPI?.adminLogout) window.messAPI.adminLogout();
}
