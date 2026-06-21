@echo off
setlocal DISABLEDELAYEDEXPANSION
set "XFBROOT=%~dp0"
set "SRC_DIR=%XFBROOT%firefox-src"
set "FIREFOX_REPO=https://github.com/mozilla/gecko.git"

if not exist "%SRC_DIR%" (
    echo Cloning mozilla-central (git mirror)...
    git clone --depth 1 "%FIREFOX_REPO%" "%SRC_DIR%"
    if errorlevel 1 (
        echo Clone failed!
        pause
        exit /b 1
    )
)

echo Running mach bootstrap for Windows x64...
cd /d "%SRC_DIR%"
python mach bootstrap --application-choice=browser --no-system-changes 2>nul

echo.
echo Sync complete! Run build.bat to compile.
pause
