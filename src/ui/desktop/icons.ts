import type { AppId } from "../../types.ts";

interface DesktopIcon {
  appId: AppId;
  label: string;
  glyph: string; // ASCII placeholder - replace with an SVG sprite in Phase 5
}

// Only the 4 top-level apps get a launcher (see Task 6 decision).
const DESKTOP_ICONS: DesktopIcon[] = [
  { appId: "whoami", label: "whoami", glyph: ">_" },
  { appId: "projects", label: "projects", glyph: "[]" },
  { appId: "packages", label: "packages", glyph: "#" },
  { appId: "mail", label: "mail", glyph: "@" },
];

export function mountDesktopIcons(root: HTMLElement, onOpen: (appId: AppId) => void): void {
  root.replaceChildren();

  for (const icon of DESKTOP_ICONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "desktop-icon";
    button.dataset.appId = icon.appId;
    button.setAttribute("aria-label", `Open ${icon.label}`);

    const glyph = document.createElement("span");
    glyph.className = "desktop-icon__glyph";
    glyph.textContent = icon.glyph;
    glyph.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "desktop-icon__label";
    label.textContent = icon.label;

    button.append(glyph, label);
    // Single-click opens (spec §4), not double-click.
    button.addEventListener("click", () => onOpen(icon.appId));

    root.appendChild(button);
  }
}
