import type { AppId, WindowState } from "../../types.ts";
import type { MobileView } from "../../logic/bootModeNav.ts";
import type { ContentRenderer } from "../windowChrome.ts";
import { mountDesktopIcons } from "../desktop/icons.ts";
import { renderTaskbar, type TaskbarHandlers } from "../desktop/taskbar.ts";

// Keep this literal in sync with the media query in styles/mobile.css.
export const MOBILE_MAX_WIDTH_PX = 768;

export function isMobileViewport(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
}

export interface BootModeHandlers {
  onLaunch: (appId: AppId) => void; // home-grid tap: open app fullscreen
  onBack: () => void; // app-bar back: minimize + go home
  onDockClick: (windowId: string) => void; // dock tap: focus/restore or go home
}

// Private per-window content cache: each window's ContentRenderer runs once,
// exactly like windowChrome.ts, so scroll position and app-internal DOM survive
// navigation between home and app views.
const contentEls = new Map<string, HTMLElement>();

let shellBuilt = false;
let clockEl: HTMLElement;
let homeEl: HTMLElement;
let appViewEl: HTMLElement;
let appTitleEl: HTMLElement;
let appContentHostEl: HTMLElement;
let dockEl: HTMLElement;

export function renderMobile(
  root: HTMLElement,
  view: MobileView,
  windows: WindowState[],
  renderContent: ContentRenderer,
  handlers: BootModeHandlers,
): void {
  ensureShell(root, handlers);
  renderStatusBar();
  syncContentCache(windows, renderContent);

  if (view.kind === "home") {
    homeEl.style.display = "grid";
    appViewEl.style.display = "none";
  } else {
    homeEl.style.display = "none";
    appViewEl.style.display = "flex";
    showAppContent(view.windowId, windows);
  }

  renderDock(windows, handlers);
}

function ensureShell(root: HTMLElement, handlers: BootModeHandlers): void {
  if (shellBuilt) return;
  root.innerHTML = "";

  // Status bar (visible in both views).
  const statusBar = document.createElement("div");
  statusBar.className = "mobile-statusbar";
  clockEl = document.createElement("span");
  clockEl.className = "mobile-clock";
  const avail = document.createElement("span");
  avail.className = "mobile-availability";
  avail.textContent = "open to opportunities";
  statusBar.append(clockEl, avail);

  // Home: launcher icon grid, the exact same mount function Phase 1 uses for
  // the desktop icon grid - same markup, same click-opens-app behavior, styled
  // differently only via the `.mobile-home .desktop-icon` CSS override.
  homeEl = document.createElement("div");
  homeEl.className = "mobile-home";
  mountDesktopIcons(homeEl, (appId) => handlers.onLaunch(appId));

  // Fullscreen app view: app bar (back + title) over a scrollable host.
  appViewEl = document.createElement("div");
  appViewEl.className = "mobile-appview";
  appViewEl.style.display = "none";

  const appBar = document.createElement("div");
  appBar.className = "mobile-appbar";
  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "mobile-back";
  backBtn.setAttribute("aria-label", "Back to home");
  backBtn.textContent = "Back";
  backBtn.addEventListener("click", () => handlers.onBack());
  appTitleEl = document.createElement("span");
  appTitleEl.className = "mobile-apptitle";
  appBar.append(backBtn, appTitleEl);

  appContentHostEl = document.createElement("div");
  appContentHostEl.className = "mobile-appcontent";
  appViewEl.append(appBar, appContentHostEl);

  // Dock: bottom row of open/minimized app icons.
  dockEl = document.createElement("div");
  dockEl.className = "mobile-dock";

  root.append(statusBar, homeEl, appViewEl, dockEl);
  shellBuilt = true;
}

function renderStatusBar(): void {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function syncContentCache(windows: WindowState[], renderContent: ContentRenderer): void {
  const present = new Set(windows.map((w) => w.id));
  for (const [id, el] of contentEls) {
    if (!present.has(id)) {
      el.remove();
      contentEls.delete(id);
    }
  }
  for (const win of windows) {
    if (!contentEls.has(win.id)) {
      const el = document.createElement("div");
      el.className = "mobile-appcontent__inner";
      renderContent(win, el); // Phase 2 ContentRenderer, called once per window
      contentEls.set(win.id, el);
    }
  }
}

function showAppContent(windowId: string, windows: WindowState[]): void {
  const win = windows.find((w) => w.id === windowId);
  appTitleEl.textContent = win ? win.title : "";

  for (const child of Array.from(appContentHostEl.children)) {
    (child as HTMLElement).style.display = "none";
  }

  const el = contentEls.get(windowId);
  if (!el) return; // window not open (e.g. transient state); host stays empty
  if (el.parentElement !== appContentHostEl) appContentHostEl.appendChild(el);
  el.style.display = "block";
}

function renderDock(windows: WindowState[], handlers: BootModeHandlers): void {
  const docked = windows.filter((w) => w.state === "open" || w.state === "minimized");
  const dockHandlers: TaskbarHandlers = {
    onFocus: (id) => handlers.onDockClick(id),
    onMinimize: (id) => handlers.onDockClick(id),
  };
  renderTaskbar(dockEl, windows, dockHandlers);
  dockEl.style.display = docked.length > 0 ? "flex" : "none";
}
