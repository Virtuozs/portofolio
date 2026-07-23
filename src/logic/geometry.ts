import type { Rect, Size } from "../types.ts";

export const MIN_TITLEBAR_VISIBLE_PX = 80;
export const TITLEBAR_HEIGHT_PX = 32;

export interface Viewport {
  w: number;
  h: number;
}

export function clampDragPosition(rect: Rect, viewport: Viewport): { x: number; y: number } {
  const minX = MIN_TITLEBAR_VISIBLE_PX - rect.w;
  const maxX = viewport.w - MIN_TITLEBAR_VISIBLE_PX;
  const minY = 0;
  const maxY = viewport.h - TITLEBAR_HEIGHT_PX;

  return {
    x: Math.min(Math.max(rect.x, minX), maxX),
    y: Math.min(Math.max(rect.y, minY), maxY),
  };
}

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function applyResize(
  rect: Rect,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  minSize: Size,
): Rect {
  let { x, y, w, h } = rect;

  if (handle.includes("e")) {
    w = Math.max(minSize.w, rect.w + deltaX);
  }
  if (handle.includes("w")) {
    w = Math.max(minSize.w, rect.w - deltaX);
    x = rect.x + (rect.w - w);
  }
  if (handle.includes("s")) {
    h = Math.max(minSize.h, rect.h + deltaY);
  }
  if (handle.includes("n")) {
    h = Math.max(minSize.h, rect.h - deltaY);
    y = rect.y + (rect.h - h);
  }

  return { x, y, w, h };
}
