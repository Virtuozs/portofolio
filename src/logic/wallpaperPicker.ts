export function pickRandomWallpaper(wallpapers: string[], random: () => number = Math.random): string {
  if (wallpapers.length === 0) {
    throw new Error("pickRandomWallpaper: no wallpapers provided");
  }
  const index = Math.floor(random() * wallpapers.length);
  return wallpapers[index];
}
