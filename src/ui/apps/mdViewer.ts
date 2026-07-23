import type { ContentRenderer } from "../windowChrome.ts";
import type { WindowManager } from "../../logic/windowManager.ts";
import type { ProjectEntry, ProjectFile } from "../../data/projects.ts";
import { parseMarkdown, renderMarkdownToHtml } from "../../logic/parseMarkdown.ts";

const pending = new Map<string, ProjectFile>();
const live = new Map<string, (file: ProjectFile) => void>();

function windowId(projectId: string): string {
  return `md-viewer-${projectId}`;
}

export function showMarkdownFile(manager: WindowManager, project: ProjectEntry, file: ProjectFile): void {
  const id = windowId(project.id);
  const title = `${project.folderName} / ${file.name}`;
  const existing = manager.getWindows().find((w) => w.id === id);
  if (existing) {
    live.get(id)?.(file); // swap content in place
    manager.focus(id);
    return;
  }
  pending.set(id, file);
  manager.open("md-viewer", id, title);
}

export const renderMdViewer: ContentRenderer = (win, el) => {
  el.classList.add("md-viewer");

  const update = (file: ProjectFile) => {
    el.innerHTML = renderMarkdownToHtml(parseMarkdown(file.content ?? ""));
  };
  live.set(win.id, update);

  const first = pending.get(win.id);
  if (first) {
    update(first);
    pending.delete(win.id);
  }
};
