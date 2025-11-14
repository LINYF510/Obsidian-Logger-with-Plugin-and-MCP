/**
 * 共享工具函数
 */

/**
 * 格式化文件大小（字节转换为可读格式）
 * @param bytes 字节数
 * @returns 格式化后的字符串（如 "1.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 安全的 JSON 序列化（处理循环引用）
 * @param obj 要序列化的对象
 * @param maxDepth 最大深度（默认 3）
 * @returns 序列化后的字符串
 */
export function safeStringify(obj: any, maxDepth: number = 3): string {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: any, depth: number = 0): any => {
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }
    
    if (value === null || value === undefined) {
      return value;
    }
    
    if (typeof value === 'object') {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
      
      if (Array.isArray(value)) {
        return value.map((item, index) => 
          replacer(String(index), item, depth + 1)
        );
      }
      
      const result: any = {};
      for (const k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          result[k] = replacer(k, value[k], depth + 1);
        }
      }
      return result;
    }
    
    return value;
  };
  
  try {
    return JSON.stringify(obj, (key, value) => replacer(key, value));
  } catch (error) {
    return '[Stringify Error]';
  }
}

/**
 * 截断字符串到指定长度
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @returns 截断后的字符串
 */
export function truncateString(str: string, maxLength: number = 1000): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '... [truncated]';
}

/**
 * 通配符匹配
 * 支持简单的通配符模式：* 匹配任意字符
 * 
 * @param filename 文件名
 * @param pattern 匹配模式（支持 * 通配符）
 * @returns 是否匹配
 * 
 * @example
 * matchPattern('data.json', 'data.json')     // true
 * matchPattern('config.json', '*.json')      // true
 * matchPattern('en.json', 'lang/*.json')     // false (lang/ 目录下)
 * matchPattern('lang/en.json', 'lang/*.json') // true
 */
export function matchPattern(filename: string, pattern: string): boolean {
  // 精确匹配
  if (filename === pattern) {
    return true;
  }
  
  // 如果模式不包含通配符，进行精确匹配
  if (!pattern.includes('*')) {
    return filename === pattern;
  }
  
  // 将通配符模式转换为正则表达式
  // 转义正则表达式特殊字符
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')  // 转义特殊字符
    .replace(/\*/g, '.*');                   // * 替换为 .*
  
  const regex = new RegExp(`^${escapedPattern}$`);
  return regex.test(filename);
}

/**
 * 获取监控的文件列表
 * 
 * @param fileTypes 文件类型配置
 * @returns 文件名数组
 */
export function getWatchedFileList(fileTypes: import('./types').WatchedFileTypes): string[] {
  const files: string[] = [];
  
  // main.js 必选
  if (fileTypes.main) {
    files.push('main.js');
  }
  
  // manifest.json 可选
  if (fileTypes.manifest) {
    files.push('manifest.json');
  }
  
  // styles.css 可选
  if (fileTypes.styles) {
    files.push('styles.css');
  }
  
  // 自定义文件
  if (fileTypes.custom && fileTypes.custom.length > 0) {
    files.push(...fileTypes.custom);
  }
  
  return files;
}

