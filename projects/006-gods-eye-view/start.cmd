@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\run.ps1" -OpenBrowser
if errorlevel 1 pause
