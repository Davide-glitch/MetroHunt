@echo off
echo ========================================================
echo   Starting Metro Hunt: Full-Stack Tycoon Simulation
echo ========================================================

echo 1. Starting ASP.NET Core Web API Backend on port 5000...
start "MetroHunt.Server" cmd /k "cd MetroHunt.Server && dotnet run --no-build --urls http://localhost:5000"

timeout /t 3 >nul

echo 2. Starting React + Vite Frontend on port 5173...
start "MetroHunt.Client" cmd /k "cd client && npm run dev"

echo ========================================================
echo   Metro Hunt is launching!
echo   Frontend: http://localhost:5173
echo   Swagger:  http://localhost:5000/swagger
echo   SignalR:  http://localhost:5000/hubs/game
echo ========================================================
