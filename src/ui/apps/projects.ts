import type { ContentRenderer } from "../windowChrome.ts";
import type { WindowManager } from "../../logic/windowManager.ts";
import {
  navigateInto,
  navigateBack,
  getVisibleEntries,
  type BreadcrumbState,
} from "../../logic/projectsNav.ts";
import { PROJECTS, type ProjectEntry, type ProjectFile } from "../../data/projects.ts";
import { showMarkdownFile } from "./mdViewer.ts";
import { showImageFile } from "./imageViewer.ts";

function isFile(entry: ProjectEntry | ProjectFile): entry is ProjectFile {
  return "kind" in entry;
}

export function createProjectsRenderer(manager: WindowManager): ContentRenderer {
  return (_win, el) => {
    el.classList.add("projects");
    let state: BreadcrumbState = { path: [] };

    const breadcrumb = document.createElement("div");
    breadcrumb.className = "projects__breadcrumb";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "projects__back";
    back.textContent = "< back";
    const crumbLabel = document.createElement("span");
    breadcrumb.append(back, crumbLabel);

    const list = document.createElement("ul");
    list.className = "projects__list";

    el.append(breadcrumb, list);

    back.addEventListener("click", () => {
      state = navigateBack(state);
      render();
    });

    function currentProject(): ProjectEntry | undefined {
      return PROJECTS.find((p) => p.id === state.path[0]);
    }

    function render(): void {
      const atRoot = state.path.length === 0;
      back.disabled = atRoot;
      crumbLabel.textContent = atRoot
        ? "projects"
        : `projects > ${currentProject()?.folderName ?? state.path[0]}`;

      list.textContent = "";
      const entries = getVisibleEntries(state, PROJECTS);

      if (entries.length === 0) {
        const empty = document.createElement("li");
        empty.className = "projects__empty";
        empty.textContent = atRoot ? "no projects" : "empty folder";
        list.appendChild(empty);
        return;
      }

      for (const entry of entries) {
        list.appendChild(row(entry));
      }
    }

    function row(entry: ProjectEntry | ProjectFile): HTMLElement {
      const li = document.createElement("li");
      li.className = "projects__row";

      const icon = document.createElement("span");
      const name = document.createElement("span");
      name.className = "projects__name";
      const meta = document.createElement("span");
      meta.className = "projects__meta";

      if (isFile(entry)) {
        icon.textContent = entry.kind === "readme" ? "[md]" : "[img]";
        name.textContent = entry.name;
        meta.textContent = entry.kind;
        li.addEventListener("click", () => openFile(entry));
      } else {
        icon.textContent = "[dir]";
        name.textContent = `${entry.folderName}/`;
        meta.textContent = entry.status;
        li.addEventListener("click", () => {
          state = navigateInto(state, entry.id);
          render();
        });
      }

      li.append(icon, name, meta);
      return li;
    }

    function openFile(file: ProjectFile): void {
      const project = currentProject();
      if (!project) return;
      if (file.kind === "readme") showMarkdownFile(manager, project, file);
      else showImageFile(manager, project, file);
    }

    render();
  };
}
