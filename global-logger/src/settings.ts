import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import ObsidianLoggerPlugin from './main';
import { WatchedFileTypes, DEFAULT_WATCHED_FILES } from './shared/types';
import { LogStats } from './logger/log-stats';
import { ReloadStats } from './auto-reload/reload-stats';

/**
 * Obsidian Logger 设置页面
 */
export class CursorLoggerSettingTab extends PluginSettingTab {
  plugin: ObsidianLoggerPlugin;
  private logStats: LogStats;
  private reloadStats: ReloadStats;
  private currentPage: 'logger' | 'autoreload' | 'advanced' = 'logger';
  private settingsRefreshTimer: NodeJS.Timeout | null = null;
  
  constructor(app: App, plugin: ObsidianLoggerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.logStats = new LogStats(plugin.loggerModule.getLogFilePath());
    this.reloadStats = new ReloadStats(plugin.loggerModule.getLogFilePath());
  }
  
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    // 添加样式
    const style = containerEl.createEl('style');
    style.textContent = `
      .cursor-logger-nav-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 2px solid var(--background-modifier-border);
        padding-bottom: 10px;
      }
      
      .cursor-logger-nav-bar .nav-button {
        padding: 8px 16px;
        border: none;
        background: var(--background-secondary);
        color: var(--text-normal);
        cursor: pointer;
        border-radius: 5px;
        font-size: 14px;
        transition: background 0.2s;
      }
      
      .cursor-logger-nav-bar .nav-button:hover {
        background: var(--background-modifier-hover);
      }
      
      .cursor-logger-nav-bar .nav-button.active {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        font-weight: 600;
      }
      
      .cursor-logger-settings-content {
        margin-top: 20px;
      }
    `;
    
    // 页面标题
    containerEl.createEl('h1', { text: 'Obsidian Logger 设置' });
    
    // 导航栏
    this.createNavigationBar(containerEl);
    
    // 内容区域
    const contentEl = containerEl.createDiv({ cls: 'cursor-logger-settings-content' });
    
    // 根据当前页面渲染不同内容
    switch (this.currentPage) {
      case 'logger':
        this.displayLoggerSettings(contentEl);
        this.displayLoggerStatus(contentEl);
        break;
      case 'autoreload':
        this.displayAutoReloadSettings(contentEl);
        this.displayAutoReloadStatus(contentEl);
        break;
      case 'advanced':
        this.displayAdvancedOptions(contentEl);
        break;
    }
    
    // 启动自动刷新（如果启用且未运行）
    this.startSettingsRefresh();
  }
  
  hide(): void {
    this.stopSettingsRefresh();
  }
  
  /**
   * 创建导航栏
   */
  private createNavigationBar(containerEl: HTMLElement): void {
    const navBar = containerEl.createDiv({ cls: 'cursor-logger-nav-bar' });
    
    const pages = [
      { id: 'logger', name: '日志模块', icon: '📝' },
      { id: 'autoreload', name: 'Auto-Reload', icon: '🤖' },
      { id: 'advanced', name: '高级选项', icon: '🔧' }
    ];
    
    pages.forEach(page => {
      const button = navBar.createEl('button', {
        text: `${page.icon} ${page.name}`,
        cls: this.currentPage === page.id ? 'nav-button active' : 'nav-button'
      });
      
      button.onclick = () => {
        this.currentPage = page.id as any;
        this.display();
      };
    });
  }
  
  /**
   * 启动设置页面自动刷新
   */
  private startSettingsRefresh(): void {
    // 检查是否应该启用自动刷新
    if (!this.plugin.settings.mcp.enabled || !this.plugin.settings.mcp.autoRefreshSettings) {
      return;
    }
    
    // 如果已经有定时器在运行，不要重复启动
    if (this.settingsRefreshTimer) {
      return;
    }
    
    const interval = this.plugin.settings.mcp.refreshInterval;
    this.settingsRefreshTimer = setInterval(async () => {
      // 重新加载配置但不保存（避免触发配置监听）
      await this.plugin.loadSettings(false);
      this.display();
    }, interval);
    
    console.log(`[Settings] 设置页面自动刷新已启动（间隔: ${interval}ms）`);
  }
  
  /**
   * 停止设置页面自动刷新
   */
  private stopSettingsRefresh(): void {
    if (this.settingsRefreshTimer) {
      clearInterval(this.settingsRefreshTimer);
      this.settingsRefreshTimer = null;
      console.log('[Settings] 设置页面自动刷新已停止');
    }
  }
  
  /**
   * 显示日志模块设置
   */
  private displayLoggerSettings(containerEl: HTMLElement): void {
    // 分隔线
    containerEl.createEl('h2', { text: '📝 日志模块设置' });
    
    // 日志文件路径（可编辑）
    new Setting(containerEl)
      .setName('日志文件路径')
      .setDesc('支持相对路径（相对于 Vault，如 ../obsidian-logger/debug.log）或绝对路径。修改后需要重载插件才能生效。')
      .addText(text => {
        text
          .setPlaceholder('../obsidian-logger/obsidian-debug.log')
          .setValue(this.plugin.settings.logger.logFilePath)
          .onChange(async (value) => {
            if (value.trim() === '') {
              new Notice('❌ 路径不能为空');
              return;
            }
            
            // 保存路径
            this.plugin.settings.logger.logFilePath = value.trim();
            await this.plugin.saveSettings();
            
            // 提示需要重载
            new Notice('⚠️ 日志路径已更新，请重载插件使其生效', 5000);
          });
      })
      .addButton(button => button
        .setButtonText('🔄 重载插件')
        .setTooltip('重载插件以应用新路径')
        .onClick(async () => {
          const pluginId = this.plugin.manifest.id;
          new Notice('正在重载插件...');
          
          try {
            await (this.app as any).plugins.disablePlugin(pluginId);
            await new Promise(resolve => setTimeout(resolve, 100));
            await (this.app as any).plugins.enablePlugin(pluginId);
            new Notice('✅ 插件已重载，新路径已生效');
          } catch (error) {
            console.error('Failed to reload plugin:', error);
            new Notice('❌ 重载失败，请手动重载插件');
          }
        }))
      .addButton(button => button
        .setButtonText('📋 复制')
        .setTooltip('复制当前路径')
        .onClick(() => {
          navigator.clipboard.writeText(this.plugin.loggerModule.getLogFilePath());
          new Notice('✅ 路径已复制到剪贴板');
        }))
      .addButton(button => button
        .setButtonText('📂 打开')
        .setTooltip('在文件管理器中打开日志目录')
        .onClick(() => {
          const fs = require('fs');
          const path = require('path');
          const { shell } = require('electron');
          const logDir = path.dirname(this.plugin.loggerModule.getLogFilePath());
          shell.openPath(logDir);
        }));
    
    // 缓冲区大小
    new Setting(containerEl)
      .setName('缓冲区大小')
      .setDesc('达到此数量时自动刷新到磁盘。建议: 50-200 条，默认 100 条')
      .addText(text => text
        .setPlaceholder('100')
        .setValue(String(this.plugin.settings.logger.bufferSize))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (num >= 1 && num <= 1000) {
            this.plugin.settings.logger.bufferSize = num;
            await this.plugin.saveSettings();
          }
        }));
    
    // 刷新间隔
    new Setting(containerEl)
      .setName('刷新间隔（毫秒）')
      .setDesc('定时刷新日志到磁盘的间隔。建议: 300-1000 毫秒，默认 500 毫秒')
      .addText(text => text
        .setPlaceholder('500')
        .setValue(String(this.plugin.settings.logger.flushInterval))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (num >= 100 && num <= 5000) {
            this.plugin.settings.logger.flushInterval = num;
            await this.plugin.saveSettings();
          }
        }));
    
    // 启用日志轮转
    new Setting(containerEl)
      .setName('启用日志轮转')
      .setDesc('超过指定大小时自动创建备份并开始新文件')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.logger.enableRotation)
        .onChange(async (value) => {
          this.plugin.settings.logger.enableRotation = value;
          await this.plugin.saveSettings();
        }));
    
    // 文件大小上限
    new Setting(containerEl)
      .setName('文件大小上限（MB）')
      .setDesc('日志文件超过此大小时触发轮转。建议: 5-50 MB，默认 10 MB')
      .addText(text => text
        .setPlaceholder('10')
        .setValue(String(this.plugin.settings.logger.maxFileSize))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (num >= 1 && num <= 100) {
            this.plugin.settings.logger.maxFileSize = num;
            await this.plugin.saveSettings();
          }
        }));
    
    // 快捷操作
    const actionsSetting = new Setting(containerEl)
      .setName('快捷操作');
    
    actionsSetting.addButton(button => button
      .setButtonText('📊 查看统计')
      .onClick(async () => {
        await this.showLogStatistics();
      }));
    
    actionsSetting.addButton(button => button
      .setButtonText('🗑️ 清空日志')
      .onClick(async () => {
        if (this.plugin.loggerModule) {
          await this.plugin.loggerModule.clearLogs();
        }
      }));
    
    actionsSetting.addButton(button => button
      .setButtonText('📂 打开文件夹')
      .onClick(() => {
        const fs = require('fs');
        const path = require('path');
        const { shell } = require('electron');
        const logDir = path.dirname(this.plugin.loggerModule.getLogFilePath());
        shell.openPath(logDir);
      }));
  }
  
  /**
   * 显示 Auto-Reload 模块设置
   */
  private displayAutoReloadSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '🤖 Auto-Reload 模块设置' });
    
    // 监控模式选择
    new Setting(containerEl)
      .setName('监控模式')
      .setDesc(this.getModeDescription(this.plugin.settings.autoReload.mode))
      .addDropdown(dropdown => dropdown
        .addOption('auto', '🤖 自动模式')
        .addOption('smart', '🧠 智能模式')
        .addOption('manual', '✋ 手动模式')
        .setValue(this.plugin.settings.autoReload.mode)
        .onChange(async (value: 'auto' | 'smart' | 'manual') => {
          this.plugin.settings.autoReload.mode = value;
          await this.plugin.saveSettings();
          if (this.plugin.autoReloadModule) {
            await this.plugin.autoReloadModule.updateWatchList();
          }
          // 重新渲染以显示/隐藏相关配置
          this.display();
        }));
    
    // 智能模式配置（条件显示）
    if (this.plugin.settings.autoReload.mode === 'smart') {
      this.displaySmartModeSettings(containerEl);
    }
    
    // 手动模式配置（条件显示）
    if (this.plugin.settings.autoReload.mode === 'manual') {
      this.displayManualModeSettings(containerEl);
    }
    
    // 监控文件类型设置
    this.displayFileTypesSettings(containerEl);
    
    // 重载配置
    this.displayReloadSettings(containerEl);
  }
  
  /**
   * 显示智能模式配置
   */
  private displaySmartModeSettings(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('智能识别阈值（小时）')
      .setDesc('文件在此时间内被修改则认为是开发版本。建议: 1-48 小时，默认 24 小时')
      .addText(text => text
        .setPlaceholder('24')
        .setValue(String(this.plugin.settings.autoReload.smartModeThreshold))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (num >= 1 && num <= 168) {
            this.plugin.settings.autoReload.smartModeThreshold = num;
            await this.plugin.saveSettings();
          }
        }))
      .addButton(button => button
        .setButtonText('🔍 立即重新识别')
        .onClick(async () => {
          if (this.plugin.autoReloadModule) {
            await this.plugin.autoReloadModule.updateWatchList();
            new Notice('✅ 已重新识别开发插件');
          }
        }));
  }
  
  /**
   * 显示手动模式配置
   */
  private displayManualModeSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: '监控插件列表' });
    
    // 快捷操作按钮
    const quickActions = new Setting(containerEl)
      .setName('快捷操作');
    
    quickActions.addButton(button => button
      .setButtonText('✓ 全选已启用')
      .onClick(async () => {
        const allPlugins = this.plugin.autoReloadModule.getAllEnabledPlugins();
        this.plugin.settings.autoReload.watchedPlugins = allPlugins.map(p => p.id);
        await this.plugin.saveSettings();
        await this.plugin.autoReloadModule.updateWatchList();
        this.display();
      }));
    
    quickActions.addButton(button => button
      .setButtonText('✗ 清空全部')
      .onClick(async () => {
        this.plugin.settings.autoReload.watchedPlugins = [];
        await this.plugin.saveSettings();
        await this.plugin.autoReloadModule.updateWatchList();
        this.display();
      }));
    
    quickActions.addButton(button => button
      .setButtonText('🧠 智能识别')
      .onClick(async () => {
        // 临时切换到智能模式获取列表
        const originalMode = this.plugin.settings.autoReload.mode;
        this.plugin.settings.autoReload.mode = 'smart';
        await this.plugin.autoReloadModule.updateWatchList();
        const smartList = this.plugin.autoReloadModule.getStatus().watchedPlugins;
        
        // 恢复手动模式
        this.plugin.settings.autoReload.mode = originalMode;
        this.plugin.settings.autoReload.watchedPlugins = smartList;
        await this.plugin.saveSettings();
        await this.plugin.autoReloadModule.updateWatchList();
        this.display();
      }));
    
    // 插件列表
    const allPlugins = this.plugin.autoReloadModule.getAllEnabledPlugins();
    const watchedSet = new Set(this.plugin.settings.autoReload.watchedPlugins);
    
    containerEl.createEl('div', { text: `已选中: ${watchedSet.size} 个插件`, cls: 'setting-item-description' });
    
    for (const pluginInfo of allPlugins) {
      new Setting(containerEl)
        .setName(pluginInfo.name)
        .setDesc(`插件 ID: ${pluginInfo.id}`)
        .addToggle(toggle => toggle
          .setValue(watchedSet.has(pluginInfo.id))
          .onChange(async (value) => {
            if (value) {
              if (!watchedSet.has(pluginInfo.id)) {
                this.plugin.settings.autoReload.watchedPlugins.push(pluginInfo.id);
              }
            } else {
              const index = this.plugin.settings.autoReload.watchedPlugins.indexOf(pluginInfo.id);
              if (index > -1) {
                this.plugin.settings.autoReload.watchedPlugins.splice(index, 1);
              }
            }
            await this.plugin.saveSettings();
            await this.plugin.autoReloadModule.updateWatchList();
            this.display();
          }));
    }
  }
  
  /**
   * 显示文件类型设置
   */
  private displayFileTypesSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: '监控文件类型' });
    
    // 全局/单独配置切换
    new Setting(containerEl)
      .setName('配置模式')
      .setDesc('选择为所有插件使用相同配置，还是为每个插件单独配置')
      .addDropdown(dropdown => dropdown
        .addOption('global', '全局配置（所有插件相同）')
        .addOption('specific', '插件特定配置（每个插件单独设置）')
        .setValue(this.plugin.settings.autoReload.usePluginSpecific ? 'specific' : 'global')
        .onChange(async (value) => {
          this.plugin.settings.autoReload.usePluginSpecific = (value === 'specific');
          await this.plugin.saveSettings();
          this.display();
        }));
    
    // 全局配置
    if (!this.plugin.settings.autoReload.usePluginSpecific) {
      this.displayGlobalFileTypes(containerEl);
    } else {
      this.displayPluginSpecificFileTypes(containerEl);
    }
  }
  
  /**
   * 显示全局文件类型配置
   */
  private displayGlobalFileTypes(containerEl: HTMLElement): void {
    containerEl.createEl('h4', { text: '全局监控文件' });
    
    // 确保 globalWatchedFiles 存在
    if (!this.plugin.settings.autoReload.globalWatchedFiles) {
      this.plugin.settings.autoReload.globalWatchedFiles = { ...DEFAULT_WATCHED_FILES };
    }
    
    const fileTypes = this.plugin.settings.autoReload.globalWatchedFiles;
    
    // main.js（必选，禁用）
    new Setting(containerEl)
      .setName('main.js')
      .setDesc('插件主文件（必选，不可取消）')
      .addToggle(toggle => toggle
        .setValue(true)
        .setDisabled(true));
    
    // manifest.json
    new Setting(containerEl)
      .setName('manifest.json')
      .setDesc('插件配置文件')
      .addToggle(toggle => toggle
        .setValue(fileTypes.manifest)
        .onChange(async (value) => {
          fileTypes.manifest = value;
          await this.plugin.saveSettings();
        }));
    
    // styles.css
    new Setting(containerEl)
      .setName('styles.css')
      .setDesc('插件样式文件')
      .addToggle(toggle => toggle
        .setValue(fileTypes.styles)
        .onChange(async (value) => {
          fileTypes.styles = value;
          await this.plugin.saveSettings();
        }));
    
    // 自定义文件
    new Setting(containerEl)
      .setName('自定义文件')
      .setDesc('每行一个文件名，支持通配符（* 匹配任意字符）。例如：data.json 或 lang/*.json')
      .addTextArea(text => {
        text
          .setPlaceholder('data.json\nlang/*.json\nconfig.yaml')
          .setValue(fileTypes.custom.join('\n'))
          .onChange(async (value) => {
            const lines = value.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            fileTypes.custom = lines;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 5;
        text.inputEl.style.width = '100%';
      });
  }
  
  /**
   * 显示插件特定文件类型配置
   */
  private displayPluginSpecificFileTypes(containerEl: HTMLElement): void {
    containerEl.createEl('h4', { text: '插件特定配置' });
    containerEl.createEl('p', { text: '为每个监控的插件单独设置要监听的文件。未设置的插件使用全局默认配置。', cls: 'setting-item-description' });
    
    // 获取当前监控的插件列表
    const status = this.plugin.autoReloadModule.getStatus();
    const watchedPlugins = status.watchedPlugins;
    
    if (watchedPlugins.length === 0) {
      containerEl.createEl('p', { text: '当前没有监控的插件', cls: 'setting-item-description' });
      return;
    }
    
    // 为每个插件显示配置
    for (const pluginId of watchedPlugins) {
      const app = this.app as any;
      const pluginName = app.plugins.plugins[pluginId]?.manifest?.name || pluginId;
      
      containerEl.createEl('h5', { text: `📦 ${pluginName}` });
      
      const pluginSpecificFiles = this.plugin.settings.autoReload.pluginSpecificFiles || {};
      const specificConfig = pluginSpecificFiles[pluginId];
      const config = specificConfig || { ...DEFAULT_WATCHED_FILES };
      
      // 使用特定配置开关
      new Setting(containerEl)
        .setName('使用特定配置')
        .setDesc(`为 ${pluginName} 使用单独的文件类型配置`)
        .addToggle(toggle => toggle
          .setValue(!!specificConfig)
          .onChange(async (value) => {
            // 确保 pluginSpecificFiles 存在
            if (!this.plugin.settings.autoReload.pluginSpecificFiles) {
              this.plugin.settings.autoReload.pluginSpecificFiles = {};
            }
            
            if (value) {
              this.plugin.settings.autoReload.pluginSpecificFiles[pluginId] = { ...DEFAULT_WATCHED_FILES };
            } else {
              delete this.plugin.settings.autoReload.pluginSpecificFiles[pluginId];
            }
            await this.plugin.saveSettings();
            this.display();
          }));
      
      if (specificConfig) {
        // manifest.json
        new Setting(containerEl)
          .setName('  └─ manifest.json')
          .addToggle(toggle => toggle
            .setValue(config.manifest)
            .onChange(async (value) => {
              config.manifest = value;
              if (!this.plugin.settings.autoReload.pluginSpecificFiles) {
                this.plugin.settings.autoReload.pluginSpecificFiles = {};
              }
              this.plugin.settings.autoReload.pluginSpecificFiles[pluginId] = config;
              await this.plugin.saveSettings();
            }));
        
        // styles.css
        new Setting(containerEl)
          .setName('  └─ styles.css')
          .addToggle(toggle => toggle
            .setValue(config.styles)
            .onChange(async (value) => {
              config.styles = value;
              if (!this.plugin.settings.autoReload.pluginSpecificFiles) {
                this.plugin.settings.autoReload.pluginSpecificFiles = {};
              }
              this.plugin.settings.autoReload.pluginSpecificFiles[pluginId] = config;
              await this.plugin.saveSettings();
            }));
        
        // 自定义文件
        new Setting(containerEl)
          .setName('  └─ 自定义文件')
          .setDesc('每行一个，支持通配符')
          .addTextArea(text => {
            text
              .setPlaceholder('data.json\nlang/*.json')
              .setValue(config.custom.join('\n'))
              .onChange(async (value) => {
                const lines = value.split('\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0);
                config.custom = lines;
                if (!this.plugin.settings.autoReload.pluginSpecificFiles) {
                  this.plugin.settings.autoReload.pluginSpecificFiles = {};
                }
                this.plugin.settings.autoReload.pluginSpecificFiles[pluginId] = config;
                await this.plugin.saveSettings();
              });
            text.inputEl.rows = 3;
            text.inputEl.style.width = '100%';
          });
      }
    }
  }
  
  /**
   * 显示重载配置
   */
  private displayReloadSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: '重载配置' });
    
    // 检查间隔
    new Setting(containerEl)
      .setName('检查间隔（毫秒）')
      .setDesc('扫描插件文件变化的时间间隔。建议: 500-2000 毫秒，默认 1000 毫秒')
      .addText(text => text
        .setPlaceholder('1000')
        .setValue(String(this.plugin.settings.autoReload.checkInterval))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (num >= 100 && num <= 10000) {
            this.plugin.settings.autoReload.checkInterval = num;
            await this.plugin.saveSettings();
          }
        }));
    
    // 显示重载通知
    new Setting(containerEl)
      .setName('显示重载通知')
      .setDesc('插件重载时显示 Obsidian 通知')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoReload.showNotification)
        .onChange(async (value) => {
          this.plugin.settings.autoReload.showNotification = value;
          await this.plugin.saveSettings();
        }));
    
    // 显示启动通知
    new Setting(containerEl)
      .setName('显示启动通知')
      .setDesc('Auto-Reload 启动时在控制台显示详细信息')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoReload.showStartupNotification)
        .onChange(async (value) => {
          this.plugin.settings.autoReload.showStartupNotification = value;
          await this.plugin.saveSettings();
        }));
  }
  
  /**
   * 显示运行状态
   */
  private async displayStatus(containerEl: HTMLElement): Promise<void> {
    containerEl.createEl('h2', { text: '📊 运行状态' });
    
    // 日志模块状态
    await this.displayLoggerStatus(containerEl);
    
    // Auto-Reload 模块状态
    this.displayAutoReloadStatus(containerEl);
  }
  
  /**
   * 显示日志模块状态
   */
  private async displayLoggerStatus(containerEl: HTMLElement): Promise<void> {
    containerEl.createEl('h3', { text: '日志模块状态' });
    
    const stats = await this.logStats.getStatistics();
    
    const statusDiv = containerEl.createDiv({ cls: 'cursor-logger-status-card' });
    statusDiv.createEl('div', { text: '状态: ✅ 运行中' });
    statusDiv.createEl('div', { 
      text: `日志文件: ${this.logStats.formatFileSize(stats.fileSize)} (${stats.totalLines} 行)` 
    });
    statusDiv.createEl('div', { 
      text: `错误数: ${stats.errorCount}  |  警告数: ${stats.warnCount}  |  调试数: ${stats.debugCount}` 
    });
    statusDiv.createEl('div', { 
      text: `最后更新: ${this.logStats.formatTime(stats.lastModified)}` 
    });
  }
  
  /**
   * 显示 Auto-Reload 模块状态
   */
  private async displayAutoReloadStatus(containerEl: HTMLElement): Promise<void> {
    containerEl.createEl('h3', { text: 'Auto-Reload 模块状态' });
    
    const status = this.plugin.autoReloadModule.getStatus();
    const reloadStats = await this.reloadStats.getTodayStatistics();
    
    const statusDiv = containerEl.createDiv({ cls: 'cursor-logger-status-card' });
    statusDiv.createEl('div', { text: `状态: ${status.isRunning ? '✅ 运行中' : '❌ 已停止'}` });
    statusDiv.createEl('div', { text: `监控模式: ${status.mode}` });
    statusDiv.createEl('div', { text: `监控插件数量: ${status.watchedPlugins.length} 个` });
    statusDiv.createEl('div', { text: `检查间隔: ${status.checkInterval}ms` });
    
    if (status.watchedPlugins.length > 0) {
      statusDiv.createEl('br');
      statusDiv.createEl('div', { text: '正在监控的插件:' });
      for (const pluginId of status.watchedPlugins) {
        statusDiv.createEl('div', { text: `  • ${pluginId}` });
      }
    }
    
    // 今日统计
    if (reloadStats.totalReloads > 0) {
      statusDiv.createEl('br');
      statusDiv.createEl('div', { text: '今日统计:' });
      statusDiv.createEl('div', { text: `  总重载次数: ${reloadStats.totalReloads} 次` });
      statusDiv.createEl('div', { text: `  成功率: ${reloadStats.successRate.toFixed(1)}%` });
      statusDiv.createEl('div', { text: `  平均耗时: ${reloadStats.averageDuration}ms` });
    }
  }
  
  /**
   * 显示高级选项
   */
  private displayAdvancedOptions(containerEl: HTMLElement): void {
    // MCP 功能配置
    containerEl.createEl('h2', { text: '🌐 MCP 远程控制' });
    
    // MCP 总开关
    new Setting(containerEl)
      .setName('启用 MCP 功能')
      .setDesc('启用后支持通过 Cursor MCP Server 远程控制插件配置')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.mcp.enabled)
        .onChange(async (value) => {
          this.plugin.settings.mcp.enabled = value;
          await this.plugin.saveSettings();
          
          // 根据开关状态启动/停止 MCP 服务
          if (value) {
            this.plugin.startMcpServices();
          } else {
            this.plugin.stopMcpServices();
          }
          
          // 刷新页面显示相关配置
          this.display();
        }));
    
    // MCP 启用时显示详细配置
    if (this.plugin.settings.mcp.enabled) {
      // 设置页面自动刷新
      new Setting(containerEl)
        .setName('设置页面自动刷新')
        .setDesc('MCP 修改配置后自动刷新设置页面显示')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.mcp.autoRefreshSettings)
          .onChange(async (value) => {
            this.plugin.settings.mcp.autoRefreshSettings = value;
            await this.plugin.saveSettings();
            
            // 重启设置页面刷新
            this.stopSettingsRefresh();
            if (value) {
              this.startSettingsRefresh();
            }
          }));
      
      // 刷新间隔配置
      new Setting(containerEl)
        .setName('设置页面刷新间隔（秒）')
        .setDesc('自动刷新的时间间隔。推荐: 1-5 秒')
        .addText(text => text
          .setPlaceholder('2')
          .setValue(String(this.plugin.settings.mcp.refreshInterval / 1000))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num >= 1 && num <= 10) {
              this.plugin.settings.mcp.refreshInterval = num * 1000;
              await this.plugin.saveSettings();
              
              // 重启刷新定时器（强制重启以应用新间隔）
              this.stopSettingsRefresh();
              this.startSettingsRefresh();
            }
          }));
      
      // 配置监听间隔
      new Setting(containerEl)
        .setName('配置监听间隔（毫秒）')
        .setDesc('检测配置文件变化的间隔。推荐: 500-2000 毫秒')
        .addText(text => text
          .setPlaceholder('500')
          .setValue(String(this.plugin.settings.mcp.configMonitorInterval))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num >= 100 && num <= 5000) {
              this.plugin.settings.mcp.configMonitorInterval = num;
              await this.plugin.saveSettings();
              
              // 重启配置监听
              this.plugin.restartConfigMonitor();
            }
          }));
    }
    
    containerEl.createEl('h2', { text: '🔧 高级选项' });
    
    // 打开开发者控制台
    new Setting(containerEl)
      .setName('开发者工具')
      .setDesc('打开 Obsidian 开发者控制台查看详细日志')
      .addButton(button => button
        .setButtonText('🔍 打开控制台')
        .onClick(() => {
          (window as any).electron?.remote?.getCurrentWindow().toggleDevTools();
        }));
    
    // 恢复默认设置
    new Setting(containerEl)
      .setName('恢复默认设置')
      .setDesc('将所有配置恢复为默认值（需要确认）')
      .addButton(button => button
        .setButtonText('🔄 恢复默认')
        .setWarning()
        .onClick(async () => {
          const confirmed = confirm('确定要恢复所有设置为默认值吗？这将清除所有自定义配置。');
          if (confirmed) {
            // 保存当前日志路径
            const logPath = this.plugin.settings.logger.logFilePath;
            
            // 恢复默认设置
            const { DEFAULT_SETTINGS } = await import('./shared/types');
            Object.assign(this.plugin.settings, DEFAULT_SETTINGS);
            
            // 保留日志路径
            this.plugin.settings.logger.logFilePath = logPath;
            
            await this.plugin.saveSettings();
            
            // 重新初始化模块
            await this.plugin.autoReloadModule.updateWatchList();
            
            new Notice('✅ 设置已恢复为默认值');
            this.display();
          }
        }));
  }
  
  /**
   * 显示日志统计弹窗
   */
  private async showLogStatistics(): Promise<void> {
    const stats = await this.logStats.getStatistics();
    
    const message = `
📊 日志统计摘要
━━━━━━━━━━━━━━━━━━━━━
📝 日志文件: ${stats.filePath}
💾 文件大小: ${this.logStats.formatFileSize(stats.fileSize)}
📈 总行数: ${stats.totalLines}
🔴 错误数: ${stats.errorCount}
🟡 警告数: ${stats.warnCount}
🔵 调试数: ${stats.debugCount}
⏱️ 最后更新: ${this.logStats.formatTime(stats.lastModified)}
━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    new Notice(message, 8000);
  }
  
  /**
   * 获取模式描述
   */
  private getModeDescription(mode: string): string {
    switch (mode) {
      case 'auto':
        return '🤖 自动模式：监控所有已启用的插件，适合同时开发多个插件';
      case 'smart':
        return '🧠 智能模式：自动识别开发中的插件（包含 source map、最近修改等特征），推荐使用';
      case 'manual':
        return '✋ 手动模式：用户手动选择要监控的插件，适合精确控制';
      default:
        return '';
    }
  }
}

