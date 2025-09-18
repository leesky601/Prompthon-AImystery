@echo off
echo ========================================
echo  Stopping LG Chatbot Services
echo ========================================
echo.

REM Stop all PM2 processes
echo Stopping all PM2 services...
call pm2 stop all

echo.
echo Services stopped.
echo.
call pm2 status

pause