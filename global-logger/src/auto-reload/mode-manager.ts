import { App } from 'obsidian';
import { SmartIdentifier } from './smart-identifier';

/**
 * 监控模式类型
 */
export type WatchMode = 'auto' | 'smart' | 'manual';

/**
 * 模式管理器
 * 
 * 负责根据不同模式获取要监控的插件列表
 */
export class ModeManager {
  private smartIdentifier: SmartIdentifier;
  
  /**
   * 构造函数
   * @param app Obsidian App 实例
   * @param smartModeThreshold 智能模式阈值（小时）
   */
  constructor(
    private app: App,
    smartModeThreshold: number
  ) {
    this.smartIdentifier = new SmartIdentifier(app, smartModeThreshold);
  }
  
  /**
   * 根据模式获取监控插件列表
   * @param mode 监控模式
   * @param manualPlugins 手动模式下的插件列表
   * @returns 插件 ID 数组
   */
  async getWatchList(mode: WatchMode, manualPlugins: string[]): Promise<string[]> {
    console.log(`[Auto-Reload] 🔧 获取监控列表（模式: ${mode}）`);
    
    switch (mode) {
      case 'auto':
        return this.getAutoModePlugins();
      
      case 'smart':
        return this.getSmartModePlugins();
      
      case 'manual':
        return this.getManualModePlugins(manualPlugins);
      
      default:
        console.warn(`[Auto-Reload] ⚠️ 未知模式: ${mode}，使用智能模式`);
        return this.getSmartModePlugins();
    }
  }
  
  /**
   * 自动模式：获取所有已启用的插件
   * @returns 插件 ID 数组
   */
  private getAutoModePlugins(): string[] {
    const app = this.app as any;
    const enabledPlugins = Array.from(app.plugins.enabledPlugins) as string[];
    
    // 排除自身
    const filtered = enabledPlugins.filter(id => id !== 'obsidian-logger');
    
    console.log(`[Auto-Reload] 🤖 自动模式: 监控所有已启用插件 (${filtered.length} 个)`);
    
    return filtered;
  }
  
  /**
   * 智能模式：自动识别开发中的插件
   * @returns 插件 ID 数组
   */
  private async getSmartModePlugins(): Promise<string[]> {
    const devPlugins = await this.smartIdentifier.identifyDevPlugins();
    
    console.log(`[Auto-Reload] 🧠 智能模式: 识别到 ${devPlugins.length} 个开发插件`);
    
    return devPlugins;
  }
  
  /**
   * 手动模式：从配置读取用户选择的插件
   * @param manualPlugins 手动选择的插件列表
   * @returns 插件 ID 数组（验证后的有效列表）
   */
  private getManualModePlugins(manualPlugins: string[]): string[] {
    const app = this.app as any;
    const enabledPlugins = app.plugins.enabledPlugins;
    
    // 过滤出已启用且有效的插件
    const validPlugins = manualPlugins.filter(id => {
      if (id === 'obsidian-logger') {
        return false;  // 排除自身
      }
      
      if (!enabledPlugins.has(id)) {
        console.warn(`[Auto-Reload] ⚠️ 插件 ${id} 未启用，从监控列表中移除`);
        return false;
      }
      
      return true;
    });
    
    console.log(`[Auto-Reload] ✋ 手动模式: 监控 ${validPlugins.length} 个插件`);
    
    return validPlugins;
  }
  
  /**
   * 获取所有已启用的插件（供设置界面使用）
   * @returns 插件信息数组
   */
  getAllEnabledPlugins(): Array<{ id: string; name: string; enabled: boolean }> {
    const app = this.app as any;
    const enabledPlugins = Array.from(app.plugins.enabledPlugins) as string[];
    const plugins = app.plugins.plugins;
    
    return enabledPlugins
      .filter((id: string) => id !== 'obsidian-logger')
      .map((id: string) => ({
        id,
        name: plugins[id]?.manifest?.name || id,
        enabled: true
      }));
  }
  
  /**
   * 更新智能模式阈值
   * @param threshold 新的阈值（小时）
   */
  setSmartModeThreshold(threshold: number): void {
    this.smartIdentifier.setSmartModeThreshold(threshold);
  }
}


