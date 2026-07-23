import { getAnimationPlan } from "../logic/animationPlan.ts";
import type { WindowState } from "../types.ts";
import type { WindowAnimator } from "./windowChrome.ts";
import { getIconScreenRect } from "./desktop/icons.ts";
import { getTaskbarEntryScreenRect } from "./desktop/taskbar.ts";

// Read once at module load, then keep in sync: a visitor can toggle the OS/browser
// reduced-motion setting while the page is open, and every later animation must honor it.
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let prefersReducedMotion = reducedMotionQuery.matches;
reducedMotionQuery.addEventListener("change", (e) => {
  prefersReducedMotion = e.matches;
});

function centerOf(rect: DOMRect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function createWindowAnimator(): WindowAnimator {
  return {
    onOpen(el: HTMLElement, win: WindowState): void {
      const plan = getAnimationPlan("open", prefersReducedMotion);
      if (plan.kind === "none" || plan.durationMs === 0) return; // instant: element is already at rest

      const iconRect = getIconScreenRect(win.appId);
      // Origin = the icon's center expressed relative to the window's top-left.
      // If the app has no desktop icon, fall back to the window's own center.
      const origin = iconRect
        ? { x: centerOf(iconRect).x - win.x, y: centerOf(iconRect).y - win.y }
        : { x: win.w / 2, y: win.h / 2 };
      el.style.transformOrigin = `${origin.x}px ${origin.y}px`;

      // Avoid a one-frame full-opacity flash before the animation's first frame paints.
      el.style.opacity = "0";
      const base = `translate(${win.x}px, ${win.y}px)`;
      const anim = el.animate(
        [
          { transform: `${base} scale(0.1)`, opacity: 0 },
          { transform: `${base} scale(1)`, opacity: 1 },
        ],
        { duration: plan.durationMs, easing: plan.easing, fill: "none" },
      );
      anim.addEventListener("finish", () => {
        el.style.opacity = ""; // revert to the element's resting (opaque) state
        el.style.transformOrigin = "";
      });
    },
    onClose(el: HTMLElement, done: () => void): void {
      const plan = getAnimationPlan("close", prefersReducedMotion);
      if (plan.kind === "none" || plan.durationMs === 0) {
        done();
        return;
      }

      const elRect = el.getBoundingClientRect();
      const appId = el.dataset.appId as WindowState["appId"] | undefined;
      const iconRect = appId ? getIconScreenRect(appId) : null;
      const origin = iconRect
        ? { x: centerOf(iconRect).x - elRect.left, y: centerOf(iconRect).y - elRect.top }
        : { x: elRect.width / 2, y: elRect.height / 2 };
      el.style.transformOrigin = `${origin.x}px ${origin.y}px`;

      const base = `translate(${elRect.left}px, ${elRect.top}px)`;
      const anim = el.animate(
        [
          { transform: `${base} scale(1)`, opacity: 1 },
          { transform: `${base} scale(0.1)`, opacity: 0 },
        ],
        { duration: plan.durationMs, easing: plan.easing, fill: "forwards" },
      );
      // fill: "forwards" holds the shrunk/faded end state so there is no flash of
      // the full window between finish and the actual DOM removal.
      anim.addEventListener("finish", done);
    },
    onMinimize(el: HTMLElement, done: () => void): void {
      const plan = getAnimationPlan("minimize", prefersReducedMotion);
      if (plan.kind === "none" || plan.durationMs === 0) {
        done();
        return;
      }

      const elRect = el.getBoundingClientRect();
      const windowId = el.dataset.windowId ?? "";
      const targetRect = getTaskbarEntryScreenRect(windowId);
      // Fall back to the bottom-center of the viewport if the taskbar entry isn't found.
      const target = targetRect
        ? centerOf(targetRect)
        : { x: window.innerWidth / 2, y: window.innerHeight };

      // With transform-origin at the top-left, a scaled box of size (w*s) has its center at
      // translateX + w*s/2. Solve for the translate that lands the shrunk center on the target.
      const s = 0.1;
      const endX = target.x - (elRect.width * s) / 2;
      const endY = target.y - (elRect.height * s) / 2;

      el.style.transformOrigin = "0 0";
      const anim = el.animate(
        [
          { transform: `translate(${elRect.left}px, ${elRect.top}px) scale(1)`, opacity: 1 },
          { transform: `translate(${endX}px, ${endY}px) scale(${s})`, opacity: 0 },
        ],
        { duration: plan.durationMs, easing: plan.easing, fill: "none" },
      );
      // fill: "none" - on finish the element snaps back to its base style, but done()
      // sets display:none in the same tick so the snap-back is never painted. This keeps
      // the resting style clean (opacity 1, base transform) for a later restore.
      anim.addEventListener("finish", () => {
        el.style.transformOrigin = "";
        done();
      });
    },
  };
}
