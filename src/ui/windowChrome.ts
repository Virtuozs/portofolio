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

export interface WindowAnimator {
  // Called once, when a brand-new window element is created and appended.
  onOpen: (el: HTMLElement, win: WindowState) => void;
  // Called when a window id has left the array. MUST call done() to remove the node.
  onClose: (el: HTMLElement, done: () => void) => void;
  // Called when a window transitions into "minimized". MUST call done() to hide it.
  onMinimize: (el: HTMLElement, done: () => void) => void;
}

const RESIZE_HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

const mounted = new Map<string, HTMLElement>();

export function renderWindows(
  root: HTMLElement,
  windows: WindowState[],
  renderContent: ContentRenderer,
  handlers: WindowChromeHandlers,
  animator?: WindowAnimator,
): void {
  const seen = new Set(windows.map((w) => w.id));

  for (const [id, el] of mounted) {
    if (!seen.has(id)) {
      // Detach from the mounted map immediately so a re-open mints a fresh node,
      // but defer the actual DOM removal until the close animation finishes.
      mounted.delete(id);
      if (animator) {
        animator.onClose(el, () => el.remove());
      } else {
        el.remove(); // Phase 0 behavior preserved when no animator is supplied
      }
    }
  }

  for (const win of windows) {
    let el = mounted.get(win.id);
    if (!el) {
      el = buildWindowElement(win, renderContent, handlers);
      mounted.set(win.id, el);
      root.appendChild(el);
      if (animator) animator.onOpen(el, win); // fires exactly on fresh open
    }
    updateWindowElement(el, win, animator);
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
  el.dataset.appId = win.appId; // animate.ts reads this to find the icon on close
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

function updateWindowElement(el: HTMLElement, win: WindowState, animator?: WindowAnimator): void {
  el.style.transform = `translate(${win.x}px, ${win.y}px)`;
  el.style.width = `${win.w}px`;
  el.style.height = `${win.h}px`;
  el.style.zIndex = String(win.zIndex);
  el.classList.toggle("window--focused", win.isFocused);

  const titleEl = el.querySelector<HTMLElement>(".window__title");
  if (titleEl) titleEl.textContent = win.title;

  const prev = el.dataset.lifecycle;

  if (win.state === "minimized" && prev !== "minimized") {
    // Transition INTO minimized: play the slide, then hide.
    el.dataset.lifecycle = "minimized";
    if (animator) {
      el.dataset.animating = "1";
      animator.onMinimize(el, () => {
        delete el.dataset.animating;
        el.style.display = "none";
      });
    } else {
      el.style.display = "none"; // Phase 0 behavior preserved
    }
  } else if (win.state === "minimized") {
    // Already minimized on an earlier render: stay hidden, unless mid-animation.
    if (!el.dataset.animating) el.style.display = "none";
  } else {
    // Open (including restore-from-minimized -> instant show, per this phase's [DECISION]).
    el.dataset.lifecycle = win.state;
    el.style.display = "flex";
  }
}
