@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Metro Hunt - First-Time Automated Setup Wizard
echo ========================================================
echo.

:: 1. Check .NET SDK
echo [1/4] Checking .NET SDK installation...
where dotnet >nul 2>&1
if errorlevel 1 (
    echo [ERROR] .NET SDK is not installed or not in your PATH.
    echo Please download and install .NET 9 SDK from:
    echo https://dotnet.microsoft.com/download/dotnet/9.0
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('dotnet --version') do set DOTNET_VER=%%v
echo       Found .NET SDK version: !DOTNET_VER!
echo.

:: 2. Check Node.js and npm
echo [2/4] Checking Node.js and npm installation...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js (v18+) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo       Found Node.js !NODE_VER! and npm !NPM_VER!
echo.

:: 3. Database Container Check (Docker)
echo [3/4] Checking Database Services...
where docker >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker not detected in PATH.
    echo If you have a local SQL Server running on port 1433, Metro Hunt will connect to it.
    echo Otherwise, please install Docker Desktop: https://www.docker.com/products/docker-desktop/
) else (
    echo       Starting SQL Server 2022 container via Docker Compose...
    docker compose up -d
    if errorlevel 1 (
        echo [WARNING] Could not start Docker container. Ensure Docker Desktop is running.
    ) else (
        echo       SQL Server container is running on port 1433.
        echo       Waiting 5 seconds for SQL Server initialization...
        timeout /t 5 >nul
    )
)
echo.

:: 4. Install Dependencies & Build
echo [4/4] Restoring and installing project dependencies...

echo       - Restoring .NET Backend dependencies...
cd /d "%~dp0MetroHunt.Server"
dotnet restore
if errorlevel 1 (
    echo [ERROR] Failed to restore .NET packages.
    cd /d "%~dp0"
    pause
    exit /b 1
)

echo       - Building .NET Backend...
dotnet build --no-restore
if errorlevel 1 (
    echo [ERROR] Failed to compile .NET project.
    cd /d "%~dp0"
    pause
    exit /b 1
)
cd /d "%~dp0"

echo       - Installing React Frontend npm packages...
cd /d "%~dp0client"
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install npm packages.
    cd /d "%~dp0"
    pause
    exit /b 1
)
cd /d "%~dp0"

echo.
echo ========================================================
echo   Setup Complete! Everything is ready.
echo.
echo   To launch Metro Hunt, run:
echo     start.bat
echo ========================================================
echo.

set /p RUN_NOW="Would you like to start Metro Hunt right now? (Y/N): "
if /i "!RUN_NOW!"=="Y" (
    call "%~dp0start.bat"
)

endlocal
