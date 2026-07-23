import { describe, expect, it } from "vitest";
import { computeImageViewerRect } from "../../../src/logic/imageFit.ts";
import { TITLEBAR_HEIGHT_PX } from "../../../src/logic/geometry.ts";

const viewport = { w: 1000, h: 1000 };

describe("computeImageViewerRect", () => {
  it("does not upscale an image smaller than the cap", () => {
    const rect = computeImageViewerRect({ w: 200, h: 100 }, viewport);
    expect(rect.w).toBe(200);
    expect(rect.h).toBe(100 + TITLEBAR_HEIGHT_PX);
  });

  it("caps a wide image at 80% of viewport width and preserves aspect ratio", () => {
    const rect = computeImageViewerRect({ w: 2000, h: 1000 }, viewport);
    // 80% of 1000 = 800 wide; aspect 2:1 -> 400 tall content
    expect(rect.w).toBe(800);
    expect(rect.h).toBe(400 + TITLEBAR_HEIGHT_PX);
  });

  it("caps a tall image at 80% of viewport height and preserves aspect ratio", () => {
    const rect = computeImageViewerRect({ w: 1000, h: 4000 }, viewport);
    // 80% of 1000 = 800 tall content; aspect 1:4 -> 200 wide
    expect(rect.w).toBe(200);
    expect(rect.h).toBe(800 + TITLEBAR_HEIGHT_PX);
  });

  it("centers the window in the viewport", () => {
    const rect = computeImageViewerRect({ w: 400, h: 200 }, viewport);
    expect(rect.x).toBe((1000 - 400) / 2);
    expect(rect.y).toBe((1000 - (200 + TITLEBAR_HEIGHT_PX)) / 2);
  });
});
