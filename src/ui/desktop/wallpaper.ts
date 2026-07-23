import { pickRandomWallpaper } from "../../logic/wallpaperPicker.ts";

export function applyWallpaper(root: HTMLElement, path: string): void {
  root.style.backgroundImage = `url("${path}")`;
}

export function initWallpaper(root: HTMLElement, wallpapers: string[]): void {
  applyWallpaper(root, pickRandomWallpaper(wallpapers));
}
