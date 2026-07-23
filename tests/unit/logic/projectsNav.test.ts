import { describe, expect, it } from "vitest";
import {
  navigateInto,
  navigateBack,
  getVisibleEntries,
  type BreadcrumbState,
} from "../../../src/logic/projectsNav.ts";
import type { ProjectEntry } from "../../../src/data/projects.ts";

const projects: ProjectEntry[] = [
  {
    id: "007",
    folderName: "007_oil_gas_etl",
    status: "shipped",
    files: [
      { name: "README.md", kind: "readme", content: "# hi" },
      { name: "screenshot.png", kind: "image", src: "/a.png" },
    ],
  },
  {
    id: "006",
    folderName: "006_ntfyd",
    status: "planned",
    files: [{ name: "README.md", kind: "readme", content: "# hi" }], // no image
  },
  {
    id: "005",
    folderName: "005_document_extraction",
    status: "planned",
    files: [], // no README, no image
  },
];

describe("navigateInto / navigateBack", () => {
  it("enters a project from root", () => {
    expect(navigateInto({ path: [] }, "007")).toEqual({ path: ["007"] });
  });

  it("is a no-op when already inside a project (no nesting)", () => {
    expect(navigateInto({ path: ["007"] }, "006")).toEqual({ path: ["007"] });
  });

  it("goes back from inside a project to root", () => {
    expect(navigateBack({ path: ["007"] })).toEqual({ path: [] });
  });

  it("stays at root when going back from root", () => {
    expect(navigateBack({ path: [] })).toEqual({ path: [] });
  });
});

describe("getVisibleEntries at root", () => {
  it("returns project folders sorted by id descending (007 first)", () => {
    const entries = getVisibleEntries({ path: [] }, projects) as ProjectEntry[];
    expect(entries.map((e) => e.id)).toEqual(["007", "006", "005"]);
  });
});

describe("getVisibleEntries inside a project", () => {
  it("returns the project's files", () => {
    const entries = getVisibleEntries({ path: ["007"] }, projects);
    expect(entries).toHaveLength(2);
  });

  it("omits a missing image entirely - no placeholder row", () => {
    const entries = getVisibleEntries({ path: ["006"] }, projects);
    expect(entries).toHaveLength(1);
    expect((entries[0] as { kind: string }).kind).toBe("readme");
  });

  it("shows an empty folder when the project has no README and no image", () => {
    expect(getVisibleEntries({ path: ["005"] }, projects)).toEqual([]);
  });

  it("returns an empty list for an unknown project id", () => {
    expect(getVisibleEntries({ path: ["999"] }, projects)).toEqual([]);
  });
});
