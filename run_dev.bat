@echo off

:: 1. Activate the Python virtual environment
call ".venv\Scripts\activate.bat"

:: 2. Check if Node.js/npm is installed on your computer
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed. Please install Node.js first.
    pause
    exit /b
)

:: 3. Check if node_modules folder is missing, install if needed
if not exist "node_modules\" (
    echo [INFO] node_modules folder not found. Installing dependencies...
    call npm install
)

:: 4. Start the development server
npm run dev
