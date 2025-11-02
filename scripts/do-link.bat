@echo off
chcp 65001 >nul
echo ========================================
echo Linking plugin to Obsidian...
echo ========================================
echo.

set "SOURCE=%~dp0..\global-logger"
set "TARGET=C:\Users\Fancy\AppData\Roaming\obsidian\Obsidian Sandbox\.obsidian\plugins\obsidian-cursor-logger"

echo Source: %SOURCE%
echo Target: %TARGET%
echo.

REM Create plugins directory if not exists
if not exist "C:\Users\Fancy\AppData\Roaming\obsidian\Obsidian Sandbox\.obsidian\plugins" (
    echo Creating plugins directory...
    mkdir "C:\Users\Fancy\AppData\Roaming\obsidian\Obsidian Sandbox\.obsidian\plugins"
)

REM Remove existing plugin directory
if exist "%TARGET%" (
    echo Removing existing plugin...
    rmdir /s /q "%TARGET%"
)

REM Copy plugin files
echo Copying plugin files...
xcopy /E /I /Y /Q "%SOURCE%" "%TARGET%"

if errorlevel 1 (
    echo.
    echo [ERROR] Copy failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Plugin linked successfully!
echo ========================================
echo.
echo Files copied to:
echo %TARGET%
echo.
echo Next steps:
echo 1. Open Obsidian
echo 2. Go to Settings -^> Community plugins
echo 3. Turn off Safe mode if enabled
echo 4. Enable "Obsidian Cursor Logger"
echo.

REM Verify files
if exist "%TARGET%\manifest.json" (
    echo [OK] manifest.json found
) else (
    echo [WARNING] manifest.json not found
)

if exist "%TARGET%\main.js" (
    echo [OK] main.js found
) else (
    echo [WARNING] main.js not found
)

echo.
pause

