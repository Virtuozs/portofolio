import type { WindowManager } from "../logic/windowManager.ts";
import {
  resolveWindowKeyAction,
  pickCycleFocusTarget,
  type KeyContext,
} from "../logic/keyboardActions.ts";

function isTextEntry(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
}

export function installGlobalKeyboard(
  manager: WindowManager,
  projectsBack: () => void,
): () => void {
  function onKeyDown(e: KeyboardEvent): void {
    const windows = manager.getWindows();
    const focused = windows.find((w) => w.isFocused) ?? null;

    const ctx: KeyContext = {
      key: e.key,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      focusedAppId: focused ? focused.appId : null,
      activeElementIsTextEntry: isTextEntry(document.activeElement),
    };

    const action = resolveWindowKeyAction(ctx);
    if (action === "none") return;

    switch (action) {
      case "close-focused":
        if (focused) manager.close(focused.id);
        e.preventDefault();
        break;
      case "cycle-focus": {
        const target = pickCycleFocusTarget(windows);
        if (target) {
          manager.focus(target);
          const el = document.querySelector<HTMLElement>(`[data-window-id="${target}"]`);
          el?.focus({ preventScroll: true });
        }
        e.preventDefault(); // stop the browser's own Ctrl/Alt+Tab tab-switch where interceptable
        break;
      }
      case "projects-back":
        projectsBack();
        e.preventDefault(); // stop browser back-navigation
        break;
    }
  }

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}
