@echo off
echo Installing Python backend dependencies...

:: Activate virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call ".venv\Scripts\activate.bat"
    
    :: Install backend dependencies
    echo Installing Flask and other dependencies...
    pip install -r backend\requirements.txt
    
    echo.
    echo Backend dependencies installed successfully!
    echo You can now run: run_dev.bat
) else (
    echo ERROR: Virtual environment not found at .venv
    echo Please create it first with: python -m venv .venv
)

pause