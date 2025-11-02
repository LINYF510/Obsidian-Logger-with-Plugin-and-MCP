import { App } from 'obsidian';

/**
 * 智能识别器
 * 
 * 使用评分算法自动识别开发中的插件
 */
export class SmartIdentifier {
  /**
   * 构造函数
   * @param app Obsidian App 实例
   * @param smartModeThreshold 智能模式阈值（小时）
   */
  constructor(
    private app: App,
    private smartModeThreshold: number
  ) {}
  
  /**
   * 识别开发中的插件
   * @returns 开发插件 ID 列表
   */
  async identifyDevPlugins(): Promise<string[]> {
    const app = this.app as any;
    const enabledPlugins = Array.from(app.plugins.enabledPlugins) as string[];
    const devPlugins: string[] = [];
    
    console.log('[Auto-Reload] 🧠 开始智能识别开发插件...');
    
    for (const pluginId of enabledPlugins) {
      // 排除自身
      if (pluginId === 'obsidian-logger') {
        continue;
      }
      
      try {
        const score = await this.calculateScore(pluginId);
        
        // 评分阈值：>= 5 分认为是开发插件
        if (score >= 5) {
          devPlugins.push(pluginId);
          console.log(`[Auto-Reload]   ✅ ${pluginId} - 总分: ${score} 分 → 识别为开发插件`);
        } else {
          console.log(`[Auto-Reload]   ❌ ${pluginId} - 总分: ${score} 分 → 不是开发插件`);
        }
      } catch (error) {
        console.warn(`[Auto-Reload]   ⚠️ ${pluginId} - 识别失败:`, error);
      }
    }
    
    console.log(`[Auto-Reload] 🧠 智能识别完成: 找到 ${devPlugins.length} 个开发插件`);
    return devPlugins;
  }
  
  /**
   * 计算插件的开发特征评分
   * @param pluginId 插件 ID
   * @returns 评分（0-10）
   */
  private async calculateScore(pluginId: string): Promise<number> {
    let score = 0;
    
    try {
      // 使用相对路径
      const mainPath = `.obsidian/plugins/${pluginId}/main.js`;
      
      // 检查文件是否存在
      const adapter = this.app.vault.adapter;
      const exists = await adapter.exists(mainPath);
      
      if (!exists) {
        return 0;
      }
      
      // 特征 1：Source Map 检测（+5分）
      const hasSourceMap = await this.checkSourceMap(mainPath);
      if (hasSourceMap) {
        score += 5;
        console.log(`[Auto-Reload]     ✓ 包含 source map (+5分)`);
      }
      
      // 特征 2：最近修改检测（+3分）
      const isRecentlyModified = await this.checkRecentModification(mainPath);
      if (isRecentlyModified) {
        score += 3;
        console.log(`[Auto-Reload]     ✓ 最近修改过 (+3分)`);
      }
      
      // 特征 3：文件大小检测（+2分）
      const isLargeFile = await this.checkFileSize(mainPath);
      if (isLargeFile) {
        score += 2;
        console.log(`[Auto-Reload]     ✓ 文件较大（未压缩）(+2分)`);
      }
      
    } catch (error) {
      console.error(`[Auto-Reload] 计算评分失败 (${pluginId}):`, error);
    }
    
    return score;
  }
  
  /**
   * 检查文件是否包含 source map
   * @param filePath 文件路径
   * @returns 是否包含 source map
   */
  private async checkSourceMap(filePath: string): Promise<boolean> {
    try {
      const content = await this.app.vault.adapter.read(filePath);
      return content.includes('sourceMappingURL') || content.includes('sourceMapping');
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 检查文件是否在阈值时间内被修改
   * @param filePath 文件路径
   * @returns 是否最近修改
   */
  private async checkRecentModification(filePath: string): Promise<boolean> {
    try {
      const stats = await this.app.vault.adapter.stat(filePath);
      
      if (!stats) {
        return false;
      }
      
      const now = Date.now();
      const hoursSinceModified = (now - stats.mtime) / (1000 * 60 * 60);
      
      return hoursSinceModified < this.smartModeThreshold;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 检查文件是否较大（未压缩）
   * @param filePath 文件路径
   * @returns 是否是大文件
   */
  private async checkFileSize(filePath: string): Promise<boolean> {
    try {
      const stats = await this.app.vault.adapter.stat(filePath);
      
      if (!stats) {
        return false;
      }
      
      // 大于 50KB 认为是未压缩的开发版本
      return stats.size > 50000;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 更新智能模式阈值
   * @param threshold 新的阈值（小时）
   */
  setSmartModeThreshold(threshold: number): void {
    this.smartModeThreshold = threshold;
  }
}


