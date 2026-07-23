import { beforeEach, describe, expect, it } from "vitest";
import { WindowManager } from "../../../src/logic/windowManager.ts";
import type { AppConfig } from "../../../src/types.ts";

const configs: AppConfig[] = [
  {
    id: "whoami",
    defaultTitle: "whoami",
    defaultRect: { x: 10, y: 10, w: 300, h: 200 },
    minSize: { w: 200, h: 150 },
  },
  {
    id: "mail",
    defaultTitle: "mail",
    defaultRect: { x: 50, y: 50, w: 300, h: 200 },
    minSize: { w: 200, h: 150 },
  },
];

describe("WindowManager.open", () => {
  let manager: WindowManager;

  beforeEach(() => {
    manager = new WindowManager(configs);
  });

  it("opens a window at its app's default rect on first spawn", () => {
    manager.open("whoami");
    const [win] = manager.getWindows();
    expect(win).toMatchObject({ id: "whoami", appId: "whoami", x: 10, y: 10, w: 300, h: 200, state: "open" });
  });

  it("does not duplicate a window that is already open", () => {
    manager.open("whoami");
    manager.open("whoami");
    expect(manager.getWindows()).toHaveLength(1);
  });

  it("restores the last moved/resized rect on reopen within the same session", () => {
    manager.open("whoami");
    manager.move("whoami", 999, 888);
    manager.close("whoami");

    manager.open("whoami");
    const [win] = manager.getWindows();
    expect(win.x).toBe(999);
    expect(win.y).toBe(888);
  });

  it("uses the default rect again if the window was never moved before closing", () => {
    manager.open("whoami");
    manager.close("whoami");
    manager.open("whoami");
    const [win] = manager.getWindows();
    expect(win).toMatchObject({ x: 10, y: 10, w: 300, h: 200 });
  });

  it("throws for an unknown appId", () => {
    expect(() => manager.open("does-not-exist" as never)).toThrow();
  });
});

describe("WindowManager.close", () => {
  it("removes the window from getWindows()", () => {
    const manager = new WindowManager(configs);
    manager.open("whoami");
    manager.close("whoami");
    expect(manager.getWindows()).toHaveLength(0);
  });

  it("is a no-op for a window id that isn't open", () => {
    const manager = new WindowManager(configs);
    expect(() => manager.close("whoami")).not.toThrow();
  });
});

describe("WindowManager.subscribe", () => {
  it("notifies listeners on open and close", () => {
    const manager = new WindowManager(configs);
    const calls: number[] = [];
    manager.subscribe((windows) => calls.push(windows.length));

    manager.open("whoami");
    manager.close("whoami");

    expect(calls).toEqual([1, 0]);
  });

  it("stops notifying after unsubscribe", () => {
    const manager = new WindowManager(configs);
    const calls: number[] = [];
    const unsubscribe = manager.subscribe((windows) => calls.push(windows.length));

    unsubscribe();
    manager.open("whoami");

    expect(calls).toEqual([]);
  });
});
