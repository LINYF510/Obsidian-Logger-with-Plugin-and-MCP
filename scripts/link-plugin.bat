@echo off
REM Obsidian Logger - 链接插件到 Obsidian vault

echo ========================================
echo Obsidian Logger - 链接插件
echo ========================================
echo.

REM 设置默认 vault 路径
set "DEFAULT_VAULT=C:\Users\Fancy\AppData\Roaming\obsidian\Obsidian Sandbox"

REM 如果提供了参数，使用参数作为 vault 路径
if not "%~1"=="" (
    set "VAULT_PATH=%~1"
) else (
    set "VAULT_PATH=%DEFAULT_VAULT%"
)

echo 目标 Vault: %VAULT_PATH%
echo.

REM 检查 vault 是否存在
if not exist "%VAULT_PATH%" (
    echo [错误] Vault 路径不存在: %VAULT_PATH%
    echo.
    echo 用法:
    echo   link-plugin.bat [vault路径]
    echo.
    echo 示例:
    echo   link-plugin.bat "C:\Users\YourName\Documents\MyVault"
    echo.
    pause
    exit /b 1
)

REM 创建插件目录（如果不存在）
set "PLUGIN_DIR=%VAULT_PATH%\.obsidian\plugins"
if not exist "%PLUGIN_DIR%" (
    echo [创建] .obsidian\plugins 目录
    mkdir "%PLUGIN_DIR%"
)

set "TARGET_DIR=%PLUGIN_DIR%\obsidian-logger"

REM 获取当前项目路径
set "SOURCE_DIR=%~dp0..\global-logger"
pushd "%SOURCE_DIR%"
set "SOURCE_DIR=%CD%"
popd

echo 源目录: %SOURCE_DIR%
echo 目标目录: %TARGET_DIR%
echo.

REM 检查是否已存在
if exist "%TARGET_DIR%" (
    echo [警告] 目标目录已存在
    set /p overwrite="是否覆盖？(Y/N): "
    if /i not "%overwrite%"=="Y" (
        echo 操作已取消
        pause
        exit /b 0
    )
    rmdir /s /q "%TARGET_DIR%"
)

REM 尝试创建符号链接（需要管理员权限）
echo [1/2] 尝试创建符号链接...
mklink /D "%TARGET_DIR%" "%SOURCE_DIR%" >nul 2>&1

if errorlevel 1 (
    echo [失败] 无法创建符号链接（可能需要管理员权限）
    echo [2/2] 使用复制方式...
    echo.
    
    REM 如果符号链接失败，复制文件
    xcopy /E /I /Y "%SOURCE_DIR%" "%TARGET_DIR%"
    
    if errorlevel 1 (
        echo [错误] 复制失败
        pause
        exit /b 1
    )
    
    echo [成功] 插件已复制到 Obsidian
    echo.
    echo [注意] 使用复制模式时，需要手动同步更新
    echo 建议以管理员权限运行以创建符号链接
) else (
    echo [成功] 符号链接已创建
)

echo.
echo ========================================
echo 链接完成！
echo ========================================
echo.
echo 下一步：
echo 1. 打开 Obsidian
echo 2. 进入 设置 → 第三方插件
echo 3. 关闭"安全模式"（如果已开启）
echo 4. 找到并启用 "Obsidian Logger"
echo.
echo 开发提示：
echo - 运行 'cd global-logger ^&^& npm run dev' 启动 watch 模式
echo - 修改代码后保存会自动编译
echo - 符号链接模式下无需重新复制文件
echo.
pause

