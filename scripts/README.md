# Scripts - 自动化脚本

本目录包含项目的自动化脚本，用于简化开发和部署流程。

## 可用脚本

### install.bat / install.sh
自动安装脚本，一键完成所有依赖安装：
- 安装 Node.js 依赖（global-logger）
- 安装 Python 依赖（mcp-server）
- 验证安装结果

**使用方法：**
```bash
# Windows
install.bat

# Linux/macOS
chmod +x install.sh
./install.sh
```

### dev-setup.bat / dev-setup.sh
开发环境设置脚本：
- 检查环境要求
- 配置开发工具
- 创建必要的配置文件

**使用方法：**
```bash
# Windows
dev-setup.bat

# Linux/macOS
chmod +x dev-setup.sh
./dev-setup.sh
```

### link-plugin.bat / link-plugin.sh
链接插件到 Obsidian vault：
- 自动检测 vault 位置
- 创建符号链接或复制文件
- Windows 系统提供管理员权限提示

**使用方法：**
```bash
# Windows
link-plugin.bat

# Linux/macOS
chmod +x link-plugin.sh
./link-plugin.sh /path/to/your/vault
```

## 注意事项

- Windows 脚本使用 `.bat` 扩展名
- Linux/macOS 脚本使用 `.sh` 扩展名
- 符号链接在 Windows 上需要管理员权限
- 所有脚本都会在执行前检查必要的前置条件

## 开发新脚本

在添加新脚本时，请遵循以下规范：
1. 提供 Windows 和 Linux/macOS 两个版本
2. 添加错误处理和用户友好的提示
3. 在此 README 中添加脚本说明
4. 更新项目文档中的相关章节

## 脚本列表

| 脚本 | 平台 | 说明 |
|------|------|------|
| `install.bat` / `install.sh` | Windows / Linux/macOS | 自动安装所有依赖 |
| `dev-setup.bat` / `dev-setup.sh` | Windows / Linux/macOS | 配置开发环境 |
| `link-plugin.bat` / `link-plugin.sh` | Windows / Linux/macOS | 链接插件到 Obsidian |
| `install-to-sandbox.bat` | Windows | 安装到 Obsidian Sandbox |
| `reorganize-docs.bat` | Windows | 重组文档结构 |

## 许可证

MIT

