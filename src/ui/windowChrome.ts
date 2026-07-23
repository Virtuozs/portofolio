import type { WindowState } from "../types.ts";
import { TITLEBAR_HEIGHT_PX } from "../logic/geometry.ts";

export type ContentRenderer = (win: WindowState, contentEl: HTMLElement) => void;

export interface WindowChromeHandlers {
  onTitlebarPointerDown: (id: string, e: PointerEvent) => void;
  onResizeHandlePointerDown: (id: string, handle: string, e: PointerEvent) => void;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
}

const RESIZE_HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

const mounted = new Map<string, HTMLElement>();

export function renderWindows(
  root: HTMLElement,
  windows: WindowState[],
  renderContent: ContentRenderer,
  handlers: WindowChromeHandlers,
): void {
  const seen = new Set(windows.map((w) => w.id));

  for (const [id, el] of mounted) {
    if (!seen.has(id)) {
      el.remove();
      mounted.delete(id);
    }
  }

  for (const win of windows) {
    let el = mounted.get(win.id);
    if (!el) {
      el = buildWindowElement(win, renderContent, handlers);
      mounted.set(win.id, el);
      root.appendChild(el);
    }
    updateWindowElement(el, win);
  }
}

function buildWindowElement(
  win: WindowState,
  renderContent: ContentRenderer,
  handlers: WindowChromeHandlers,
): HTMLElement {
  const el = document.createElement("div");
  el.className = "window";
  el.dataset.windowId = win.id;
  el.addEventListener("pointerdown", () => handlers.onFocus(win.id));

  const titlebar = document.createElement("div");
  titlebar.className = "window__titlebar";
  titlebar.style.height = `${TITLEBAR_HEIGHT_PX}px`;
  titlebar.addEventListener("pointerdown", (e) => handlers.onTitlebarPointerDown(win.id, e));

  const title = document.createElement("span");
  title.className = "window__title";
  titlebar.appendChild(title);

  const minimizeBtn = document.createElement("button");
  minimizeBtn.type = "button";
  minimizeBtn.className = "window__minimize";
  minimizeBtn.setAttribute("aria-label", "Minimize");
  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handlers.onMinimize(win.id);
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "window__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handlers.onClose(win.id);
  });

  titlebar.append(minimizeBtn, closeBtn);

  const content = document.createElement("div");
  content.className = "window__content";
  renderContent(win, content);

  const body = document.createElement("div");
  body.className = "window__body";
  body.append(titlebar, content);
  el.append(body);

  for (const handle of RESIZE_HANDLES) {
    const handleEl = document.createElement("div");
    handleEl.className = `window__resize-handle window__resize-handle--${handle}`;
    handleEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      handlers.onResizeHandlePointerDown(win.id, handle, e);
    });
    el.appendChild(handleEl);
  }

  return el;
}

function updateWindowElement(el: HTMLElement, win: WindowState): void {
  el.style.transform = `translate(${win.x}px, ${win.y}px)`;
  el.style.width = `${win.w}px`;
  el.style.height = `${win.h}px`;
  el.style.zIndex = String(win.zIndex);
  el.style.display = win.state === "minimized" ? "none" : "flex";
  el.classList.toggle("window--focused", win.isFocused);

  const titleEl = el.querySelector<HTMLElement>(".window__title");
  if (titleEl) titleEl.textContent = win.title;
}
