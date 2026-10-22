@echo off
setlocal
cd /d "%~dp0app"
if exist "D:\software\nodejs\node.exe" set "PATH=D:\software\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js and try again.
  pause
  exit /b 1
)
if not exist "node_modules\remotion\package.json" (
  echo Dependencies are missing. Run npm ci in the app folder first.
  pause
  exit /b 1
)
echo Cel Story Studio: http://127.0.0.1:8048/
echo Keep this window open while using the workbench.
node server.mjs
pause
