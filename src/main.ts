import "./styles/base.css";
import "./styles/window.css";
import "./styles/desktop.css";
import "./styles/apps.css";
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

const desktopRoot = document.getElementById("desktop");
const wallpaperRoot = document.getElementById("wallpaper");
const iconsRoot = document.getElementById("icons");
const windowsRoot = document.getElementById("app");
const taskbarRoot = document.getElementById("taskbar");
const statusbarRoot = document.getElementById("statusbar");

if (!desktopRoot || !wallpaperRoot || !iconsRoot || !windowsRoot || !taskbarRoot || !statusbarRoot) {
  throw new Error("desktop root elements missing");
}

const manager = new WindowManager(APP_CONFIGS);
const controller = createDragResizeController(manager);

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

function render(): void {
  const windows = manager.getWindows();
  renderWindows(windowsRoot!, windows, renderContentForApp, {
    onTitlebarPointerDown: controller.onTitlebarPointerDown,
    onResizeHandlePointerDown: controller.onResizeHandlePointerDown,
    onFocus: (id) => manager.focus(id),
    onClose: (id) => manager.close(id),
    onMinimize: (id) => manager.minimize(id),
  });
  renderTaskbar(taskbarRoot!, windows, {
    onFocus: (id) => manager.focus(id),
    onMinimize: (id) => manager.minimize(id),
  });
}

// Persistent chrome mounted once.
mountDesktopIcons(iconsRoot, (appId) => manager.open(appId));
mountStatusBar(statusbarRoot);
initWallpaper(wallpaperRoot, WALLPAPERS);
mountContextMenu(desktopRoot, WALLPAPERS, (path) => applyWallpaper(wallpaperRoot!, path));

manager.subscribe(render);
manager.open("whoami"); // auto-open on load, per spec §4 (preserved from Phase 0)
render();
