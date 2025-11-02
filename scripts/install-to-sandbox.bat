@echo off
REM 安装插件到 Obsidian Sandbox
REM 作者: LINYF510
REM 日期: 2025-11-02

echo ========================================
echo 安装 Obsidian Logger 到 Sandbox
echo ========================================
echo.

REM 设置变量
set "SOURCE_DIR=%~dp0..\global-logger"
set "TARGET_DIR=%APPDATA%\obsidian\Obsidian Sandbox\.obsidian\plugins\obsidian-logger"

echo 源目录: %SOURCE_DIR%
echo 目标目录: %TARGET_DIR%
echo.

REM 检查源文件是否存在
if not exist "%SOURCE_DIR%\main.js" (
    echo [错误] 找不到 main.js，请先运行 npm run build
    pause
    exit /b 1
)

if not exist "%SOURCE_DIR%\manifest.json" (
    echo [错误] 找不到 manifest.json
    pause
    exit /b 1
)

REM 创建目标目录
echo [1/3] 创建插件目录...
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
    if errorlevel 1 (
        echo [错误] 无法创建目录，请检查权限
        pause
        exit /b 1
    )
    echo     目录创建成功
) else (
    echo     目录已存在
)

REM 复制文件
echo [2/3] 复制插件文件...
copy /Y "%SOURCE_DIR%\main.js" "%TARGET_DIR%\main.js" >nul
if errorlevel 1 (
    echo [错误] 复制 main.js 失败
    pause
    exit /b 1
)
echo     main.js 复制成功

copy /Y "%SOURCE_DIR%\manifest.json" "%TARGET_DIR%\manifest.json" >nul
if errorlevel 1 (
    echo [错误] 复制 manifest.json 失败
    pause
    exit /b 1
)
echo     manifest.json 复制成功

REM 复制 styles.css（如果存在）
if exist "%SOURCE_DIR%\styles.css" (
    copy /Y "%SOURCE_DIR%\styles.css" "%TARGET_DIR%\styles.css" >nul
    echo     styles.css 复制成功
)

REM 完成
echo [3/3] 安装完成！
echo.
echo ========================================
echo 安装成功！
echo ========================================
echo.
echo 下一步:
echo 1. 打开 Obsidian
echo 2. 进入 设置 -^> 第三方插件
echo 3. 如果未启用，关闭"安全模式"
echo 4. 刷新插件列表
echo 5. 启用 "Obsidian Cursor Logger"
echo.
echo 插件位置: %TARGET_DIR%
echo.
pause

