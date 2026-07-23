import type { AppConfig } from "../types.ts";

export const APP_CONFIGS: AppConfig[] = [
  {
    id: "whoami",
    defaultTitle: "whoami",
    defaultRect: { x: 80, y: 60, w: 480, h: 360 },
    minSize: { w: 340, h: 260 },
  },
  {
    id: "projects",
    defaultTitle: "projects",
    defaultRect: { x: 160, y: 100, w: 560, h: 420 },
    minSize: { w: 400, h: 300 },
  },
  {
    id: "packages",
    defaultTitle: "packages - dnf list installed",
    defaultRect: { x: 220, y: 140, w: 520, h: 400 },
    minSize: { w: 360, h: 300 },
  },
  {
    id: "mail",
    defaultTitle: "mail - new message",
    defaultRect: { x: 260, y: 160, w: 440, h: 380 },
    minSize: { w: 320, h: 280 },
  },
  {
    id: "md-viewer",
    defaultTitle: "md-viewer",
    defaultRect: { x: 200, y: 120, w: 560, h: 440 },
    minSize: { w: 400, h: 320 },
  },
  {
    id: "image-viewer",
    defaultTitle: "image-viewer",
    defaultRect: { x: 240, y: 140, w: 480, h: 380 },
    minSize: { w: 300, h: 260 },
  },
];
