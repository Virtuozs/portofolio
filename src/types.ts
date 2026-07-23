export type AppId =
  | "whoami"
  | "projects"
  | "packages"
  | "mail"
  | "md-viewer"
  | "image-viewer";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

export type WindowLifecycleState = "open" | "closed" | "minimized";

export interface WindowState {
  id: string; // unique per window instance, e.g. "whoami", "md-viewer-007"
  appId: AppId; // which app's content renderer mounts into this window
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  state: WindowLifecycleState;
  isFocused: boolean;
  minSize: Size;
}

export interface AppConfig {
  id: AppId;
  defaultTitle: string;
  defaultRect: Rect;
  minSize: Size;
}
