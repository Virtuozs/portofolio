export type MobileView = { kind: "home" } | { kind: "app"; windowId: string };

export function openAppMobile(current: MobileView, windowId: string): MobileView {
  return { kind: "app", windowId };
}

export function goBackMobile(current: MobileView): MobileView {
  return current.kind === "app" ? { kind: "home" } : current;
}
