import type { AppId, WindowState } from "../types.ts";

export type WindowKeyAction =
  | "close-focused"
  | "cycle-focus"
  | "projects-back"
  | "none";

export interface KeyContext {
  key: string; // KeyboardEvent.key, e.g. "Escape", "Tab", "Backspace"
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  focusedAppId: AppId | null; // appId of the currently focused window, null if none
  activeElementIsTextEntry: boolean; // document.activeElement is an input/textarea/contenteditable
}

export function resolveWindowKeyAction(ctx: KeyContext): WindowKeyAction {
  // Window-level focus cycling: modifier + Tab only. Plain Tab is left to the browser
  // so in-window form fields (mail To/Subject/Body) keep their native tab order.
  if (ctx.key === "Tab" && (ctx.altKey || ctx.ctrlKey)) {
    return "cycle-focus";
  }

  // Esc closes the focused window (no-op if nothing is focused).
  if (ctx.key === "Escape") {
    return ctx.focusedAppId ? "close-focused" : "none";
  }

  // Backspace -> projects back, but ONLY when the projects window is focused AND focus is
  // not inside a text field. This avoids hijacking browser back-navigation or an unrelated
  // focused window.
  if (
    ctx.key === "Backspace" &&
    ctx.focusedAppId === "projects" &&
    !ctx.activeElementIsTextEntry
  ) {
    return "projects-back";
  }

  return "none";
}

// Back-most open window so repeated cycle presses rotate through every open window and
// come back around. Minimized windows are skipped (restore them via the taskbar).
export function pickCycleFocusTarget(windows: WindowState[]): string | null {
  const open = windows.filter((w) => w.state === "open");
  if (open.length < 2) return null;
  return open.reduce((back, w) => (w.zIndex < back.zIndex ? w : back)).id;
}
