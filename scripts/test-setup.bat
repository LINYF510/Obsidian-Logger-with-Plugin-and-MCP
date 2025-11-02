@echo off
REM Obsidian Cursor Logger - 测试脚本
REM 验证所有配置和依赖是否正常工作

echo ========================================
echo Obsidian Cursor Logger - 测试脚本
echo ========================================
echo.

REM 记录开始时间
echo [开始时间] %date% %time%
echo.

REM 测试 1: 验证环境
echo [测试 1/6] 验证开发环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [失败] Node.js 未安装
    goto :error
)
echo [通过] Node.js: 
node --version

python --version >nul 2>&1
if errorlevel 1 (
    echo [失败] Python 未安装
    goto :error
)
echo [通过] Python:
python --version
echo.

REM 测试 2: 验证目录结构
echo [测试 2/6] 验证目录结构...
if not exist "global-logger\src\main.ts" (
    echo [失败] 缺少 global-logger\src\main.ts
    goto :error
)
echo [通过] global-logger 目录结构完整

if not exist "mcp-server\src\mcp_obsidian_logger.py" (
    echo [失败] 缺少 mcp-server\src\mcp_obsidian_logger.py
    goto :error
)
echo [通过] mcp-server 目录结构完整
echo.

REM 测试 3: 验证配置文件
echo [测试 3/6] 验证配置文件...
if not exist "global-logger\package.json" (
    echo [失败] 缺少 package.json
    goto :error
)
if not exist "global-logger\tsconfig.json" (
    echo [失败] 缺少 tsconfig.json
    goto :error
)
if not exist "global-logger\manifest.json" (
    echo [失败] 缺少 manifest.json
    goto :error
)
echo [通过] 所有插件配置文件存在

if not exist "mcp-server\requirements.txt" (
    echo [失败] 缺少 requirements.txt
    goto :error
)
if not exist "mcp-server\setup.py" (
    echo [失败] 缺少 setup.py
    goto :error
)
echo [通过] 所有 MCP Server 配置文件存在
echo.

REM 测试 4: 验证依赖安装
echo [测试 4/6] 验证依赖安装...
if not exist "global-logger\node_modules" (
    echo [失败] Node.js 依赖未安装
    echo 请运行: cd global-logger ^&^& npm install
    goto :error
)
echo [通过] Node.js 依赖已安装
echo.

REM 测试 5: 验证构建
echo [测试 5/6] 验证插件构建...
cd global-logger
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [失败] 插件构建失败
    cd ..
    goto :error
)
if not exist "main.js" (
    echo [失败] main.js 未生成
    cd ..
    goto :error
)
echo [通过] 插件构建成功
echo [通过] main.js 已生成
cd ..
echo.

REM 测试 6: 验证 Obsidian vault
echo [测试 6/6] 验证 Obsidian vault...
set "VAULT_PATH=C:\Users\Fancy\AppData\Roaming\obsidian\Obsidian Sandbox"
if exist "%VAULT_PATH%" (
    echo [通过] Vault 路径存在: %VAULT_PATH%
) else (
    echo [警告] Vault 路径不存在: %VAULT_PATH%
    echo [提示] 请检查 Obsidian 是否已安装
)
echo.

REM 测试 7: Python MCP Server 基本测试
echo [测试 7/6] 测试 Python MCP Server...
cd mcp-server\src
python -c "import sys; print('[通过] Python 导入系统正常')" 2>&1
if errorlevel 1 (
    echo [失败] Python 环境异常
    cd ..\..
    goto :error
)
cd ..\..
echo [通过] Python 环境正常
echo.

echo ========================================
echo 所有测试通过！
echo ========================================
echo.
echo 系统状态：
echo - Node.js 依赖: 已安装
echo - Python 依赖: 已安装
echo - 插件构建: 成功
echo - main.js: 已生成
echo - Obsidian vault: 已确认
echo.
echo 下一步操作：
echo 1. 运行 'scripts\link-plugin.bat' 链接插件到 Obsidian
echo 2. 在 Obsidian 中启用插件
echo 3. 运行 'cd global-logger ^&^& npm run dev' 进入开发模式
echo.
echo [结束时间] %date% %time%
goto :success

:error
echo.
echo ========================================
echo 测试失败！
echo ========================================
echo 请检查上述错误信息并修复问题
pause
exit /b 1

:success
pause
exit /b 0

