import type { Rect, Size } from "../types.ts";
import { TITLEBAR_HEIGHT_PX, type Viewport } from "./geometry.ts";

const VIEWPORT_CAP = 0.8;

export function computeImageViewerRect(natural: Size, viewport: Viewport): Rect {
  const maxW = viewport.w * VIEWPORT_CAP;
  const maxH = viewport.h * VIEWPORT_CAP;
  const scale = Math.min(maxW / natural.w, maxH / natural.h, 1);

  const w = Math.round(natural.w * scale);
  const contentH = Math.round(natural.h * scale);
  const h = contentH + TITLEBAR_HEIGHT_PX;

  return {
    x: Math.round((viewport.w - w) / 2),
    y: Math.round((viewport.h - h) / 2),
    w,
    h,
  };
}
