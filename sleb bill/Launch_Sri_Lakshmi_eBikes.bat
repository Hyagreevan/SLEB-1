@echo off
title Sri Lakshmi e Bikes ERP Launcher
color 0B
cls
echo ====================================================================
echo             SRI LAKSHMI E BIKES - COMPLETE ERP PORTAL
echo ====================================================================
echo.
echo [1/2] Spinning up background Auto-Backup Server...
start /b node server.js
timeout /t 2 >nul
echo.
echo [2/2] Launching ERP Interface in your default browser...
start http://localhost:3000
echo.
echo ====================================================================
echo   ERP Port is active at: http://localhost:3000
echo   Auto-Backups will write to the 'backups/' directory.
echo.
echo   Keep this window open in the background to sustain backups!
echo   To close the server, close this window.
echo ====================================================================
echo.
pause
