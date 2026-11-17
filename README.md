# How to Quack Quack

Static educational site (Persian, RTL) for the Molecular Docking Fundamentals module. No internet needed.

## Run on Windows
1. Double-click `start.bat` (uses PowerShell, already included in Windows 10/11; nothing to install). Your browser opens at http://localhost:8765/
2. To stop: close the black window (or press Ctrl+C).
3. Always use this address. A different address/port or browser has its own separate data.

Opening `index.html` directly (file://) is not supported because browsers block loading the lesson files.

## Your data
Notes, highlights, progress, quiz scores and theme live in your browser's IndexedDB for that address. Clearing browser data erases them.
Backup: Home page -> "Download backup (JSON)". Restore: Home page -> "Restore from backup". Use this to move data between the local version and GitHub Pages (they are NOT synced automatically).

## GitHub Pages
Upload the whole folder to a repository and enable Pages (branch root). All paths are relative; no build step.

## Edit lessons
Lessons are the 12 Markdown files in `content/module-0/` (order set by `manifest.json`). Edit and refresh.

## Third-party (stored locally in assets/): markdown-it, KaTeX, MiniSearch (MIT); Vazirmatn, Inter, JetBrains Mono (SIL OFL).
