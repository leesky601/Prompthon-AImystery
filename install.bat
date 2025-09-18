@echo off
echo ========================================
echo  Installing LG Chatbot Dependencies
echo ========================================
echo.

REM Check Node.js version
echo Checking Node.js version...
node --version
echo.

REM Clean npm cache
echo Cleaning npm cache...
call npm cache clean --force
echo.

REM Remove existing node_modules and package-lock.json
echo Removing old dependencies...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json
if exist "server\node_modules" rmdir /s /q server\node_modules
if exist "server\package-lock.json" del server\package-lock.json
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
cd ..
echo.

REM Create .env files if they don't exist
if not exist "server\.env" (
    echo Creating server\.env from template...
    copy server\.env.example server\.env
    echo.
    echo IMPORTANT: Please edit server\.env with your Azure credentials!
)

if not exist ".env.local" (
    echo Creating .env.local from template...
    copy .env.example .env.local
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit server\.env with your Azure credentials
echo 2. Run start.bat to start the services
echo.
pause