import type { WindowState } from "../types.ts";

export type TaskbarAction = "focus" | "minimize";

export function decideTaskbarClickAction(win: WindowState): TaskbarAction {
  if (win.state === "minimized") return "focus";
  if (win.isFocused) return "minimize";
  return "focus";
}
