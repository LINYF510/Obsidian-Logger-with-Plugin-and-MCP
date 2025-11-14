@echo off
chcp 65001 >nul
REM Obsidian Cursor Logger - 文档整理脚本
REM 将文档移动到规范的分类目录

echo ========================================
echo 文档整理脚本
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/4] 移动架构设计文档...
if exist "docs\auto-reload.md" (
    move /Y "docs\auto-reload.md" "docs\architecture\Auto-Reload架构设计.md" >nul 2>&1
    echo [OK] Auto-Reload架构设计.md
) else (
    echo [SKIP] auto-reload.md 不存在或已移动
)

echo.
echo [2/4] 移动开发文档...
if exist "docs\文档查询建议.md" (
    move /Y "docs\文档查询建议.md" "docs\development\文档查询建议.md" >nul 2>&1
    echo [OK] 文档查询建议.md
) else (
    echo [SKIP] 文档查询建议.md 不存在或已移动
)

echo.
echo [3/4] 移动使用指南...
if exist "docs\MCP_SERVER_GUIDE.md" (
    move /Y "docs\MCP_SERVER_GUIDE.md" "docs\guides\MCP服务器启动指南.md" >nul 2>&1
    echo [OK] MCP服务器启动指南.md
) else (
    echo [SKIP] MCP_SERVER_GUIDE.md 不存在或已移动
)

if exist "docs\LINK_PLUGIN_GUIDE.md" (
    move /Y "docs\LINK_PLUGIN_GUIDE.md" "docs\guides\插件安装指南.md" >nul 2>&1
    echo [OK] 插件安装指南.md
) else (
    echo [SKIP] LINK_PLUGIN_GUIDE.md 不存在或已移动
)

echo.
echo [4/4] 移动测试文档...
if exist "docs\TEST_RESULTS.md" (
    move /Y "docs\TEST_RESULTS.md" "docs\testing\阶段一测试报告.md" >nul 2>&1
    echo [OK] 阶段一测试报告.md
) else (
    echo [SKIP] TEST_RESULTS.md 不存在或已移动
)

if exist "docs\MCP_VERIFICATION.md" (
    move /Y "docs\MCP_VERIFICATION.md" "docs\testing\MCP验证报告.md" >nul 2>&1
    echo [OK] MCP验证报告.md
) else (
    echo [SKIP] MCP_VERIFICATION.md 不存在或已移动
)

echo.
echo [5/4] 移动临时文档...
if exist "docs\SETUP_STATUS.md" (
    move /Y "docs\SETUP_STATUS.md" "docs\misc\阶段一完成状态.md" >nul 2>&1
    echo [OK] 阶段一完成状态.md
) else (
    echo [SKIP] SETUP_STATUS.md 不存在或已移动
)

echo.
echo [6/4] 清理错误创建的目录...
if exist "global-logger\docs" (
    rmdir /s /q "global-logger\docs"
    echo [OK] 已删除 global-logger\docs
) else (
    echo [SKIP] global-logger\docs 不存在
)

if exist "docs-local" (
    rmdir /s /q "docs-local"
    echo [OK] 已删除 docs-local
) else (
    echo [SKIP] docs-local 不存在
)

echo.
echo ========================================
echo 文档整理完成！
echo ========================================
echo.
echo 整理后的结构：
echo docs/
echo ├── architecture/      (架构设计)
echo ├── development/       (开发文档)
echo ├── guides/            (使用指南)
echo ├── testing/           (测试报告)
echo ├── misc/              (临时文档)
echo ├── 目录结构.md
echo └── Obsidian-Cursor Logger 项目开发方案.md
echo.
echo 下一步：
echo 1. 查看 docs/ 目录验证文件已正确移动
echo 2. 更新 docs/目录结构.md 反映新结构
echo.
pause


