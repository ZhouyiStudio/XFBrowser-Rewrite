@echo off
setlocal DISABLEDELAYEDEXPANSION
title XFBrowser Sync Script v1.0

set "XFBROOT=%~dp0"
set "SRC_DIR=%XFBROOT%chromium-src"
set "CHROMIUM_VER=128.0.6613.84"
set "TUNA_URL=https://mirrors.tuna.tsinghua.edu.cn/git/chromium.git"
set "GITHUB_UG=https://github.com/ungoogled-software/ungoogled-chromium.git"
set "PATCH_DIR=%XFBROOT%patches"
set "RESUME_FILE=%SRC_DIR%\.sync_resume"

echo.
echo ========================================
echo   XFBrowser Source Sync Engine
echo   Mirror: TUNA (China)
echo   Version: %CHROMIUM_VER%
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Install from: https://git-scm.com/download/win
    pause
    exit /b 1
)

set "RESUME_STEP="
if exist "%RESUME_FILE%" (
    echo [INFO] Resume file found.
    for /f "usebackq delims=" %%r in ("%RESUME_FILE%") do set "RESUME_STEP=%%r"
    echo [INFO] Resume point: %RESUME_STEP%
)

if not exist "%SRC_DIR%" (
    echo [Step 1/5] Cloning Chromium from TUNA mirror...
    echo.
    git clone --no-checkout --depth 1 --branch "%CHROMIUM_VER%" "%TUNA_URL%" "%SRC_DIR%"
    if errorlevel 1 (
        echo [ERROR] Clone failed!
        echo STEP1_CLONE > "%RESUME_FILE%"
        echo [INFO] Run sync.bat again to resume.
        pause
        exit /b 1
    )
    echo STEP2_SPARSE > "%RESUME_FILE%"
) else (
    echo [Step 1/5] Source directory exists, skipping.
)

cd /d "%SRC_DIR%"

if not exist ".git\info\sparse-checkout" (
    echo [Step 2/5] Configuring sparse checkout...
    git sparse-checkout init --cone 2>nul
    copy "%XFBROOT%config\sparse-checkout" ".git\info\sparse-checkout" /y >nul
    echo [Step 2/5] Running sparse checkout...
    git read-tree -mu HEAD
    if errorlevel 1 (
        echo [ERROR] Sparse checkout failed.
        pause
        exit /b 1
    )
    echo STEP3_PATCHES > "%RESUME_FILE%"
) else (
    echo [Step 2/5] Sparse checkout already configured.
)

echo [Step 3/5] Applying patches...

set "UGP_DIR=%SRC_DIR%\ungoogled-patches"
if not exist "%UGP_DIR%" (
    git clone --depth 1 "%GITHUB_UG%" "%UGP_DIR%"
    if exist "%UGP_DIR%\patches" (
        echo [INFO] Applying ungoogled-chromium patches...
        for /r "%UGP_DIR%\patches" %%f in (*.patch) do (
            echo    %%f
            git apply --ignore-whitespace "%%f" 2>nul
        )
    )
    echo [INFO] Applying XFBrowser custom patches...
    if exist "%PATCH_DIR%\ungoogled-chromium" (
        for /r "%PATCH_DIR%\ungoogled-chromium" %%f in (*.patch) do (
            echo    [ungoogled] %%~nxf
            git apply --ignore-whitespace "%%f" 2>nul
        )
    )
    if exist "%PATCH_DIR%\fluent-ui" (
        for /r "%PATCH_DIR%\fluent-ui" %%f in (*.patch) do (
            echo    [fluent-ui] %%~nxf
            git apply --ignore-whitespace "%%f" 2>nul
        )
    )
    if exist "%PATCH_DIR%\privacy" (
        for /r "%PATCH_DIR%\privacy" %%f in (*.patch) do (
            echo    [privacy] %%~nxf
            git apply --ignore-whitespace "%%f" 2>nul
        )
    )
    echo STEP4_DEPS > "%RESUME_FILE%"
) else (
    echo [Step 3/5] Patches already applied.
)

echo [Step 4/5] Syncing build dependencies...
cd /d "%SRC_DIR%"
if not exist "third_party\depot_tools" (
    echo [INFO] Cloning depot_tools from TUNA...
    git clone --depth 1 "https://mirrors.tuna.tsinghua.edu.cn/git/depot_tools.git" "third_party\depot_tools"
)
echo STEP5_DONE > "%RESUME_FILE%"

echo.
echo [Step 5/5] Sync complete.

set "PSFILE=%TEMP%\xf-size.ps1"
> "%PSFILE%" echo $s=(Get-ChildItem -Recurse -LiteralPath \"%SRC_DIR%\" -Force ^| Measure-Object -Property Length -Sum).Sum; Write-Host ([math]::Round($s/1GB,2))
powershell -NoProfile -ExecutionPolicy Bypass -File "%PSFILE%"
del "%PSFILE%" 2>nul

echo.
echo ========================================
echo   XFBrowser Sync Complete!
echo   Source: %SRC_DIR%
echo   Version: %CHROMIUM_VER%
echo ========================================
echo.
echo Next: run build.bat to compile
echo.

del "%RESUME_FILE%" 2>nul
pause
