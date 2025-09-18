@echo off
echo ========================================
echo  Checking Dependencies Status
echo ========================================
echo.

echo Frontend Dependencies:
echo ----------------------
if exist "node_modules" (
    echo [OK] node_modules folder exists
    dir node_modules | find /c /v ""
    echo packages installed
) else (
    echo [ERROR] node_modules folder not found
)
echo.

echo Backend Dependencies:
echo ---------------------
if exist "server\node_modules" (
    echo [OK] server\node_modules folder exists
    dir server\node_modules | find /c /v ""
    echo packages installed
) else (
    echo [ERROR] server\node_modules folder not found
)
echo.

echo Required npm packages in backend:
cd server
call npm list openai 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] openai package installed
) else (
    echo [ERROR] openai package NOT installed
)

call npm list @azure/search-documents 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] @azure/search-documents installed
) else (
    echo [ERROR] @azure/search-documents NOT installed
)

call npm list express 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] express package installed
) else (
    echo [ERROR] express package NOT installed
)
cd ..

echo.
echo ========================================
echo If any packages are missing, run:
echo   install.bat
echo ========================================
echo.
pause