export interface ProjectFile {
  name: string;
  kind: "readme" | "image";
  content?: string; // Markdown source, present when kind === "readme"
  src?: string;     // asset path, present when kind === "image"
}

export interface ProjectEntry {
  id: string;
  folderName: string;
  status: "shipped" | "planned" | "iterating";
  files: ProjectFile[];
}

// #007 README is authored from spec §7 (factual). It uses only the Markdown
// subset parseMarkdown() supports: headings, paragraphs, bold - NO list syntax,
// since the parser does not implement lists (spec §6.4 scope).
const README_007 = `# Multi-Source Oil & Gas ETL Pipeline with Dashboard

**Status:** shipped

A multi-source extract-transform-load pipeline that aggregates U.S. oil and gas
data into an analytics dashboard.

## Data Sources

**Primary source:** U.S. EIA (Energy Information Administration) - production,
reserves, and pricing data via its public API.

**Secondary source:** a state-level regulator dataset, for well-level granularity
beyond EIA's national and state aggregates.

## Dashboard

Production volume trends by state and region, rendered with a Plotly/Streamlit
dashboard.
`;

// [CONTENT GAP] #001-#006 README bodies are placeholder text - the original
// brainstorm content that spec §7 refers to does not exist in this repo. Replace
// with the site owner's real project descriptions before deploy. Do NOT present
// any of this as a factual description of real work.
function placeholderReadme(folderName: string): string {
  return `# ${folderName}

Placeholder - project description pending from site owner. Replace this content in
src/data/projects.ts before deploy.
`;
}

export const PROJECTS: ProjectEntry[] = [
  {
    id: "001",
    folderName: "001_idx_xbrl_downloader",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [
      { name: "README.md", kind: "readme", content: placeholderReadme("001_idx_xbrl_downloader") },
    ],
  },
  {
    id: "002",
    folderName: "002_selfhosted_infra_stack",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [
      { name: "README.md", kind: "readme", content: placeholderReadme("002_selfhosted_infra_stack") },
    ],
  },
  {
    id: "003",
    folderName: "003_idx_financial_stress_nlp",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [
      { name: "README.md", kind: "readme", content: placeholderReadme("003_idx_financial_stress_nlp") },
    ],
  },
  {
    id: "004",
    folderName: "004_tax_compliance_webapp",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [
      { name: "README.md", kind: "readme", content: placeholderReadme("004_tax_compliance_webapp") },
    ],
  },
  {
    // [CONTENT GAP] intentionally has NO files, to exercise spec §6.4's
    // "no README -> folder appears empty" empty-state rule end to end. Add a
    // README/image here once the owner supplies content.
    id: "005",
    folderName: "005_document_extraction",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [],
  },
  {
    id: "006",
    folderName: "006_ntfyd",
    status: "planned", // PLACEHOLDER - real status pending from site owner
    files: [
      { name: "README.md", kind: "readme", content: placeholderReadme("006_ntfyd") },
    ],
  },
  {
    id: "007",
    folderName: "007_oil_gas_etl",
    status: "shipped",
    files: [
      { name: "README.md", kind: "readme", content: README_007 },
      // [CONTENT GAP] screenshot asset is a placeholder path - the real image is
      // not in the repo yet. Drop it at public/projects/007_oil_gas_etl/screenshot.png.
      { name: "screenshot.png", kind: "image", src: "/projects/007_oil_gas_etl/screenshot.png" },
    ],
  },
];
