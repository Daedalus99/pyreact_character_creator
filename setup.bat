@echo off
echo PyReact Character Creator - Setup Script
echo ========================================

echo.
echo [1/4] Creating Python virtual environment...
if not exist ".venv\" (
    python -m venv .venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

echo.
echo [2/4] Activating virtual environment and installing Python dependencies...
call ".venv\Scripts\activate.bat"
pip install flask flask-cors requests

echo.
echo [3/4] Installing Node.js dependencies...
powershell -ExecutionPolicy Bypass -Command "& 'npm' install"

echo.
echo [4/4] Setup complete!
echo.
echo To start development:
echo 1. Run: run_dev_alt.bat  (or run_dev.bat if npm works normally)
echo 2. Or run individual commands:
echo    - Backend: python backend/app.py
echo    - Frontend: npm run dev:frontend
echo    - Electron: npm run dev:electron

pause