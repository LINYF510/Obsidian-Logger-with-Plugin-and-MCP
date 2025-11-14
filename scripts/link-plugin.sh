#!/bin/bash
# Obsidian Cursor Logger - 链接插件到 Obsidian vault

set -e

echo "========================================"
echo "Obsidian Cursor Logger - 链接插件"
echo "========================================"
echo ""

# 检查是否提供了 vault 路径
if [ -z "$1" ]; then
    echo "[错误] 请提供 Obsidian vault 路径"
    echo ""
    echo "用法:"
    echo "  $0 /path/to/vault"
    echo ""
    echo "示例:"
    echo "  $0 ~/Documents/MyVault"
    echo ""
    exit 1
fi

VAULT_PATH="$1"

echo "目标 Vault: $VAULT_PATH"
echo ""

# 检查 vault 是否存在
if [ ! -d "$VAULT_PATH" ]; then
    echo "[错误] Vault 路径不存在: $VAULT_PATH"
    exit 1
fi

# 创建插件目录（如果不存在）
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins"
if [ ! -d "$PLUGIN_DIR" ]; then
    echo "[创建] .obsidian/plugins 目录"
    mkdir -p "$PLUGIN_DIR"
fi

TARGET_DIR="$PLUGIN_DIR/obsidian-cursor-logger"

# 获取当前项目路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/../global-logger" && pwd)"

echo "源目录: $SOURCE_DIR"
echo "目标目录: $TARGET_DIR"
echo ""

# 检查是否已存在
if [ -e "$TARGET_DIR" ]; then
    echo "[警告] 目标目录已存在"
    read -p "是否覆盖？(Y/N): " overwrite
    if [ "$overwrite" != "Y" ] && [ "$overwrite" != "y" ]; then
        echo "操作已取消"
        exit 0
    fi
    rm -rf "$TARGET_DIR"
fi

# 创建符号链接
echo "[创建] 符号链接..."
ln -s "$SOURCE_DIR" "$TARGET_DIR"

if [ $? -eq 0 ]; then
    echo "[成功] 符号链接已创建"
else
    echo "[错误] 创建符号链接失败"
    echo "尝试使用复制方式..."
    cp -r "$SOURCE_DIR" "$TARGET_DIR"
    if [ $? -eq 0 ]; then
        echo "[成功] 插件已复制到 Obsidian"
        echo ""
        echo "[注意] 使用复制模式时，需要手动同步更新"
    else
        echo "[错误] 复制失败"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "链接完成！"
echo "========================================"
echo ""
echo "下一步："
echo "1. 打开 Obsidian"
echo "2. 进入 设置 → 第三方插件"
echo "3. 关闭"安全模式"（如果已开启）"
echo "4. 找到并启用 \"Obsidian Cursor Logger\""
echo ""
echo "开发提示："
echo "- 运行 'cd global-logger && npm run dev' 启动 watch 模式"
echo "- 修改代码后保存会自动编译"
echo "- 符号链接模式下无需重新复制文件"
echo ""

