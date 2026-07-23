export type Interaction = "open" | "close" | "minimize" | "focus";

export interface AnimationPlan {
  durationMs: number;
  easing: string;
  kind: "scale-fade" | "slide-to-taskbar" | "none";
}

const INSTANT: AnimationPlan = { durationMs: 0, easing: "linear", kind: "none" };

export function getAnimationPlan(
  interaction: Interaction,
  prefersReducedMotion: boolean,
): AnimationPlan {
  if (prefersReducedMotion) return { ...INSTANT };

  switch (interaction) {
    case "open":
    case "close":
      return { durationMs: 200, easing: "ease-out", kind: "scale-fade" };
    case "minimize":
      return { durationMs: 150, easing: "ease-in", kind: "slide-to-taskbar" };
    case "focus":
      return { ...INSTANT };
  }
}
