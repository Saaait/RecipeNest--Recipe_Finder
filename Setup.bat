@echo off
title RecipeNest - Setup
color 0B

echo ========================================================
echo    RecipeNest - Initial Setup
echo ========================================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [OK] Node.js is installed

REM Check npm
echo.
echo [2/5] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
npm --version
echo [OK] npm is installed

REM Create frontend .env
echo.
echo [3/5] Creating environment files...
if not exist "frontend\.env" (
    echo VITE_API_BASE_URL=http://localhost:5001 > frontend\.env
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env already exists
)

REM Create backend .env
if not exist "backend-v2\.env" (
    (
        echo PORT=5001
        echo CONNECTION_STRING=your_mongodb_connection_string_here
        echo ACCESS_TOKEN_SECERT=your_jwt_secret
        echo MEALDB_BASE=https://www.themealdb.com/api/json/v1/1
    ) > backend-v2\.env
    echo [OK] Created backend-v2\.env
) else (
    echo [OK] backend-v2\.env already exists
)

REM Install backend dependencies
echo.
echo [4/5] Installing backend dependencies...
cd backend-v2
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

REM Install frontend dependencies
echo.
echo [5/5] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo ========================================================
echo    Setup Complete!
echo ========================================================
echo.
echo Next steps:
echo   1. Make sure MongoDB is running
echo      - Install from: https://www.mongodb.com/try/download/community
echo      - Start service: net start MongoDB
echo      - Or use MongoDB Compass
echo.
echo   2. Run the application:
echo      - Double-click start-dev.bat
echo      - Or run: start-dev.bat
echo.
echo ========================================================
echo.
pause
