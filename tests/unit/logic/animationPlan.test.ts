import { describe, expect, it } from "vitest";
import { getAnimationPlan } from "../../../src/logic/animationPlan.ts";

describe("getAnimationPlan - normal motion (spec §3.6 table verbatim)", () => {
  it("open: 200ms ease-out scale-fade", () => {
    expect(getAnimationPlan("open", false)).toEqual({
      durationMs: 200,
      easing: "ease-out",
      kind: "scale-fade",
    });
  });

  it("close: 200ms ease-out scale-fade (reverse of open)", () => {
    expect(getAnimationPlan("close", false)).toEqual({
      durationMs: 200,
      easing: "ease-out",
      kind: "scale-fade",
    });
  });

  it("minimize: 150ms ease-in slide-to-taskbar", () => {
    expect(getAnimationPlan("minimize", false)).toEqual({
      durationMs: 150,
      easing: "ease-in",
      kind: "slide-to-taskbar",
    });
  });

  it("focus is instant with no motion even without reduced motion", () => {
    expect(getAnimationPlan("focus", false)).toEqual({
      durationMs: 0,
      easing: "linear",
      kind: "none",
    });
  });
});

describe("getAnimationPlan - reduced motion collapses everything to instant/none", () => {
  const interactions = ["open", "close", "minimize", "focus"] as const;

  for (const interaction of interactions) {
    it(`${interaction} becomes { durationMs: 0, easing: "linear", kind: "none" }`, () => {
      expect(getAnimationPlan(interaction, true)).toEqual({
        durationMs: 0,
        easing: "linear",
        kind: "none",
      });
    });
  }
});
