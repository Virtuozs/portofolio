import type { Rect } from "../types.ts";

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
