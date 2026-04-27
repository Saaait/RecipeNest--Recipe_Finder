@echo off
SETLOCAL
echo ===============================================
echo Starting RecipeNest (Development Mode)
echo ===============================================
echo.
echo.

REM check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Please install from https://nodejs.org/ and rerun.
    pause
    exit /b 1
)
echo Node.js detected.

emport check using netstat
echo Checking ports 5001 and 5173...
netstat -ano | findstr ":5001" >nul
if %ERRORLEVEL% equ 0 (
    echo Warning: port 5001 appears in use.
)
netstat -ano | findstr ":5173" >nul
if %ERRORLEVEL% equ 0 (
    echo Warning: port 5173 appears in use.
)
echo.

REM === Check and Install Dependencies ===
echo Checking dependencies...
if not exist "backend-v2\node_modules" (
    echo Installing backend dependencies...
    cd backend-v2
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM === Check/Create .env files ===
echo.
echo Checking environment files...
if not exist "frontend\.env" (
    echo Creating frontend\.env...
    echo VITE_API_BASE_URL=http://localhost:5001 > frontend\.env
    echo Created frontend\.env!
)

if not exist "backend-v2\.env" (
    echo Creating backend-v2\.env...
    (
        echo PORT=5001
        echo CONNECTION_STRING=your_mongodb_connection_string_here
        echo ACCESS_TOKEN_SECERT=your_jwt_secret
        echo REFRESH_TOKEN_SECRET=your_refresh_token_secret
        echo MEALDB_BASE=https://www.themealdb.com/api/json/v1/1
    ) > backend-v2\.env
    echo Created backend-v2\.env!
)

echo Environment files OK!

REM === Start Backend ===
echo.
echo Starting Backend Server...
echo Database: MongoDB Atlas
cd backend-v2
start "RecipeNest Backend" cmd /k "npm run dev"
cd ..

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM === Start Frontend ===
echo.
echo Starting Frontend Server...
cd frontend
start "RecipeNest Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ===============================================
echo RecipeNest is running!
echo ===============================================
echo.
echo Access URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5001
echo   Database: MongoDB Atlas
echo.
echo Both servers are running in separate windows
echo Close those windows to stop the servers
echo.
pause
