import type { ContentRenderer } from "../windowChrome.ts";
import { generatePackageLines } from "../../logic/packagesOutput.ts";
import { PROJECTS } from "../../data/projects.ts";

const LINE_INTERVAL_MS = 60;

export const renderPackages: ContentRenderer = (_win, el) => {
  el.classList.add("packages");
  const lines = generatePackageLines(PROJECTS);

  // Reveal line by line, simulating the command running live (spec §6.2).
  // This runs once per fresh mount = once per open-from-closed. Restore from
  // minimize reuses the existing DOM node and never re-enters here.
  let index = 0;
  let finished = false;

  const reveal = () => {
    if (index >= lines.length) {
      finished = true;
      // Only now is the output scrollable; mid-animation scrolling is meaningless.
      el.style.overflowY = "auto";
      return;
    }
    const lineEl = document.createElement("div");
    lineEl.className = "packages__line";
    lineEl.textContent = lines[index];
    el.appendChild(lineEl);
    index++;
    window.setTimeout(reveal, LINE_INTERVAL_MS);
  };

  // Not scrollable until the reveal completes.
  el.style.overflowY = "hidden";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Reduced motion: paint everything instantly, no typewriter (Global Constraints).
    for (const line of lines) {
      const lineEl = document.createElement("div");
      lineEl.className = "packages__line";
      lineEl.textContent = line;
      el.appendChild(lineEl);
    }
    finished = true;
    el.style.overflowY = "auto";
  } else {
    reveal();
  }

  void finished; // referenced for clarity; DOM node identity is the real state
};
