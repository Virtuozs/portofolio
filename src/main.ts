import "./styles/base.css";
import "./styles/window.css";
import "./styles/desktop.css";
import "./styles/apps.css";
import "./styles/animations.css";
import "./styles/mobile.css";
import { WindowManager } from "./logic/windowManager.ts";
import { APP_CONFIGS } from "./data/apps.ts";
import { WALLPAPERS } from "./data/wallpapers.ts";
import { renderWindows, type ContentRenderer } from "./ui/windowChrome.ts";
import { createDragResizeController } from "./ui/dragResize.ts";
import { mountDesktopIcons } from "./ui/desktop/icons.ts";
import { renderTaskbar } from "./ui/desktop/taskbar.ts";
import { mountStatusBar } from "./ui/desktop/statusBar.ts";
import { initWallpaper, applyWallpaper } from "./ui/desktop/wallpaper.ts";
import { mountContextMenu } from "./ui/desktop/contextMenu.ts";
import type { AppId } from "./types.ts";
import { renderWhoami } from "./ui/apps/whoami.ts";
import { renderPackages } from "./ui/apps/packages.ts";
import { renderMail } from "./ui/apps/mail.ts";
import { createProjectsRenderer } from "./ui/apps/projects.ts";
import { renderMdViewer } from "./ui/apps/mdViewer.ts";
import { createImageViewerRenderer } from "./ui/apps/imageViewer.ts";
import { createWindowAnimator } from "./ui/animate.ts";
import {
  renderMobile,
  isMobileViewport,
  MOBILE_MAX_WIDTH_PX,
  type BootModeHandlers,
} from "./ui/mobile/bootMode.ts";
import { openAppMobile, goBackMobile, type MobileView } from "./logic/bootModeNav.ts";

const desktopRoot = document.getElementById("desktop");
const wallpaperRoot = document.getElementById("wallpaper");
const iconsRoot = document.getElementById("icons");
const windowsRoot = document.getElementById("app");
const taskbarRoot = document.getElementById("taskbar");
const statusbarRoot = document.getElementById("statusbar");
const mobileRoot = document.getElementById("mobile-root");

if (
  !desktopRoot ||
  !wallpaperRoot ||
  !iconsRoot ||
  !windowsRoot ||
  !taskbarRoot ||
  !statusbarRoot ||
  !mobileRoot
) {
  throw new Error("desktop/mobile root elements missing");
}

const manager = new WindowManager(APP_CONFIGS);
const controller = createDragResizeController(manager);
const animator = createWindowAnimator();

const renderers: Record<AppId, ContentRenderer> = {
  "whoami": renderWhoami,
  "packages": renderPackages,
  "mail": renderMail,
  "projects": createProjectsRenderer(manager),
  "md-viewer": renderMdViewer,
  "image-viewer": createImageViewerRenderer(manager),
};

const renderContentForApp: ContentRenderer = (win, el) => {
  renderers[win.appId](win, el);
};

// Mobile navigation state. whoami is the hero on both platforms.
let view: MobileView = { kind: "app", windowId: "whoami" };

const mobileHandlers: BootModeHandlers = {
  onLaunch: (appId: AppId) => {
    manager.open(appId); // windowId defaults to appId for launchers
    view = openAppMobile(view, appId);
    render();
  },
  onBack: () => {
    if (view.kind === "app") manager.minimize(view.windowId); // preserve state
    view = goBackMobile(view);
    render();
  },
  onDockClick: (windowId: string) => {
    // The dock is Phase 1's renderTaskbar remounted, so a tap already went
    // through decideTaskbarClickAction once to choose onFocus vs onMinimize
    // before landing here as a plain windowId. Re-derive the same decision
    // from current WindowManager state to decide what MobileView should do:
    // the focused window minimizing means "leave it" (-> home); anything
    // else focusing means "show it" (-> that app's fullscreen view).
    const win = manager.getWindows().find((w) => w.id === windowId);
    if (!win) return;
    if (win.isFocused) {
      manager.minimize(windowId);
      view = goBackMobile(view);
    } else {
      manager.focus(windowId); // restores minimized + focuses
      view = openAppMobile(view, windowId);
    }
    render();
  },
};

function render(): void {
  const windows = manager.getWindows();
  if (isMobileViewport()) {
    renderMobile(mobileRoot!, view, windows, renderContentForApp, mobileHandlers);
  } else {
    renderWindows(
      windowsRoot!,
      windows,
      renderContentForApp,
      {
        onTitlebarPointerDown: controller.onTitlebarPointerDown,
        onResizeHandlePointerDown: controller.onResizeHandlePointerDown,
        onFocus: (id) => manager.focus(id),
        onClose: (id) => manager.close(id),
        onMinimize: (id) => manager.minimize(id),
      },
      animator,
    );
    renderTaskbar(taskbarRoot!, windows, {
      onFocus: (id) => manager.focus(id),
      onMinimize: (id) => manager.minimize(id),
    });
  }
}

// Persistent chrome mounted once.
mountDesktopIcons(iconsRoot, (appId) => manager.open(appId));
mountStatusBar(statusbarRoot);
initWallpaper(wallpaperRoot, WALLPAPERS);
mountContextMenu(desktopRoot, WALLPAPERS, (path) => applyWallpaper(wallpaperRoot!, path));

manager.subscribe(render);

// Re-branch live when the viewport crosses the breakpoint.
window
  .matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`)
  .addEventListener("change", render);

manager.open("whoami"); // hero on both platforms
render();
