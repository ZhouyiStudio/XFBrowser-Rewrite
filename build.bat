@echo off
setlocal enabledelayedexpansion
title XFBrowser Build Script

set "XFBROOT=%~dp0"
set "SRC_DIR=%XFBROOT%chromium-src"
set "DEPOT_DIR=%SRC_DIR%\third_party\depot_tools"
set "OUT_DIR=%SRC_DIR%\out\x64_Release_XFBrowser"

echo.
echo ========================================
echo   XFBrowser Build Engine
echo   Target: x64 Release
echo   Platform: Windows 10/11
echo ========================================
echo.

if not exist "%SRC_DIR%" (
    echo [ERROR] Chromium source not found!
    echo Run sync.bat first to download source.
    pause
    exit /b 1
)

set "PYTHON_CMD="
where python3 >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python3"
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    ) else (
        echo [ERROR] Python 3.8+ not found.
        pause
        exit /b 1
    )
)

echo [INFO] Using Python: !PYTHON_CMD!

if exist "%DEPOT_DIR%" (
    set "PATH=%DEPOT_DIR%;%PATH%"
    set "DEPOT_TOOLS_WIN_TOOLCHAIN=0"
    set "GYP_MSVS_OVERRIDE_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community"
)

echo [Step 1/3] Generating GN build config...

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

(
    echo target_os = "win"
    echo target_cpu = "x64"
    echo is_debug = false
    echo is_official_build = true
    echo is_component_build = false
    echo symbol_level = 0
    echo blink_symbol_level = 0
    echo v8_symbol_level = 0
    echo enable_nacl = false
    echo enable_remoting = false
    echo enable_hangout_services_extension = false
    echo enable_reading_list = false
    echo enable_widevine = false
    echo enable_media_remoting = false
    echo enable_plugin_install = false
    echo enable_reporting = false
    echo enable_service_discovery = false
    echo enable_vr = false
    echo enable_webvr = false
    echo enable_webxr = false
    echo enable_wifi_display = false
    echo disable_ftp_support = true
    echo disable_fieldtrial_config = true
    echo exclude_unwind_tables = true
    echo google_api_key = ""
    echo google_default_client_id = ""
    echo google_default_client_secret = ""
    echo treat_warnings_as_errors = false
    echo use_goma = false
    echo use_jumbo_build = true
    echo use_sysroot = false
    echo use_thin_lto = true
    echo optimize_for_size = true
    echo clang_use_chrome_plugins = false
    echo fieldtrial_testing_like_official = true
    echo enable_extensions = true
    echo disable_google_now = true
    echo enable_doj_standalone = false
    echo disable_gaia_services = true
    echo disable_dashboard = true
) > "%OUT_DIR%\args.gn"

echo [INFO] GN args written to: %OUT_DIR%\args.gn

echo [Step 2/3] Running GN to generate Ninja files...

cd /d "%SRC_DIR%"
gn gen "%OUT_DIR%" --fail-on-unused-args

if errorlevel 1 (
    echo [ERROR] GN generation failed!
    pause
    exit /b 1
)

echo [Step 3/3] Building XFBrowser...
echo Target: x64 Release
echo Output: %OUT_DIR%
echo.

set "NINJA_JOBS=%NUMBER_OF_PROCESSORS%"
echo Using %NINJA_JOBS% parallel jobs...

ninja -C "%OUT_DIR%" -j%NINJA_JOBS% chrome

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   XFBrowser Build Successful!
echo   Binary: %OUT_DIR%\chrome.exe
echo ========================================
echo.

pause