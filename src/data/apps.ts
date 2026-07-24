import type { AppConfig } from "../types.ts";

export const APP_CONFIGS: AppConfig[] = [
  {
    id: "whoami",
    defaultTitle: "whoami",
    defaultRect: { x: 80, y: 60, w: 480, h: 360 },
    // raised from 340x260: at that floor "role"/"languages" values wrapped mid-phrase
    // and the label/value columns misaligned
    minSize: { w: 420, h: 300 },
  },
  {
    id: "projects",
    defaultTitle: "projects",
    defaultRect: { x: 160, y: 100, w: 560, h: 420 },
    // raised width from 400: the status column ("shipped"/"planned") was truncated
    minSize: { w: 460, h: 300 },
  },
  {
    id: "packages",
    defaultTitle: "packages - dnf list installed",
    // widened from 520: a full dnf-style line (name + version + repo tag, monospace)
    // was clipped by ~24px even at the old default, per manual resize-to-floor check
    defaultRect: { x: 220, y: 140, w: 580, h: 400 },
    minSize: { w: 550, h: 300 },
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
