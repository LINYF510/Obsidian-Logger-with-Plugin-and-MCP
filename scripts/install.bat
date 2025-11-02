@echo off
REM Obsidian Cursor Logger - 自动安装脚本
REM 此脚本会自动安装所有依赖

echo ========================================
echo Obsidian Cursor Logger - 安装脚本
echo ========================================
echo.

REM 检查 Node.js
echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 16+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo [成功] Node.js 已安装
echo.

REM 检查 Python
echo [2/4] 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    echo 下载地址: https://www.python.org/
    pause
    exit /b 1
)
echo [成功] Python 已安装
echo.

REM 安装 Node.js 依赖
echo [3/4] 安装 Node.js 依赖...
cd global-logger
call npm install
if errorlevel 1 (
    echo [错误] npm install 失败
    cd ..
    pause
    exit /b 1
)
echo [成功] Node.js 依赖安装完成
cd ..
echo.

REM 安装 Python 依赖
echo [4/4] 安装 Python 依赖...
cd mcp-server
pip install -r requirements.txt
if errorlevel 1 (
    echo [警告] pip install 可能失败，请检查错误信息
)
echo [成功] Python 依赖安装完成
cd ..
echo.

echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 下一步：
echo 1. 运行 'cd global-logger' 进入插件目录
echo 2. 运行 'npm run dev' 启动开发模式
echo 3. 运行 'scripts\link-plugin.bat' 链接插件到 Obsidian
echo.
pause

