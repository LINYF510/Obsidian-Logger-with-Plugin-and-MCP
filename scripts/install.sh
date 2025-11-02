#!/bin/bash
# Obsidian Cursor Logger - 自动安装脚本
# 此脚本会自动安装所有依赖

set -e

echo "========================================"
echo "Obsidian Cursor Logger - 安装脚本"
echo "========================================"
echo ""

# 检查 Node.js
echo "[1/4] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装 Node.js 16+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi
echo "[成功] Node.js 已安装: $(node --version)"
echo ""

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "[错误] 未找到 npm"
    exit 1
fi
echo "[成功] npm 已安装: $(npm --version)"
echo ""

# 检查 Python
echo "[2/4] 检查 Python..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python，请先安装 Python 3.8+"
    echo "下载地址: https://www.python.org/"
    exit 1
fi
echo "[成功] Python 已安装: $(python3 --version)"
echo ""

# 检查 pip
if ! command -v pip3 &> /dev/null; then
    echo "[警告] 未找到 pip3，尝试使用 python3 -m pip"
fi
echo ""

# 安装 Node.js 依赖
echo "[3/4] 安装 Node.js 依赖..."
cd global-logger
npm install
if [ $? -ne 0 ]; then
    echo "[错误] npm install 失败"
    exit 1
fi
echo "[成功] Node.js 依赖安装完成"
cd ..
echo ""

# 安装 Python 依赖
echo "[4/4] 安装 Python 依赖..."
cd mcp-server
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    python3 -m pip install -r requirements.txt
fi
if [ $? -ne 0 ]; then
    echo "[警告] pip install 可能失败，请检查错误信息"
fi
echo "[成功] Python 依赖安装完成"
cd ..
echo ""

echo "========================================"
echo "安装完成！"
echo "========================================"
echo ""
echo "下一步："
echo "1. 运行 'cd global-logger' 进入插件目录"
echo "2. 运行 'npm run dev' 启动开发模式"
echo "3. 运行 'scripts/link-plugin.sh /path/to/vault' 链接插件到 Obsidian"
echo ""

