import { describe, expect, it } from "vitest";
import { generatePackageLines } from "../../../src/logic/packagesOutput.ts";
import type { ProjectEntry } from "../../../src/data/projects.ts";

const projects: ProjectEntry[] = [
  { id: "007", folderName: "007_oil_gas_etl", status: "shipped", files: [] },
  { id: "001", folderName: "001_idx_xbrl_downloader", status: "planned", files: [] },
];

describe("generatePackageLines", () => {
  it("starts with the dnf-style header line", () => {
    expect(generatePackageLines(projects)[0]).toBe("Installed Packages");
  });

  it("emits one line per project plus the header", () => {
    expect(generatePackageLines(projects)).toHaveLength(projects.length + 1);
  });

  it("sorts package rows by folder name ascending", () => {
    const lines = generatePackageLines(projects);
    expect(lines[1]).toContain("001_idx_xbrl_downloader");
    expect(lines[2]).toContain("007_oil_gas_etl");
  });

  it("tags a shipped project with version 1.0.0 and its status", () => {
    const line = generatePackageLines(projects).find((l) => l.includes("007_oil_gas_etl"))!;
    expect(line).toContain("1.0.0-shipped");
    expect(line).toContain("@portfolio");
  });

  it("tags a non-shipped project with version 0.1.0", () => {
    const line = generatePackageLines(projects).find((l) => l.includes("001_idx_xbrl_downloader"))!;
    expect(line).toContain("0.1.0-planned");
  });
});
