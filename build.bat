@echo off
setlocal
set "SRC_DIR=%~dp0firefox-src"

if not exist "%SRC_DIR%" (
    echo Source not found! Run sync.bat first.
    pause
    exit /b 1
)

echo Building XFBrowser (Firefox x64 Release)...
cd /d "%SRC_DIR%"

if not exist "mozconfig" (
    echo Creating mozconfig...
    (
        echo ac_add_options --enable-application=browser
        echo export MOZILLA_OFFICIAL=1
        echo mk_add_options MOZ_OBJDIR=obj-x64-release
        echo ac_add_options --target=x86_64-pc-windows-msvc
        echo ac_add_options --disable-debug
        echo ac_add_options --enable-optimize
        echo ac_add_options --enable-official-branding
    ) > mozconfig
)

python mach build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

python mach package
if errorlevel 1 (
    echo Packaging failed!
    pause
    exit /b 1
)

echo.
echo Build complete! Output: %SRC_DIR%\obj-x64-release\dist\firefox
pause
