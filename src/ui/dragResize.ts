import type { WindowManager } from "../logic/windowManager.ts";
import { applyResize, clampDragPosition, type ResizeHandle } from "../logic/geometry.ts";
import type { Rect } from "../types.ts";

interface DragSession {
  windowId: string;
  startPointerX: number;
  startPointerY: number;
  startRect: Rect;
}

interface ResizeSession extends DragSession {
  handle: ResizeHandle;
}

export function createDragResizeController(manager: WindowManager) {
  let drag: DragSession | null = null;
  let resize: ResizeSession | null = null;

  function getViewport() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function onTitlebarPointerDown(windowId: string, e: PointerEvent): void {
    const win = manager.getWindows().find((w) => w.id === windowId);
    if (!win) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag = {
      windowId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRect: { x: win.x, y: win.y, w: win.w, h: win.h },
    };
  }

  function onResizeHandlePointerDown(windowId: string, handle: string, e: PointerEvent): void {
    const win = manager.getWindows().find((w) => w.id === windowId);
    if (!win) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resize = {
      windowId,
      handle: handle as ResizeHandle,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRect: { x: win.x, y: win.y, w: win.w, h: win.h },
    };
  }

  function onPointerMove(e: PointerEvent): void {
    if (drag) {
      const dx = e.clientX - drag.startPointerX;
      const dy = e.clientY - drag.startPointerY;
      const proposed: Rect = { ...drag.startRect, x: drag.startRect.x + dx, y: drag.startRect.y + dy };
      const clamped = clampDragPosition(proposed, getViewport());
      manager.move(drag.windowId, clamped.x, clamped.y);
    }

    if (resize) {
      const dx = e.clientX - resize.startPointerX;
      const dy = e.clientY - resize.startPointerY;
      const win = manager.getWindows().find((w) => w.id === resize!.windowId);
      if (!win) return;
      const nextRect = applyResize(resize.startRect, resize.handle, dx, dy, win.minSize);
      manager.resize(resize.windowId, nextRect);
    }
  }

  function onPointerUp(): void {
    drag = null;
    resize = null;
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  return { onTitlebarPointerDown, onResizeHandlePointerDown };
}
