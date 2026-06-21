@echo off
setlocal
set "XFROOT=%~dp0..\.."
set "SRC_DIR=%XFROOT%\firefox-src"
set "EXT_SRC=%XFROOT%\src\extensions\newtab"
set "EXT_DST=%SRC_DIR%\browser\extensions\xfbrowser-newtab"

if not exist "%SRC_DIR%" (
    echo Error: firefox-src not found at %SRC_DIR%
    echo Run sync.bat first.
    pause
    exit /b 1
)

echo Installing XFBrowser New Tab extension into Firefox source...

:: 创建目标目录
if not exist "%EXT_DST%\newtab" mkdir "%EXT_DST%\newtab"

:: 复制扩展文件
copy /Y "%EXT_SRC%\manifest.json" "%EXT_DST%\" >nul
copy /Y "%EXT_SRC%\index.html" "%EXT_DST%\newtab\" >nul
copy /Y "%EXT_SRC%\app.js" "%EXT_DST%\newtab\" >nul
copy /Y "%EXT_SRC%\style.css" "%EXT_DST%\newtab\" >nul
copy /Y "%EXT_SRC%\fluent-tokens.css" "%EXT_DST%\newtab\" >nul
copy /Y "%EXT_SRC%\fluent-theme.js" "%EXT_DST%\newtab\" >nul
copy /Y "%EXT_SRC%\fluent-utils.js" "%EXT_DST%\newtab\" >nul
echo Extension files copied.

:: 修改 browser/extensions/moz.build 添加目录引用
set "MOZBUILD=%SRC_DIR%\browser\extensions\moz.build"
if not exist "%MOZBUILD%" (
    echo Error: %MOZBUILD% not found!
    pause
    exit /b 1
)

:: 检查是否已经添加
findstr /C:"xfbrowser-newtab" "%MOZBUILD%" >nul
if %errorlevel% equ 0 (
    echo Extension already registered in moz.build, skipping.
) else (
    :: 在 DIRS 列表中添加 xfbrowser-newtab
    powershell -Command ^
        "$c = Get-Content '%MOZBUILD%'; " ^
        "$c = $c -replace '(?<=webcompat,''.*?\n.*?)(?='')', " ^
        "'webcompat',`n    'xfbrowser-newtab',"; " ^
        "Set-Content '%MOZBUILD%' -Value $c"
    if errorlevel 1 (
        echo Failed to modify moz.build! You may need to add manually.
        echo Add "'xfbrowser-newtab'," to the DIRS list in:
        echo   %MOZBUILD%
    ) else (
        echo Updated moz.build to include xfbrowser-newtab.
    )
)

echo.
echo Done! XFBrowser New Tab extension is now part of the Firefox build.
echo Run build.bat to compile, or use 'python mach build' for incremental build.
pause
