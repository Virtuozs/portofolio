import { describe, expect, it } from "vitest";
import {
  resolveWindowKeyAction,
  pickCycleFocusTarget,
  type KeyContext,
} from "../../../src/logic/keyboardActions.ts";
import type { WindowState } from "../../../src/types.ts";

function ctx(overrides: Partial<KeyContext>): KeyContext {
  return {
    key: "",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    focusedAppId: null,
    activeElementIsTextEntry: false,
    ...overrides,
  };
}

describe("resolveWindowKeyAction", () => {
  it("closes the focused window on Escape when a window is focused", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Escape", focusedAppId: "mail" })))
      .toBe("close-focused");
  });

  it("does nothing on Escape when no window is focused", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Escape", focusedAppId: null })))
      .toBe("none");
  });

  it("cycles window focus on Alt+Tab", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Tab", altKey: true, focusedAppId: "whoami" })))
      .toBe("cycle-focus");
  });

  it("cycles window focus on Ctrl+Tab", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Tab", ctrlKey: true, focusedAppId: "whoami" })))
      .toBe("cycle-focus");
  });

  it("does NOT act on plain Tab (must stay available for in-window form navigation)", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Tab", focusedAppId: "mail" })))
      .toBe("none");
  });

  it("goes back on Backspace only when projects is focused and no text entry is active", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Backspace", focusedAppId: "projects" })))
      .toBe("projects-back");
  });

  it("does NOT hijack Backspace when the focused window is not projects", () => {
    expect(resolveWindowKeyAction(ctx({ key: "Backspace", focusedAppId: "mail" })))
      .toBe("none");
  });

  it("does NOT hijack Backspace when a text input is focused (defensive)", () => {
    expect(resolveWindowKeyAction(ctx({
      key: "Backspace", focusedAppId: "projects", activeElementIsTextEntry: true,
    }))).toBe("none");
  });
});

describe("pickCycleFocusTarget", () => {
  const win = (id: string, zIndex: number, state: WindowState["state"]): WindowState => ({
    id, appId: "whoami", title: id, x: 0, y: 0, w: 1, h: 1,
    zIndex, state, isFocused: false, minSize: { w: 1, h: 1 },
  });

  it("returns the back-most open window so repeated presses rotate through all", () => {
    const windows = [win("a", 0, "open"), win("b", 1, "open"), win("c", 2, "open")];
    expect(pickCycleFocusTarget(windows)).toBe("a");
  });

  it("ignores minimized windows", () => {
    const windows = [win("a", 0, "minimized"), win("b", 1, "open"), win("c", 2, "open")];
    expect(pickCycleFocusTarget(windows)).toBe("b");
  });

  it("returns null when fewer than two windows are open (nothing to cycle)", () => {
    expect(pickCycleFocusTarget([win("a", 0, "open")])).toBeNull();
    expect(pickCycleFocusTarget([])).toBeNull();
  });
});
