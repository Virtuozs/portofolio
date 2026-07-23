export function mountContextMenu(
  desktopRoot: HTMLElement,
  wallpapers: string[],
  onPick: (path: string) => void,
): void {
  const menuRoot = document.getElementById("context-menu-root");
  if (!menuRoot) throw new Error("#context-menu-root element missing");

  let menuEl: HTMLElement | null = null;

  function closeMenu(): void {
    menuEl?.remove();
    menuEl = null;
  }

  function openMenu(clientX: number, clientY: number): void {
    closeMenu();

    const menu = document.createElement("div");
    menu.className = "context-menu";

    const label = document.createElement("div");
    label.className = "context-menu__label";
    label.textContent = "Change wallpaper";

    const thumbs = document.createElement("div");
    thumbs.className = "context-menu__thumbs";

    for (const path of wallpapers) {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "context-menu__thumb";
      thumb.style.backgroundImage = `url("${path}")`;
      thumb.setAttribute("aria-label", `Use wallpaper ${path}`);
      thumb.addEventListener("click", () => {
        onPick(path);
        closeMenu();
      });
      thumbs.appendChild(thumb);
    }

    menu.append(label, thumbs);
    menuRoot!.appendChild(menu);
    menuEl = menu;

    // Keep the menu inside the viewport.
    const rect = menu.getBoundingClientRect();
    const x = Math.min(clientX, window.innerWidth - rect.width - 4);
    const y = Math.min(clientY, window.innerHeight - rect.height - 4);
    menu.style.left = `${Math.max(4, x)}px`;
    menu.style.top = `${Math.max(4, y)}px`;
  }

  desktopRoot.addEventListener("contextmenu", (e) => {
    if ((e.target as HTMLElement).closest(".window")) return; // let windows keep native menu
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  });

  window.addEventListener("pointerdown", (e) => {
    if (menuEl && !menuEl.contains(e.target as Node)) closeMenu();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}
