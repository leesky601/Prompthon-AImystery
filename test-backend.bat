@echo off
echo ========================================
echo  Testing Backend Server Connection
echo ========================================
echo.

cd server

REM Check if .env exists
if not exist ".env" (
    echo ERROR: server\.env file not found!
    echo Please copy server\.env.example to server\.env and add your Azure keys.
    pause
    exit /b 1
)

REM Check Node.js version
echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo.
)

REM Test the server
echo Starting backend server for testing...
echo.
echo The server should start on http://localhost:4000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node src/index.js

cd ..
pause