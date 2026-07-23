import type { AppConfig, AppId, Rect, WindowState } from "../types.ts";

type Listener = (windows: WindowState[]) => void;

export class WindowManager {
  private windows: WindowState[] = [];
  private sessionMemory = new Map<string, Rect>();
  private listeners = new Set<Listener>();
  private configs: Map<AppId, AppConfig>;

  constructor(configs: AppConfig[]) {
    this.configs = new Map(configs.map((c) => [c.id, c]));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getWindows(): WindowState[] {
    return this.windows.map((w) => ({ ...w }));
  }

  open(appId: AppId, windowId: string = appId, title?: string): void {
    const existing = this.windows.find((w) => w.id === windowId);
    if (existing) {
      this.focus(windowId);
      return;
    }

    const config = this.configs.get(appId);
    if (!config) throw new Error(`Unknown appId: ${appId}`);

    const remembered = this.sessionMemory.get(windowId);
    const rect = remembered ?? config.defaultRect;

    const win: WindowState = {
      id: windowId,
      appId,
      title: title ?? config.defaultTitle,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      zIndex: 0,
      state: "open",
      isFocused: false,
      minSize: config.minSize,
    };

    this.windows.push(win);
    this.reassignZIndexAndFocus();
    this.emit();
  }

  close(windowId: string): void {
    const index = this.windows.findIndex((w) => w.id === windowId);
    if (index === -1) return;

    const [win] = this.windows.splice(index, 1);
    this.sessionMemory.set(windowId, { x: win.x, y: win.y, w: win.w, h: win.h });
    this.reassignZIndexAndFocus();
    this.emit();
  }

  focus(windowId: string): void {
    const index = this.windows.findIndex((w) => w.id === windowId);
    if (index === -1) return;

    const [win] = this.windows.splice(index, 1);
    win.state = "open";
    this.windows.push(win);
    this.reassignZIndexAndFocus();
    this.emit();
  }

  minimize(windowId: string): void {
    const win = this.windows.find((w) => w.id === windowId);
    if (!win) return;

    win.state = "minimized";
    this.reassignZIndexAndFocus();
    this.emit();
  }

  move(windowId: string, x: number, y: number): void {
    const win = this.windows.find((w) => w.id === windowId);
    if (!win) return;

    win.x = x;
    win.y = y;
    this.sessionMemory.set(windowId, { x: win.x, y: win.y, w: win.w, h: win.h });
    this.emit();
  }

  resize(windowId: string, rect: Rect): void {
    const win = this.windows.find((w) => w.id === windowId);
    if (!win) return;

    win.x = rect.x;
    win.y = rect.y;
    win.w = rect.w;
    win.h = rect.h;
    this.sessionMemory.set(windowId, rect);
    this.emit();
  }

  private reassignZIndexAndFocus(): void {
    this.windows.forEach((win, index) => {
      win.zIndex = index;
      win.isFocused = index === this.windows.length - 1 && win.state === "open";
    });
  }

  private emit(): void {
    const snapshot = this.getWindows();
    for (const listener of this.listeners) listener(snapshot);
  }
}
