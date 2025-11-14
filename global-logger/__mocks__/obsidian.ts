/**
 * Obsidian API Mock
 * 用于单元测试
 */

export class App {
  vault = {
    adapter: {
      basePath: '/mock/vault/path',
      async stat(path: string) {
        return { mtime: Date.now(), size: 0 };
      },
      async read(path: string) {
        return '';
      },
      async write(path: string, data: string) {
        return;
      },
      async append(path: string, data: string) {
        return;
      },
      async mkdir(path: string) {
        return;
      },
      async exists(path: string) {
        return true;
      },
      async rename(oldPath: string, newPath: string) {
        return;
      }
    }
  };

  plugins = {
    plugins: {} as Record<string, any>,
    enabledPlugins: new Set<string>(),
    async enablePlugin(id: string) {
      this.enabledPlugins.add(id);
    },
    async disablePlugin(id: string) {
      this.enabledPlugins.delete(id);
    }
  };
}

export class Plugin {
  app: App;
  manifest: {
    id: string;
    name: string;
    version: string;
  };

  constructor() {
    this.app = new App();
    this.manifest = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0'
    };
  }

  async loadData(): Promise<any> {
    return {};
  }

  async saveData(data: any): Promise<void> {
    return;
  }

  addCommand(command: any): void {
    return;
  }

  addSettingTab(tab: any): void {
    return;
  }

  registerInterval(id: number): number {
    return id;
  }
}

export class Notice {
  constructor(message: string, timeout?: number) {
    // Mock notice
  }
}

export class Setting {
  private containerEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
  }

  setName(name: string): this {
    return this;
  }

  setDesc(desc: string): this {
    return this;
  }

  addText(cb: (text: any) => void): this {
    cb({
      setPlaceholder: () => ({ setValue: () => ({ onChange: () => ({}) }) }),
      setValue: () => ({ onChange: () => ({}) }),
      onChange: () => ({})
    });
    return this;
  }

  addToggle(cb: (toggle: any) => void): this {
    cb({
      setValue: () => ({ onChange: () => ({}) }),
      onChange: () => ({})
    });
    return this;
  }

  addButton(cb: (button: any) => void): this {
    cb({
      setButtonText: () => ({ onClick: () => ({}) }),
      onClick: () => ({})
    });
    return this;
  }

  addDropdown(cb: (dropdown: any) => void): this {
    cb({
      addOption: () => ({ setValue: () => ({ onChange: () => ({}) }) }),
      setValue: () => ({ onChange: () => ({}) }),
      onChange: () => ({})
    });
    return this;
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }

  display(): void {
    // Override in subclass
  }

  hide(): void {
    // Override in subclass
  }
}

