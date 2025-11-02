import { App, Plugin } from 'obsidian';
import { FileWatcher } from './file-watcher';
import { PluginReloader } from './plugin-reloader';
import { ModeManager, WatchMode } from './mode-manager';

/**
 * Auto-Reload 模块
 * 
 * 智能自动重载模块，支持三种监控模式
 */
export class AutoReloadModule {
  private fileWatcher: FileWatcher | null = null;
  private pluginReloader: PluginReloader | null = null;
  private modeManager: ModeManager | null = null;
  private watchedPlugins: string[] = [];
  
  /**
   * 构造函数
   * @param plugin 插件实例
   */
  constructor(private plugin: Plugin) {}
  
  /**
   * 初始化 Auto-Reload 模块
   */
  async initialize(): Promise<void> {
    try {
      const settings = (this.plugin as any).settings;
      const autoReloadConfig = settings.autoReload;
      
      console.log('[Auto-Reload] 🤖 Auto-Reload 模块启动中...');
      
      // 创建插件重载器
      this.pluginReloader = new PluginReloader(
        this.plugin.app,
        autoReloadConfig.showNotification
      );
      
      // 创建模式管理器
      this.modeManager = new ModeManager(
        this.plugin.app,
        autoReloadConfig.smartModeThreshold
      );
      
      // 创建文件监听器
      this.fileWatcher = new FileWatcher(
        this.plugin.app,
        autoReloadConfig.checkInterval,
        (pluginId) => this.handleFileChanged(pluginId),
        (pluginId) => this.getFileTypesForPlugin(pluginId)
      );
      
      // 根据模式获取监控列表
      await this.updateWatchList();
      
      // 启动文件监听
      this.fileWatcher.startWatching(this.watchedPlugins);
      
      // 显示启动通知
      if (autoReloadConfig.showStartupNotification) {
        const modeText = this.getModeDisplayName(autoReloadConfig.mode);
        console.log(`[Auto-Reload] ✅ Auto-Reload 模块已启动`);
        console.log(`[Auto-Reload]    ├─ 监控模式: ${modeText}`);
        console.log(`[Auto-Reload]    ├─ 监控插件: ${this.watchedPlugins.length} 个`);
        console.log(`[Auto-Reload]    └─ 检查间隔: ${autoReloadConfig.checkInterval}ms`);
        
        if (this.watchedPlugins.length > 0) {
          console.log(`[Auto-Reload]    监控列表: ${this.watchedPlugins.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('[Auto-Reload] ❌ 初始化失败:', error);
    }
  }
  
  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      if (this.fileWatcher) {
        this.fileWatcher.stopWatching();
        this.fileWatcher = null;
      }
      
      this.pluginReloader = null;
      this.modeManager = null;
      this.watchedPlugins = [];
      
      console.log('[Auto-Reload] 🤖 Auto-Reload 模块已停止');
    } catch (error) {
      console.error('[Auto-Reload] ❌ 清理失败:', error);
    }
  }
  
  /**
   * 更新监控列表
   */
  async updateWatchList(): Promise<void> {
    if (!this.modeManager) {
      console.warn('[Auto-Reload] ⚠️ ModeManager 未初始化');
      return;
    }
    
    const settings = (this.plugin as any).settings;
    const autoReloadConfig = settings.autoReload;
    
    // 根据模式获取监控列表
    const newWatchList = await this.modeManager.getWatchList(
      autoReloadConfig.mode,
      autoReloadConfig.watchedPlugins
    );
    
    this.watchedPlugins = newWatchList;
    
    // 更新文件监听器
    if (this.fileWatcher) {
      this.fileWatcher.updateWatchedPlugins(newWatchList);
    }
    
    console.log(`[Auto-Reload] 📝 监控列表已更新: ${newWatchList.length} 个插件`);
  }
  
  /**
   * 处理文件变化事件
   * @param pluginId 发生变化的插件 ID
   */
  private async handleFileChanged(pluginId: string): Promise<void> {
    if (!this.pluginReloader) {
      console.warn('[Auto-Reload] ⚠️ PluginReloader 未初始化');
      return;
    }
    
    console.log(`[Auto-Reload] 🔄 触发重载: ${pluginId}`);
    
    // 执行重载
    await this.pluginReloader.reloadPlugin(pluginId);
  }
  
  /**
   * 手动触发插件重载
   * @param pluginId 插件 ID
   */
  async manualReload(pluginId: string): Promise<boolean> {
    if (!this.pluginReloader) {
      console.warn('[Auto-Reload] ⚠️ PluginReloader 未初始化');
      return false;
    }
    
    return await this.pluginReloader.reloadPlugin(pluginId);
  }
  
  /**
   * 获取监控状态信息
   * @returns 状态信息对象
   */
  getStatus(): {
    mode: string;
    watchedPlugins: string[];
    checkInterval: number;
    isRunning: boolean;
  } {
    const settings = (this.plugin as any).settings;
    const autoReloadConfig = settings.autoReload;
    
    return {
      mode: this.getModeDisplayName(autoReloadConfig.mode),
      watchedPlugins: this.watchedPlugins,
      checkInterval: autoReloadConfig.checkInterval,
      isRunning: this.fileWatcher !== null
    };
  }
  
  /**
   * 获取模式的显示名称
   * @param mode 模式
   * @returns 显示名称
   */
  private getModeDisplayName(mode: WatchMode): string {
    switch (mode) {
      case 'auto':
        return '🤖 自动模式';
      case 'smart':
        return '🧠 智能模式';
      case 'manual':
        return '✋ 手动模式';
      default:
        return mode;
    }
  }
  
  /**
   * 获取所有已启用的插件（供设置界面使用）
   * @returns 插件信息数组
   */
  getAllEnabledPlugins(): Array<{ id: string; name: string; enabled: boolean }> {
    if (!this.modeManager) {
      return [];
    }
    
    return this.modeManager.getAllEnabledPlugins();
  }
  
  /**
   * 获取指定插件的文件类型配置
   * @param pluginId 插件 ID
   * @returns 文件类型配置
   */
  private getFileTypesForPlugin(pluginId: string): import('../shared/types').WatchedFileTypes {
    const settings = (this.plugin as any).settings;
    const autoReloadConfig = settings.autoReload;
    
    // 如果启用了插件特定配置，且该插件有特定配置，使用特定配置
    if (autoReloadConfig.usePluginSpecific && 
        autoReloadConfig.pluginSpecificFiles && 
        autoReloadConfig.pluginSpecificFiles[pluginId]) {
      return autoReloadConfig.pluginSpecificFiles[pluginId];
    }
    
    // 否则使用全局配置，如果不存在则使用默认配置
    if (autoReloadConfig.globalWatchedFiles) {
      return autoReloadConfig.globalWatchedFiles;
    }
    
    // 回退到默认配置
    const { DEFAULT_WATCHED_FILES } = require('../shared/types');
    return DEFAULT_WATCHED_FILES;
  }
}


