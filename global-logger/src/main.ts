import { Plugin, Notice } from 'obsidian';
import { LoggerModule } from './logger';
import { AutoReloadModule } from './auto-reload';
import { PluginSettings, DEFAULT_SETTINGS } from './shared/types';
import { CursorLoggerSettingTab } from './settings';

/**
 * Obsidian Logger 插件
 * 
 * 提供全局日志收集和智能自动重载功能
 */
export default class ObsidianLoggerPlugin extends Plugin {
  settings: PluginSettings;
  loggerModule: LoggerModule;
  autoReloadModule: AutoReloadModule;
  
  async onload() {
    console.log('🚀 Obsidian Logger 启动中...');
    
    // 1. 加载配置
    await this.loadSettings();
    
    // 2. 初始化日志模块
    this.loggerModule = new LoggerModule(this);
    await this.loggerModule.initialize();
    
    // 3. 初始化 Auto-Reload 模块
    this.autoReloadModule = new AutoReloadModule(this);
    await this.autoReloadModule.initialize();
    
    // 4. 注册命令
    this.registerCommands();
    
    // 5. 注册设置页面
    this.addSettingTab(new CursorLoggerSettingTab(this.app, this));
    
    console.log('✅ Obsidian Logger 已启动');
  }
  
  async onunload() {
    // 1. 停止 Auto-Reload 模块
    if (this.autoReloadModule) {
      await this.autoReloadModule.cleanup();
    }
    
    // 2. 停止日志模块
    if (this.loggerModule) {
      await this.loggerModule.cleanup();
    }
    
    console.log('👋 Obsidian Logger 已卸载');
  }
  
  /**
   * 加载设置
   */
  async loadSettings() {
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    
    // 确保新添加的字段存在（向后兼容）
    if (!this.settings.autoReload.globalWatchedFiles) {
      const { DEFAULT_WATCHED_FILES } = await import('./shared/types');
      this.settings.autoReload.globalWatchedFiles = DEFAULT_WATCHED_FILES;
    }
    
    if (!this.settings.autoReload.pluginSpecificFiles) {
      this.settings.autoReload.pluginSpecificFiles = {};
    }
    
    if (this.settings.autoReload.usePluginSpecific === undefined) {
      this.settings.autoReload.usePluginSpecific = false;
    }
    
    // 保存更新后的配置
    await this.saveSettings();
  }
  
  /**
   * 保存设置
   */
  async saveSettings() {
    await this.saveData(this.settings);
  }
  
  /**
   * 注册命令
   */
  registerCommands() {
    // 日志模块命令
    this.addCommand({
      id: 'show-log-path',
      name: '📋 显示日志文件路径',
      callback: () => {
        if (this.loggerModule) {
          this.loggerModule.showLogPath();
        }
      }
    });
    
    this.addCommand({
      id: 'clear-global-logs',
      name: '🗑️ 清空全局日志',
      callback: async () => {
        if (this.loggerModule) {
          await this.loggerModule.clearLogs();
        }
      }
    });
    
    // Auto-Reload 模块命令
    this.addCommand({
      id: 'switch-to-smart-mode',
      name: '🧠 切换到智能监控模式',
      callback: async () => {
        this.settings.autoReload.mode = 'smart';
        await this.saveSettings();
        if (this.autoReloadModule) {
          await this.autoReloadModule.updateWatchList();
        }
      }
    });
    
    this.addCommand({
      id: 'switch-to-auto-mode',
      name: '🤖 切换到自动监控模式',
      callback: async () => {
        this.settings.autoReload.mode = 'auto';
        await this.saveSettings();
        if (this.autoReloadModule) {
          await this.autoReloadModule.updateWatchList();
        }
      }
    });
    
    this.addCommand({
      id: 'switch-to-manual-mode',
      name: '✋ 切换到手动监控模式',
      callback: async () => {
        this.settings.autoReload.mode = 'manual';
        await this.saveSettings();
        if (this.autoReloadModule) {
          await this.autoReloadModule.updateWatchList();
        }
      }
    });
    
    this.addCommand({
      id: 'refresh-watch-list',
      name: '🔄 刷新监控列表',
      callback: async () => {
        if (this.autoReloadModule) {
          await this.autoReloadModule.updateWatchList();
        }
      }
    });
    
    // 其他命令
    this.addCommand({
      id: 'open-log-folder',
      name: '📂 打开日志文件夹',
      callback: () => {
        const fs = require('fs');
        const path = require('path');
        const { shell } = require('electron');
        const logPath = this.loggerModule.getLogFilePath();
        const logDir = path.dirname(logPath);
        shell.openPath(logDir);
      }
    });
    
    this.addCommand({
      id: 'show-log-stats',
      name: '📊 显示日志统计',
      callback: async () => {
        const { LogStats } = await import('./logger/log-stats');
        const logStats = new LogStats(this.loggerModule.getLogFilePath());
        const stats = await logStats.getStatistics();
        
        const message = `
📊 日志统计摘要
━━━━━━━━━━━━━━━━━━━━━
💾 文件大小: ${logStats.formatFileSize(stats.fileSize)}
📈 总行数: ${stats.totalLines}
🔴 错误数: ${stats.errorCount}
🟡 警告数: ${stats.warnCount}
🔵 调试数: ${stats.debugCount}
⏱️ 最后更新: ${logStats.formatTime(stats.lastModified)}
━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        new Notice(message, 8000);
      }
    });
    
    this.addCommand({
      id: 'show-autoreload-status',
      name: '🤖 显示 Auto-Reload 状态',
      callback: () => {
        const status = this.autoReloadModule.getStatus();
        
        const message = `
🤖 Auto-Reload 状态
━━━━━━━━━━━━━━━━━━━━━
✅ 状态: ${status.isRunning ? '运行中' : '已停止'}
${status.mode}
📊 监控插件: ${status.watchedPlugins.length} 个
⏱️ 检查间隔: ${status.checkInterval}ms

监控列表:
${status.watchedPlugins.map(id => `  • ${id}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        new Notice(message, 8000);
      }
    });
  }
}

