import { describe, expect, it } from "vitest";
import { goBackMobile, openAppMobile, type MobileView } from "../../../src/logic/bootModeNav.ts";

describe("openAppMobile", () => {
  it("opens an app from the home view", () => {
    const home: MobileView = { kind: "home" };
    expect(openAppMobile(home, "whoami")).toEqual({ kind: "app", windowId: "whoami" });
  });

  it("switches to a different app from an existing app view, staying kind 'app'", () => {
    const current: MobileView = { kind: "app", windowId: "whoami" };
    expect(openAppMobile(current, "projects")).toEqual({ kind: "app", windowId: "projects" });
  });

  it("is idempotent when re-opening the app already showing", () => {
    const current: MobileView = { kind: "app", windowId: "mail" };
    expect(openAppMobile(current, "mail")).toEqual({ kind: "app", windowId: "mail" });
  });
});

describe("goBackMobile", () => {
  it("returns to home from an app view", () => {
    const current: MobileView = { kind: "app", windowId: "projects" };
    expect(goBackMobile(current)).toEqual({ kind: "home" });
  });

  it("is a no-op from home - returns the same home object unchanged", () => {
    const home: MobileView = { kind: "home" };
    const result = goBackMobile(home);
    expect(result).toEqual({ kind: "home" });
    expect(result).toBe(home); // referential no-op, not a freshly allocated home
  });
});
