import type { WindowState } from "../../types.ts";
import { decideTaskbarClickAction } from "../../logic/taskbarActions.ts";

export interface TaskbarHandlers {
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
}

export function renderTaskbar(
  root: HTMLElement,
  windows: WindowState[],
  handlers: TaskbarHandlers,
): void {
  const listed = windows.filter((w) => w.state === "open" || w.state === "minimized");

  root.replaceChildren();

  for (const win of listed) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "taskbar-item";
    button.classList.toggle("taskbar-item--focused", win.isFocused);
    button.classList.toggle("taskbar-item--minimized", win.state === "minimized");
    button.dataset.windowId = win.id;
    button.textContent = win.title;

    button.addEventListener("click", () => {
      const action = decideTaskbarClickAction(win);
      if (action === "minimize") handlers.onMinimize(win.id);
      else handlers.onFocus(win.id);
    });

    root.appendChild(button);
  }
}

export function getTaskbarEntryScreenRect(windowId: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`.taskbar-item[data-window-id="${windowId}"]`);
  return el ? el.getBoundingClientRect() : null;
}
