# Campus Mess Management System

## Requirements
- Node.js 20 or newer
- npm

## Run
1. Extract this folder.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.

## Utility scripts
- `npm run check` checks the main Electron JavaScript files for syntax errors.
- `npm run init-menu` adds the default weekly menu and snacks without duplicating existing entries.
- `node reset-students.js` removes student records while preserving admin accounts and menu data. It creates a backup first. Review the script and back up your data before running it.

## Data and backups
Application data is stored in `mess-database.json`. Keep a separate copy of this file before making manual changes. Files in `backups/` are historical snapshots and are not loaded automatically.

## Notes
The Electron preload exposes a limited `window.messAPI` interface and the renderer runs with context isolation enabled. The app requires the included `src/` pages and `src/css/style.css`.
