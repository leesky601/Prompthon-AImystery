@echo off
echo ========================================
echo  Restarting LG Chatbot Services
echo ========================================
echo.

REM Restart all PM2 processes
echo Restarting all PM2 services...
call pm2 restart all

echo.
echo Services restarted.
echo.
call pm2 status

echo.
echo ========================================
echo  Access the application at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:4000
echo ========================================

pause