@echo off
title AgriFarm Project Launcher v2.0
color 0A

echo.
echo  ================================================
echo     AGRIFARM PROJECT LAUNCHER  v2.0
echo  ================================================
echo.

:: ── Step 1: Detect local IPv4 address ────────────────────────────
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and ($_.InterfaceAlias -like '*Wi-Fi*' -or $_.InterfaceAlias -like '*Ethernet*') }).IPAddress | Select-Object -First 1"') do set LOCAL_IP=%%i

if "%LOCAL_IP%"=="" (
    echo  [WARN] Could not auto-detect Wi-Fi/Ethernet IP. Trying fallback...
    for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' }).IPAddress | Select-Object -First 1"') do set LOCAL_IP=%%i
)

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=127.0.0.1
    echo  [WARN] Could not detect IP. Defaulting to 127.0.0.1 (emulator only).
)

echo  [INFO] Detected IP Address : %LOCAL_IP%
echo  [INFO] Backend will be at  : http://%LOCAL_IP%:3000
echo  [INFO] Admin Dashboard at  : http://localhost:5173
echo.

:: ── Step 2: Auto-update local.properties with detected IP ─────────
echo  [INFO] Updating local.properties with detected IP...
set PROPS_FILE=%~dp0local.properties

:: Read the file and replace the BASE_URL line
powershell -NoProfile -Command ^
  "(Get-Content '%PROPS_FILE%') -replace 'BASE_URL=.*', 'BASE_URL=http://%LOCAL_IP%:3000/api' | Set-Content '%PROPS_FILE%'"

echo  [OK]   local.properties updated: BASE_URL=http://%LOCAL_IP%:3000/api
echo.

:: ── Step 3: Auto-update admin-portal .env ──────────────────────────
set ADMIN_ENV=%~dp0admin-portal\.env
if not exist "%ADMIN_ENV%" (
    copy "%~dp0admin-portal\.env.example" "%ADMIN_ENV%" >nul
    echo  [INFO] Created admin-portal\.env from template.
)
powershell -NoProfile -Command ^
  "(Get-Content '%ADMIN_ENV%') -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://localhost:3000' | Set-Content '%ADMIN_ENV%'"
echo  [OK]   admin-portal\.env is set.
echo.

:: ── Step 4: Create backend .env if missing ─────────────────────────
set BACKEND_ENV=%~dp0backend-server\.env
if not exist "%BACKEND_ENV%" (
    copy "%~dp0backend-server\.env.example" "%BACKEND_ENV%" >nul
    echo  [INFO] Created backend-server\.env from template.
    echo  [WARN] Please review backend-server\.env and set your DB password if needed.
) else (
    echo  [OK]   backend-server\.env exists.
)
echo.

:: ── Step 5: Start backend server ──────────────────────────────────
echo  [1/2] Starting Node.js Backend Server on port 3000...
start "AgriFarm Backend (port 3000)" cmd /k "cd /d %~dp0backend-server && npm install --silent && echo. && echo [Backend] Starting AgriFarm API... && node server.js"
timeout /t 3 >nul

:: ── Step 6: Start admin portal ─────────────────────────────────────
echo  [2/2] Starting React Admin Dashboard on port 5173...
start "AgriFarm Admin Dashboard (port 5173)" cmd /k "cd /d %~dp0admin-portal && npm install --silent && echo. && echo [Admin] Starting AgriFarm Admin Portal... && npm run dev"
timeout /t 5 >nul

:: ── Step 7: Open browser ───────────────────────────────────────────
echo  Opening Admin Dashboard in browser...
start http://localhost:5173
echo.

:: ── Summary ────────────────────────────────────────────────────────
echo  ================================================
echo   LAUNCH COMPLETE!
echo  ================================================
echo.
echo   Backend API   : http://%LOCAL_IP%:3000
echo   Admin Portal  : http://localhost:5173
echo   Health Check  : http://localhost:3000/health
echo.
echo   For Android physical device:
echo     BASE_URL in local.properties = http://%LOCAL_IP%:3000/api
echo     (Already updated automatically above)
echo.
echo   [!] Keep both command windows open while using the project.
echo   [!] Your phone must be on the same Wi-Fi as this PC.
echo  ================================================
echo.
pause
