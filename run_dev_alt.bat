@echo off
echo Starting PyReact Character Creator Development Server...

:: 1. Activate the Python virtual environment
echo [1/4] Activating Python virtual environment...
if exist ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
    echo Python virtual environment activated.
) else (
    echo [WARNING] Python virtual environment not found. Please run: python -m venv .venv
)

:: 2. Check if Node.js is installed
echo [2/4] Checking Node.js installation...
node --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
) else (
    echo Node.js is installed.
)

:: 3. Check if node_modules folder exists, install if needed
echo [3/4] Checking dependencies...
if not exist "node_modules\" (
    echo Installing Node.js dependencies...
    powershell -ExecutionPolicy Bypass -Command "& 'npm' install"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

:: 4. Start the development server
echo [4/4] Starting development server...
echo.
echo ==========================================
echo Starting concurrent servers:
echo - Frontend: http://127.0.0.1:5173
echo - Backend:  http://127.0.0.1:5000
echo - Electron: Will open automatically
echo ==========================================
echo.

powershell -ExecutionPolicy Bypass -Command "& 'npm' run dev"

pause