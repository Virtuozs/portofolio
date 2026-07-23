import { describe, expect, it } from "vitest";
import { clampDragPosition, MIN_TITLEBAR_VISIBLE_PX, TITLEBAR_HEIGHT_PX } from "../../../src/logic/geometry.ts";

describe("clampDragPosition", () => {
  const viewport = { w: 1024, h: 768 };

  it("does not move a window that is fully within bounds", () => {
    const rect = { x: 100, y: 100, w: 400, h: 300 };
    expect(clampDragPosition(rect, viewport)).toEqual({ x: 100, y: 100 });
  });

  it("stops the window from sliding fully off the left edge", () => {
    const rect = { x: -500, y: 100, w: 400, h: 300 };
    const result = clampDragPosition(rect, viewport);
    expect(result.x).toBe(MIN_TITLEBAR_VISIBLE_PX - 400);
  });

  it("stops the window from sliding fully off the right edge", () => {
    const rect = { x: 2000, y: 100, w: 400, h: 300 };
    const result = clampDragPosition(rect, viewport);
    expect(result.x).toBe(viewport.w - MIN_TITLEBAR_VISIBLE_PX);
  });

  it("never lets the titlebar go above the top of the viewport", () => {
    const rect = { x: 100, y: -200, w: 400, h: 300 };
    expect(clampDragPosition(rect, viewport).y).toBe(0);
  });

  it("keeps the whole titlebar row on screen at the bottom", () => {
    const rect = { x: 100, y: 2000, w: 400, h: 300 };
    expect(clampDragPosition(rect, viewport).y).toBe(viewport.h - TITLEBAR_HEIGHT_PX);
  });

  it("leaves exactly 80px of titlebar width visible at the clamp boundary", () => {
    const rect = { x: -1000, y: 100, w: 400, h: 300 };
    const result = clampDragPosition(rect, viewport);
    const visibleWidth = rect.w + result.x; // right edge minus 0
    expect(visibleWidth).toBe(MIN_TITLEBAR_VISIBLE_PX);
  });
});
