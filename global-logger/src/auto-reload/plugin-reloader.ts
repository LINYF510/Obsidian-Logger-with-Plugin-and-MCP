import { App, Notice } from 'obsidian';

/**
 * 插件重载器
 * 
 * 负责执行插件的禁用和启用操作
 */
export class PluginReloader {
  /**
   * 构造函数
   * @param app Obsidian App 实例
   * @param showNotification 是否显示通知
   */
  constructor(
    private app: App,
    private showNotification: boolean
  ) {}
  
  /**
   * 重载指定插件
   * @param pluginId 插件 ID
   * @returns 重载是否成功
   */
  async reloadPlugin(pluginId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // 使用类型断言访问 plugins
      const app = this.app as any;
      
      // 检查插件是否存在且已启用
      if (!app.plugins.enabledPlugins.has(pluginId)) {
        console.warn(`[Auto-Reload] 插件 ${pluginId} 未启用，跳过重载`);
        return false;
      }
      
      console.log(`[Auto-Reload] 开始重载插件: ${pluginId}`);
      
      // 禁用插件
      await app.plugins.disablePlugin(pluginId);
      
      // 等待 100ms 确保完全卸载
      await this.sleep(100);
      
      // 启用插件
      await app.plugins.enablePlugin(pluginId);
      
      // 计算耗时
      const duration = Date.now() - startTime;
      
      console.log(`[Auto-Reload] ✅ 插件已重载: ${pluginId} (用时: ${duration}ms)`);
      
      // 显示通知（如果启用）
      if (this.showNotification) {
        new Notice(`✅ 插件已自动重载: ${pluginId}`, 2000);
      }
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Auto-Reload] ❌ 插件重载失败: ${pluginId} (用时: ${duration}ms)`, error);
      
      if (this.showNotification) {
        new Notice(`❌ 插件重载失败: ${pluginId}`, 3000);
      }
      
      return false;
    }
  }
  
  /**
   * 批量重载多个插件
   * @param pluginIds 插件 ID 数组
   * @returns 成功重载的插件数量
   */
  async reloadPlugins(pluginIds: string[]): Promise<number> {
    let successCount = 0;
    
    for (const pluginId of pluginIds) {
      const success = await this.reloadPlugin(pluginId);
      if (success) {
        successCount++;
      }
      
      // 避免频繁操作，每次重载后等待 50ms
      await this.sleep(50);
    }
    
    console.log(`[Auto-Reload] 批量重载完成: ${successCount}/${pluginIds.length} 成功`);
    return successCount;
  }
  
  /**
   * 辅助方法：异步等待
   * @param ms 等待时间（毫秒）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 更新通知设置
   * @param showNotification 是否显示通知
   */
  setShowNotification(showNotification: boolean): void {
    this.showNotification = showNotification;
  }
}


