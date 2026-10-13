@echo off
echo ========================================================
echo   Starting Metro Hunt: Full-Stack Tycoon Simulation
echo ========================================================

echo 1. Starting ASP.NET Core Web API Backend on port 5000...
powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5000/api/game/session' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { } ; exit 1" >nul 2>&1
if errorlevel 1 (
    taskkill /F /IM "MetroHunt.Api.exe" >nul 2>&1
    start "MetroHunt.Server" cmd /k "cd MetroHunt.Server && dotnet run --urls http://localhost:5000"
) else (
    echo Metro Hunt API is already responding on port 5000; reusing it.
)

powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1

if not exist "client\node_modules\" (
    echo First-time run detected: Installing frontend dependencies...
    cmd /c "cd client && npm install"
)

echo 2. Starting React + Vite Frontend on port 5173...
powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5173/' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { } ; exit 1" >nul 2>&1
if errorlevel 1 (
    start "MetroHunt.Client" cmd /k "cd client && npm run dev"
) else (
    echo Frontend is already running on port 5173; reusing it.
)

echo ========================================================
echo   Metro Hunt is launching!
echo   Frontend: http://localhost:5173
echo   Swagger:  http://localhost:5000/swagger
echo   SignalR:  http://localhost:5000/hubs/game
echo ========================================================
