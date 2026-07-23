import type { ProjectEntry, ProjectFile } from "../data/projects.ts";

export interface BreadcrumbState {
  path: string[]; // [] = root, [projectId] = inside a project
}

export function navigateInto(state: BreadcrumbState, projectId: string): BreadcrumbState {
  if (state.path.length > 0) return state; // already inside; no deeper nesting exists
  return { path: [projectId] };
}

export function navigateBack(state: BreadcrumbState): BreadcrumbState {
  return { path: state.path.slice(0, -1) };
}

export function getVisibleEntries(
  state: BreadcrumbState,
  projects: ProjectEntry[],
): ProjectEntry[] | ProjectFile[] {
  if (state.path.length === 0) {
    return [...projects].sort((a, b) => b.id.localeCompare(a.id));
  }
  const project = projects.find((p) => p.id === state.path[0]);
  return project ? project.files : [];
}
