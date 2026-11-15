# Web deployment notes

This project now includes an Express web server for Render. The existing HTML pages and styles are served from src/.

Before deploying, the GitHub extraction workflow must be run so the original project files are present under mess-management/. The workflow should then be followed by committing the web server files.

The current application data layer is the included mess-database.json JSON file. Render's default filesystem is ephemeral, so student accounts, feedback, and menu changes may be lost after a redeploy or instance replacement. Configure a persistent disk or migrate the data layer to PostgreSQL before using this for real student records. Do not use the included sample accounts as production credentials.
