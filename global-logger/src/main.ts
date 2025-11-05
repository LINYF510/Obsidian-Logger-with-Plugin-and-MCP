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
  
  // 配置监听相关
  private configCheckTimer: NodeJS.Timeout | null = null;
  private lastConfigMtime: number = 0;
  
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
    
    // 6. 根据 MCP 开关决定是否启动配置监听
    if (this.settings.mcp.enabled) {
      this.startMcpServices();
    }
    
    console.log('✅ Obsidian Logger 已启动');
  }
  
  async onunload() {
    // 1. 停止配置监听
    this.stopConfigMonitor();
    
    // 2. 停止 Auto-Reload 模块
    if (this.autoReloadModule) {
      await this.autoReloadModule.cleanup();
    }
    
    // 3. 停止日志模块
    if (this.loggerModule) {
      await this.loggerModule.cleanup();
    }
    
    console.log('👋 Obsidian Logger 已卸载');
  }
  
  /**
   * 加载设置
   * @param autoSave 是否自动保存（用于向后兼容时添加缺失字段）
   */
  async loadSettings(autoSave: boolean = true) {
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    
    let needsSave = false;
    
    // 确保新添加的字段存在（向后兼容）
    if (!this.settings.autoReload.globalWatchedFiles) {
      const { DEFAULT_WATCHED_FILES } = await import('./shared/types');
      this.settings.autoReload.globalWatchedFiles = DEFAULT_WATCHED_FILES;
      needsSave = true;
    }
    
    if (!this.settings.autoReload.pluginSpecificFiles) {
      this.settings.autoReload.pluginSpecificFiles = {};
      needsSave = true;
    }
    
    if (this.settings.autoReload.usePluginSpecific === undefined) {
      this.settings.autoReload.usePluginSpecific = false;
      needsSave = true;
    }
    
    // 确保 MCP 配置存在（向后兼容）
    if (!this.settings.mcp) {
      this.settings.mcp = {
        enabled: false,
        autoRefreshSettings: true,
        refreshInterval: 2000,
        configMonitorInterval: 500
      };
      needsSave = true;
    }
    
    // 只在需要且允许时保存
    if (autoSave && needsSave) {
      await this.saveSettings();
    }
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
  
  /**
   * 启动配置监听（支持 MCP 远程控制）
   * 
   * 定期检查 data.json 的修改时间，如果变化则重新加载配置
   */
  private startConfigMonitor() {
    if (!this.settings.mcp.enabled) {
      return;
    }
    
    const interval = this.settings.mcp.configMonitorInterval;
    
    this.configCheckTimer = setInterval(async () => {
      await this.checkConfigChanges();
    }, interval);
    
    console.log(`[Config Monitor] 配置监听已启动（${interval}ms 轮询间隔）`);
  }
  
  /**
   * 停止配置监听
   */
  private stopConfigMonitor() {
    if (this.configCheckTimer) {
      clearInterval(this.configCheckTimer);
      this.configCheckTimer = null;
      console.log('[Config Monitor] 配置监听已停止');
    }
  }
  
  /**
   * 检查配置文件变化
   */
  private async checkConfigChanges() {
    try {
      const dataPath = '.obsidian/plugins/obsidian-logger/data.json';
      const stat = await this.app.vault.adapter.stat(dataPath);
      
      if (stat && stat.mtime > this.lastConfigMtime) {
        // 初始化时跳过（避免重复加载）
        if (this.lastConfigMtime === 0) {
          this.lastConfigMtime = stat.mtime;
          console.log('[Config Monitor] 初始化完成，开始监听配置变化');
          return;
        }
        
        const timeDiff = stat.mtime - this.lastConfigMtime;
        console.log(`[Config Monitor] 🔄 检测到配置变化 (时间差: ${timeDiff}ms)`);
        this.lastConfigMtime = stat.mtime;
        await this.handleConfigUpdate();
      }
    } catch (e) {
      // 文件可能不存在或读取失败，静默处理
      // console.error('[Config Monitor] 配置检查失败:', e);
    }
  }
  
  /**
   * 处理配置更新
   */
  private async handleConfigUpdate() {
    try {
      console.log('[Config Monitor] 📥 开始处理配置更新...');
      
      // 1. 重新加载配置（不自动保存，避免触发新的配置变化）
      const loadedData = await this.loadData();
      const oldMode = this.settings.autoReload.mode;
      const oldWatchedPlugins = [...this.settings.autoReload.watchedPlugins];
      
      // 检查是否有重载请求
      const reloadRequest = (loadedData as any)._reloadRequest;
      
      // 更新配置（直接赋值，不触发保存）
      this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
      
      // 确保必要字段存在（但不保存）
      if (!this.settings.autoReload.globalWatchedFiles) {
        const { DEFAULT_WATCHED_FILES } = await import('./shared/types');
        this.settings.autoReload.globalWatchedFiles = DEFAULT_WATCHED_FILES;
      }
      if (!this.settings.autoReload.pluginSpecificFiles) {
        this.settings.autoReload.pluginSpecificFiles = {};
      }
      if (!this.settings.mcp) {
        this.settings.mcp = {
          enabled: false,
          autoRefreshSettings: true,
          refreshInterval: 2000,
          configMonitorInterval: 500
        };
      }
      
      // 2. 处理重载请求
      if (reloadRequest) {
        console.log(`[Config Monitor] 📨 收到重载请求: ${reloadRequest.pluginId}`);
        await this.handleReloadRequest(reloadRequest);
        
        // 清除请求标记
        delete (loadedData as any)._reloadRequest;
        await this.saveData(loadedData);
      }
      
      // 3. 应用配置变化
      const newMode = this.settings.autoReload.mode;
      const newWatchedPlugins = this.settings.autoReload.watchedPlugins;
      
      // 检测模式变化
      if (newMode !== oldMode) {
        console.log(`[Config Monitor] 🔄 模式已变更: ${oldMode} → ${newMode}`);
        new Notice(`🤖 Auto-Reload 模式已切换到: ${newMode.toUpperCase()}`, 3000);
      }
      
      // 检测监控列表变化
      const listChanged = JSON.stringify(oldWatchedPlugins) !== JSON.stringify(newWatchedPlugins);
      if (listChanged) {
        console.log(`[Config Monitor] 📋 监控列表已更新:`, newWatchedPlugins);
      }
      
      // 更新监控列表
      if (this.autoReloadModule) {
        console.log('[Config Monitor] 🔄 正在更新监控列表...');
        await this.autoReloadModule.updateWatchList();
        console.log('[Config Monitor] ✅ 监控列表已更新');
      }
      
      console.log('[Config Monitor] ✅ 配置更新完成');
    } catch (error) {
      console.error('[Config Monitor] ❌ 处理配置更新失败:', error);
      new Notice('❌ 配置更新失败，请查看控制台', 5000);
    }
  }
  
  /**
   * 启动 MCP 相关服务
   */
  public startMcpServices() {
    if (!this.settings.mcp.enabled) {
      return;
    }
    
    console.log('[MCP] 🚀 启动 MCP 服务...');
    this.startConfigMonitor();
    new Notice('✅ MCP 功能已启用', 3000);
  }
  
  /**
   * 停止 MCP 相关服务
   */
  public stopMcpServices() {
    console.log('[MCP] 🛑 停止 MCP 服务...');
    this.stopConfigMonitor();
    new Notice('🔴 MCP 功能已禁用', 3000);
  }
  
  /**
   * 重启配置监听（用于更改监听间隔后）
   */
  public restartConfigMonitor() {
    if (this.settings.mcp.enabled) {
      this.stopConfigMonitor();
      this.startConfigMonitor();
      console.log('[MCP] 🔄 配置监听已重启');
    }
  }
  
  /**
   * 处理重载请求
   */
  private async handleReloadRequest(request: { pluginId: string; timestamp: number }) {
    const { pluginId, timestamp } = request;
    
    console.log(`[Config Monitor] 收到重载请求: ${pluginId} (时间戳: ${timestamp})`);
    
    // 检查插件是否存在且已启用
    const plugin = (this.app as any).plugins.plugins[pluginId];
    if (!plugin) {
      console.warn(`[Config Monitor] 插件不存在: ${pluginId}`);
      new Notice(`⚠️ 插件不存在: ${pluginId}`);
      return;
    }
    
    if (!(this.app as any).plugins.enabledPlugins.has(pluginId)) {
      console.warn(`[Config Monitor] 插件未启用: ${pluginId}`);
      new Notice(`⚠️ 插件未启用: ${pluginId}`);
      return;
    }
    
    // 执行重载
    try {
      const startTime = Date.now();
      
      // 禁用插件
      await (this.app as any).plugins.disablePlugin(pluginId);
      
      // 等待 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 启用插件
      await (this.app as any).plugins.enablePlugin(pluginId);
      
      const duration = Date.now() - startTime;
      
      console.log(`[Config Monitor] ✅ 插件已重载: ${pluginId} (用时: ${duration}ms)`);
      new Notice(`✅ 插件已重载: ${pluginId}`);
    } catch (error) {
      console.error(`[Config Monitor] ❌ 重载失败: ${pluginId}`, error);
      new Notice(`❌ 重载失败: ${pluginId}`);
    }
  }
}

