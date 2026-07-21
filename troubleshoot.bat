@echo off
echo PyReact Character Creator - Troubleshooting Script
echo ================================================

echo.
echo [1] Checking Node.js installation...
node --version
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found
) else (
    echo [OK] Node.js found
)

echo.
echo [2] Checking npm...
powershell -ExecutionPolicy Bypass -Command "& 'npm' --version"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm not accessible
) else (
    echo [OK] npm accessible
)

echo.
echo [3] Checking Python...
python --version
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found
) else (
    echo [OK] Python found
)

echo.
echo [4] Checking virtual environment...
if exist ".venv\Scripts\python.exe" (
    echo [OK] Virtual environment exists
) else (
    echo [WARNING] Virtual environment not found
    echo Run: python -m venv .venv
)

echo.
echo [5] Checking package.json...
if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json not found
)

echo.
echo [6] Checking node_modules...
if exist "node_modules\" (
    echo [OK] node_modules exists
) else (
    echo [WARNING] node_modules not found - dependencies need to be installed
)

echo.
echo [7] Checking backend files...
if exist "backend\app.py" (
    echo [OK] Backend app.py found
) else (
    echo [ERROR] Backend app.py not found
)

echo.
echo [8] Testing Python virtual environment activation...
if exist ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
    echo [OK] Virtual environment activated
    python -c "import flask" 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Flask not installed in virtual environment
        echo Run: pip install flask flask-cors requests
    ) else (
        echo [OK] Flask available
    )
) else (
    echo [WARNING] Cannot activate virtual environment
)

echo.
echo [9] Checking for syntax errors in new files...
if exist "src\components\tabs\SettingsPage.jsx" (
    echo [OK] SettingsPage.jsx exists
) else (
    echo [ERROR] SettingsPage.jsx missing
)

if exist "src\components\forms\ImageGenerationSettings.jsx" (
    echo [OK] ImageGenerationSettings.jsx exists
) else (
    echo [ERROR] ImageGenerationSettings.jsx missing
)

echo.
echo ================================================
echo Troubleshooting complete. 
echo.
echo If you see any [ERROR] or [WARNING] messages above,
echo those need to be fixed before running the dev server.
echo.

pause