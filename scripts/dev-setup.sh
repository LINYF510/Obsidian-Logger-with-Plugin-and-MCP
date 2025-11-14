#!/bin/bash
# Obsidian Cursor Logger - 开发环境设置脚本

set -e

echo "========================================"
echo "Obsidian Cursor Logger - 开发环境设置"
echo "========================================"
echo ""

# 检查是否已运行安装脚本
if [ ! -d "global-logger/node_modules" ]; then
    echo "[警告] 未检测到 Node.js 依赖"
    echo "请先运行 scripts/install.sh 安装依赖"
    echo ""
    read -p "是否现在运行安装脚本？(Y/N): " confirm
    if [ "$confirm" = "Y" ] || [ "$confirm" = "y" ]; then
        bash scripts/install.sh
    else
        echo "跳过安装"
        exit 1
    fi
fi

echo "[1/3] 验证环境配置..."
echo ""

# 验证 TypeScript 配置
if [ -f "global-logger/tsconfig.json" ]; then
    echo "[成功] TypeScript 配置文件存在"
else
    echo "[错误] 缺少 tsconfig.json"
    exit 1
fi

# 验证 manifest.json
if [ -f "global-logger/manifest.json" ]; then
    echo "[成功] 插件清单文件存在"
else
    echo "[错误] 缺少 manifest.json"
    exit 1
fi

# 验证 esbuild 配置
if [ -f "global-logger/esbuild.config.mjs" ]; then
    echo "[成功] esbuild 配置文件存在"
else
    echo "[错误] 缺少 esbuild.config.mjs"
    exit 1
fi

echo ""
echo "[2/3] 检查 Python 配置..."
echo ""

if [ -f "mcp-server/requirements.txt" ]; then
    echo "[成功] Python 依赖配置存在"
else
    echo "[错误] 缺少 requirements.txt"
    exit 1
fi

echo ""
echo "[3/3] 创建示例配置..."
echo ""

# 如果不存在 config.json，从示例创建
if [ ! -f "mcp-server/config.json" ]; then
    if [ -f "mcp-server/config.example.json" ]; then
        cp "mcp-server/config.example.json" "mcp-server/config.json"
        echo "[创建] mcp-server/config.json"
        echo "[提示] 请编辑 config.json 设置正确的路径"
    fi
else
    echo "[跳过] config.json 已存在"
fi

echo ""
echo "========================================"
echo "开发环境设置完成！"
echo "========================================"
echo ""
echo "开发工作流："
echo "1. 在一个终端运行: cd global-logger && npm run dev"
echo "2. 在另一个终端可以查看日志和测试 MCP 工具"
echo "3. 使用 link-plugin.sh 链接插件到 Obsidian"
echo ""
echo "文档参考："
echo "- 开发计划: docs/DEVELOPMENT_PLAN.md"
echo "- 项目方案: docs/Obsidian-Cursor Logger 项目开发方案.md"
echo ""

