import { describe, expect, it } from "vitest";
import { clampDragPosition, MIN_TITLEBAR_VISIBLE_PX, TITLEBAR_HEIGHT_PX } from "../../../src/logic/geometry.ts";
import { applyResize } from "../../../src/logic/geometry.ts";

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

describe("applyResize", () => {
  const rect = { x: 100, y: 100, w: 400, h: 300 };
  const minSize = { w: 200, h: 150 };

  it("grows from the east handle without moving x/y", () => {
    const result = applyResize(rect, "e", 50, 0, minSize);
    expect(result).toEqual({ x: 100, y: 100, w: 450, h: 300 });
  });

  it("grows from the south handle without moving x/y", () => {
    const result = applyResize(rect, "s", 0, 40, minSize);
    expect(result).toEqual({ x: 100, y: 100, w: 400, h: 340 });
  });

  it("shrinks from the west handle and moves x, keeping the right edge fixed", () => {
    const result = applyResize(rect, "w", 50, 0, minSize);
    // left edge moves right by 50: x 100 -> 150, width 400 -> 350
    expect(result).toEqual({ x: 150, y: 100, w: 350, h: 300 });
  });

  it("shrinks from the north handle and moves y, keeping the bottom edge fixed", () => {
    const result = applyResize(rect, "n", 0, 40, minSize);
    expect(result).toEqual({ x: 100, y: 140, w: 400, h: 260 });
  });

  it("handles a corner (se) by combining both axes", () => {
    const result = applyResize(rect, "se", 50, -40, minSize);
    expect(result).toEqual({ x: 100, y: 100, w: 450, h: 260 });
  });

  it("handles a corner (nw) by combining both axes", () => {
    const result = applyResize(rect, "nw", 50, 40, minSize);
    // west: x 100->150, w 400->350 ; north: y 100->140, h 300->260
    expect(result).toEqual({ x: 150, y: 140, w: 350, h: 260 });
  });

  it("never shrinks width below minSize.w", () => {
    const result = applyResize(rect, "e", -1000, 0, minSize);
    expect(result.w).toBe(minSize.w);
  });

  it("never shrinks height below minSize.h", () => {
    const result = applyResize(rect, "s", 0, -1000, minSize);
    expect(result.h).toBe(minSize.h);
  });

  it("stops moving x once width hits the minSize floor from the west handle", () => {
    const result = applyResize(rect, "w", 1000, 0, minSize);
    // width floors at 200, so the left edge only advances (400 - 200) = 200px, not 1000px
    expect(result).toEqual({ x: 300, y: 100, w: 200, h: 300 });
  });
});
