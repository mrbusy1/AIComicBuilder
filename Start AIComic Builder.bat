@echo off
chcp 65001 >nul
title AIComic Builder Studio - Unlimited Edition
cd /d "%~dp0"

echo.
echo   ============================================================
echo    AIComic Builder Studio  -  Unlimited Edition  v2.0.0
echo    Design and Developed by Mr.Busy
echo   ============================================================
echo.

REM ---- Preferred: standalone portable build (no Node/npm needed) ----
if exist "dist\AIComic Builder Studio\AIComic Builder Studio.exe" (
  echo   Starting standalone desktop application...
  start "" "dist\AIComic Builder Studio\AIComic Builder Studio.exe"
  exit /b 0
)

REM ---- Second choice: real Electron desktop window from source ----
if exist "node_modules\electron\dist\electron.exe" (
  echo   Starting Electron desktop application...
  start "" "node_modules\electron\dist\electron.exe" .
  exit /b 0
)

REM ---- Fallback: Edge / Chrome app-mode window (no browser chrome) ----
set "APP=%~dp0index.html"
set "APPURL=%APP:\=/%"
set "APPURL=%APPURL: =%%20%%"
set "URL=file:///%APPURL%"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME2=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE%" (
  echo   Starting desktop window with Microsoft Edge...
  start "" "%EDGE%" --app="%URL%" --window-size=1560,980 --allow-file-access-from-files
  exit /b 0
)
if exist "%EDGE2%" (
  start "" "%EDGE2%" --app="%URL%" --window-size=1560,980 --allow-file-access-from-files
  exit /b 0
)
if exist "%CHROME%" (
  echo   Starting desktop window with Google Chrome...
  start "" "%CHROME%" --app="%URL%" --window-size=1560,980 --allow-file-access-from-files
  exit /b 0
)
if exist "%CHROME2%" (
  start "" "%CHROME2%" --app="%URL%" --window-size=1560,980 --allow-file-access-from-files
  exit /b 0
)

echo   No compatible browser found. Opening index.html with the default handler...
start "" "%APP%"
exit /b 0
