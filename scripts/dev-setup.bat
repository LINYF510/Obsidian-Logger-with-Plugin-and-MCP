@echo off
REM Obsidian Cursor Logger - 开发环境设置脚本

echo ========================================
echo Obsidian Cursor Logger - 开发环境设置
echo ========================================
echo.

REM 检查是否已运行安装脚本
if not exist "global-logger\node_modules" (
    echo [警告] 未检测到 Node.js 依赖
    echo 请先运行 install.bat 安装依赖
    echo.
    set /p confirm="是否现在运行安装脚本？(Y/N): "
    if /i "%confirm%"=="Y" (
        call scripts\install.bat
    ) else (
        echo 跳过安装
        pause
        exit /b 1
    )
)

echo [1/3] 验证环境配置...
echo.

REM 验证 TypeScript 配置
if exist "global-logger\tsconfig.json" (
    echo [成功] TypeScript 配置文件存在
) else (
    echo [错误] 缺少 tsconfig.json
    pause
    exit /b 1
)

REM 验证 manifest.json
if exist "global-logger\manifest.json" (
    echo [成功] 插件清单文件存在
) else (
    echo [错误] 缺少 manifest.json
    pause
    exit /b 1
)

REM 验证 esbuild 配置
if exist "global-logger\esbuild.config.mjs" (
    echo [成功] esbuild 配置文件存在
) else (
    echo [错误] 缺少 esbuild.config.mjs
    pause
    exit /b 1
)

echo.
echo [2/3] 检查 Python 配置...
echo.

if exist "mcp-server\requirements.txt" (
    echo [成功] Python 依赖配置存在
) else (
    echo [错误] 缺少 requirements.txt
    pause
    exit /b 1
)

echo.
echo [3/3] 创建示例配置...
echo.

REM 如果不存在 config.json，从示例创建
if not exist "mcp-server\config.json" (
    if exist "mcp-server\config.example.json" (
        copy "mcp-server\config.example.json" "mcp-server\config.json"
        echo [创建] mcp-server\config.json
        echo [提示] 请编辑 config.json 设置正确的路径
    )
) else (
    echo [跳过] config.json 已存在
)

echo.
echo ========================================
echo 开发环境设置完成！
echo ========================================
echo.
echo 开发工作流：
echo 1. 在一个终端运行: cd global-logger ^&^& npm run dev
echo 2. 在另一个终端可以查看日志和测试 MCP 工具
echo 3. 使用 link-plugin.bat 链接插件到 Obsidian
echo.
echo 文档参考：
echo - 开发计划: docs\DEVELOPMENT_PLAN.md
echo - 项目方案: docs\Obsidian-Cursor Logger 项目开发方案.md
echo.
pause

