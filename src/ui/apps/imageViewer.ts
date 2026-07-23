import type { ContentRenderer } from "../windowChrome.ts";
import type { WindowManager } from "../../logic/windowManager.ts";
import type { ProjectEntry, ProjectFile } from "../../data/projects.ts";
import { computeImageViewerRect } from "../../logic/imageFit.ts";

const pending = new Map<string, ProjectFile>();
const live = new Map<string, (file: ProjectFile) => void>();

function windowId(projectId: string): string {
  return `image-viewer-${projectId}`;
}

export function showImageFile(manager: WindowManager, project: ProjectEntry, file: ProjectFile): void {
  const id = windowId(project.id);
  const title = `${project.folderName} / ${file.name}`;
  const existing = manager.getWindows().find((w) => w.id === id);
  if (existing) {
    live.get(id)?.(file);
    manager.focus(id);
    return;
  }
  pending.set(id, file);
  manager.open("image-viewer", id, title);
}

// Factory: the renderer needs the manager to resize the window once the image's
// natural dimensions are known.
export function createImageViewerRenderer(manager: WindowManager): ContentRenderer {
  return (win, el) => {
    el.classList.add("image-viewer");

    const img = document.createElement("img");
    img.addEventListener("load", () => {
      const rect = computeImageViewerRect(
        { w: img.naturalWidth, h: img.naturalHeight },
        { w: window.innerWidth, h: window.innerHeight },
      );
      manager.resize(win.id, rect);
    });
    el.appendChild(img);

    const update = (file: ProjectFile) => {
      img.alt = file.name;
      img.src = file.src ?? "";
    };
    live.set(win.id, update);

    const first = pending.get(win.id);
    if (first) {
      update(first);
      pending.delete(win.id);
    }
  };
}
