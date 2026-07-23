import "./styles/window.css";
import { WindowManager } from "./logic/windowManager.ts";
import { APP_CONFIGS } from "./data/apps.ts";
import { renderWindows, type ContentRenderer } from "./ui/windowChrome.ts";
import { createDragResizeController } from "./ui/dragResize.ts";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing");

const manager = new WindowManager(APP_CONFIGS);
const controller = createDragResizeController(manager);

const renderPlaceholderContent: ContentRenderer = (win, el) => {
  el.textContent = `${win.appId} content goes here (wired in Phase 2)`;
};

function render(): void {
  renderWindows(root!, manager.getWindows(), renderPlaceholderContent, {
    onTitlebarPointerDown: controller.onTitlebarPointerDown,
    onResizeHandlePointerDown: controller.onResizeHandlePointerDown,
    onFocus: (id) => manager.focus(id),
    onClose: (id) => manager.close(id),
    onMinimize: (id) => manager.minimize(id),
  });
}

manager.subscribe(render);
manager.open("whoami");
render();

// TEMPORARY - remove once Phase 1 desktop icons exist
(window as unknown as { openApp: typeof manager.open }).openApp = manager.open.bind(manager);
