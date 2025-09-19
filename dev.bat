@echo off
echo ========================================
echo  LG Chatbot Development Mode (Windows)
echo ========================================
echo.
echo This will open two terminals:
echo   1. Backend API Server (Port 4000)
echo   2. Frontend Dev Server (Port 3000)
echo.
echo Press Ctrl+C in each terminal to stop.
echo ========================================
echo.

REM Check if .env files exist
if not exist "server\.env" (
    echo Warning: server\.env not found. Copying from .env.example...
    copy server\.env.example server\.env
    echo Please edit server\.env with your Azure credentials before continuing.
    pause
)

if not exist ".env.local" (
    echo Warning: .env.local not found. Copying from .env.example...
    copy .env.example .env.local
)

REM Open Backend in new terminal
echo Starting Backend API Server...
start "LG Chatbot Backend" cmd /k "cd server && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Open Frontend in new terminal
echo Starting Frontend Dev Server...
start "LG Chatbot Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  Development servers are starting...
echo.
echo  Backend API: http://localhost:4000
echo  Frontend: http://localhost:3000
echo.
echo  Both services are running in separate windows.
echo  Close those windows to stop the services.
echo ========================================
echo.
pause