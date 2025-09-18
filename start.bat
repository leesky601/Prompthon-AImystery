@echo off
echo ========================================
echo  LG Chatbot Service Startup (Windows)
echo ========================================
echo.

REM Check if .env files exist
if not exist "server\.env" (
    echo Warning: server\.env not found. Copying from .env.example...
    copy server\.env.example server\.env
    echo Please edit server\.env with your Azure credentials
)

if not exist ".env.local" (
    echo Warning: .env.local not found. Copying from .env.example...
    copy .env.example .env.local
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs
if not exist "server\logs" mkdir server\logs

REM Install dependencies
echo.
echo Installing frontend dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd server
call npm install
cd ..

REM Check if PM2 is installed globally
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installing PM2 globally...
    call npm install -g pm2
    call npm install -g pm2-windows-startup
    echo PM2 installed. You may need to restart your command prompt.
)

REM Start services with PM2
echo.
echo Starting services with PM2...
call pm2 start ecosystem.config.js

REM Display service status
echo.
echo ========================================
echo  Services started successfully!
echo ========================================
echo.
call pm2 status

echo.
echo ========================================
echo  Access the application at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:4000
echo ========================================
echo.
echo To view logs, use:
echo    pm2 logs
echo.
echo To stop services, use:
echo    pm2 stop all
echo.
echo To restart services, use:
echo    pm2 restart all
echo.
pause