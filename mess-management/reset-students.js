
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "mess-database.json");
const BACKUP_FILE = path.join(
    __dirname,
    "mess-database-backup-before-reset.json"
);

function resetStudents() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            console.error("ERROR: mess-database.json not found.");
            return;
        }

        // Read existing database.
        const db = JSON.parse(
            fs.readFileSync(DB_FILE, "utf8")
        );

        // Keep a backup before making changes.
        if (!fs.existsSync(BACKUP_FILE)) {
            fs.copyFileSync(DB_FILE, BACKUP_FILE);
            console.log("Database backup created.");
        } else {
            console.log("Existing backup preserved.");
        }

        // Count students before deletion.
        const students = (db.users || []).filter(
            user => user.role === "student"
        );

        const studentIds = new Set(
            students.map(student => String(student.id))
        );

        const studentUsernames = new Set(
            students
                .map(student => student.username)
                .filter(Boolean)
        );

        const studentNames = new Set(
            students
                .map(student => student.name)
                .filter(Boolean)
        );

        // Delete ONLY student accounts.
        // Admin users remain untouched.
        db.users = (db.users || []).filter(
            user => user.role !== "student"
        );

        // Remove feedback belonging to deleted students.
        db.feedback = (db.feedback || []).filter(item => {
            return !(
                studentIds.has(String(item.studentId)) ||
                studentUsernames.has(item.username) ||
                studentNames.has(item.name)
            );
        });

        // Remove away requests belonging to deleted students.
        db.awayRequests = (db.awayRequests || []).filter(item => {
            return !(
                studentIds.has(String(item.studentId)) ||
                studentUsernames.has(item.username)
            );
        });

        // Remove meal registrations belonging to deleted students.
        db.mealRegistrations = (db.mealRegistrations || []).filter(item => {
            return !(
                studentIds.has(String(item.studentId)) ||
                studentIds.has(String(item.userId)) ||
                studentUsernames.has(item.username)
            );
        });

        // Verify that admin records are still present.
        const remainingAdmins = (db.users || []).filter(
            user => user.role === "admin"
        );

        const adminAccounts = db.admins || [];

        if (
            remainingAdmins.length === 0 &&
            adminAccounts.length === 0
        ) {
            console.error("ERROR: No admin accounts found. Database not saved.");
            return;
        }

        // Save the updated database.
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(db, null, 2),
            "utf8"
        );

        console.log("");
        console.log("================================");
        console.log(" STUDENT RESET COMPLETED");
        console.log("================================");
        console.log("Deleted student accounts:", students.length);
        console.log("Remaining student accounts:",
            db.users.filter(user => user.role === "student").length);
        console.log("Admin users preserved:", remainingAdmins.length);
        console.log("Admin accounts preserved:", adminAccounts.length);
        console.log("Weekly menu preserved:", (db.menu || []).length);
        console.log("Menu entries preserved.");
        console.log("Announcements preserved.");
        console.log("Backup file:", BACKUP_FILE);
        console.log("================================");

    } catch (error) {
        console.error("RESET ERROR:", error.message);
    }
}

resetStudents();