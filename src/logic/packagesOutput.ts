import type { ProjectEntry } from "../data/projects.ts";

export function generatePackageLines(projects: ProjectEntry[]): string[] {
  const lines: string[] = ["Installed Packages"];
  const sorted = [...projects].sort((a, b) => a.folderName.localeCompare(b.folderName));

  for (const project of sorted) {
    const version = project.status === "shipped" ? "1.0.0" : "0.1.0";
    const name = `${project.folderName}.noarch`.padEnd(40, " ");
    const versionTag = `${version}-${project.status}`.padEnd(18, " ");
    lines.push(`${name}${versionTag}@portfolio`);
  }

  return lines;
}
