import { describe, expect, it } from "vitest";
import { pickRandomWallpaper } from "../../../src/logic/wallpaperPicker.ts";

const wallpapers = ["/wallpapers/a.svg", "/wallpapers/b.svg", "/wallpapers/c.svg", "/wallpapers/d.svg"];

describe("pickRandomWallpaper", () => {
  it("picks the first wallpaper when random() returns 0", () => {
    expect(pickRandomWallpaper(wallpapers, () => 0)).toBe("/wallpapers/a.svg");
  });

  it("picks a specific known index for a fixed random value", () => {
    // Math.floor(0.5 * 4) === 2
    expect(pickRandomWallpaper(wallpapers, () => 0.5)).toBe("/wallpapers/c.svg");
  });

  it("picks the last wallpaper for a random value approaching 1", () => {
    expect(pickRandomWallpaper(wallpapers, () => 0.999)).toBe("/wallpapers/d.svg");
  });

  it("returns the only entry for a single-element list", () => {
    expect(pickRandomWallpaper(["/wallpapers/only.svg"], () => 0.42)).toBe("/wallpapers/only.svg");
  });

  it("throws for an empty wallpapers array", () => {
    expect(() => pickRandomWallpaper([], () => 0)).toThrow();
  });
});
