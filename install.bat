@echo off
echo ========================================
echo  Installing LG Chatbot Dependencies
echo ========================================
echo.

REM Clean npm cache
echo Cleaning npm cache...
call npm cache clean --force

REM Remove existing node_modules
echo Removing old dependencies...
if exist "node_modules" rmdir /s /q node_modules
if exist "server\node_modules" rmdir /s /q server\node_modules

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
call npm install

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd server
call npm install
cd ..

REM Create environment files if they don't exist
if not exist "server\.env" (
    echo.
    echo Creating server\.env from template...
    copy server\.env.example server\.env
    echo.
    echo ============================================
    echo  IMPORTANT: Edit server\.env file and add
    echo  your Azure service keys before running!
    echo ============================================
)

if not exist ".env.local" (
    echo Creating .env.local from template...
    copy .env.example .env.local
)

REM Create logs directories
if not exist "logs" mkdir logs
if not exist "server\logs" mkdir server\logs

echo.
echo ========================================
echo  Installation Complete!
echo.
echo  Next steps:
echo  1. Edit server\.env with your Azure keys
echo  2. Run start.bat to start the services
echo ========================================
echo.
pause