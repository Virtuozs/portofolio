import { describe, expect, it } from "vitest";
import { decideTaskbarClickAction } from "../../../src/logic/taskbarActions.ts";
import type { WindowState } from "../../../src/types.ts";

function makeWindow(overrides: Partial<WindowState>): WindowState {
  return {
    id: "whoami",
    appId: "whoami",
    title: "whoami",
    x: 0,
    y: 0,
    w: 300,
    h: 200,
    zIndex: 0,
    state: "open",
    isFocused: false,
    minSize: { w: 200, h: 150 },
    ...overrides,
  };
}

describe("decideTaskbarClickAction", () => {
  it("restores (focuses) a minimized window", () => {
    const win = makeWindow({ state: "minimized", isFocused: false });
    expect(decideTaskbarClickAction(win)).toBe("focus");
  });

  it("minimizes an open window that is currently focused", () => {
    const win = makeWindow({ state: "open", isFocused: true });
    expect(decideTaskbarClickAction(win)).toBe("minimize");
  });

  it("focuses an open window that is not currently focused", () => {
    const win = makeWindow({ state: "open", isFocused: false });
    expect(decideTaskbarClickAction(win)).toBe("focus");
  });
});
