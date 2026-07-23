import { describe, expect, it } from "vitest";
import { canSend, buildMailtoUrl } from "../../../src/logic/mailValidation.ts";

describe("canSend", () => {
  it("blocks an empty subject", () => {
    expect(canSend("")).toBe(false);
  });

  it("blocks a whitespace-only subject", () => {
    expect(canSend("   ")).toBe(false);
  });

  it("allows a non-empty subject", () => {
    expect(canSend("Hello")).toBe(true);
  });
});

describe("buildMailtoUrl", () => {
  it("builds a mailto with encoded subject and body", () => {
    const url = buildMailtoUrl({ to: "owner@example.com", subject: "Job offer", body: "Hi there" });
    expect(url).toBe("mailto:owner@example.com?subject=Job%20offer&body=Hi%20there");
  });

  it("omits the body when it is empty (body is optional per spec §6.3)", () => {
    const url = buildMailtoUrl({ to: "owner@example.com", subject: "Ping", body: "" });
    expect(url).toBe("mailto:owner@example.com?subject=Ping");
  });

  it("encodes special characters with percent-encoding, not plus", () => {
    const url = buildMailtoUrl({ to: "owner@example.com", subject: "a & b", body: "" });
    expect(url).toBe("mailto:owner@example.com?subject=a%20%26%20b");
  });

  it("produces a bare mailto when subject and body are both empty", () => {
    expect(buildMailtoUrl({ to: "owner@example.com", subject: "", body: "" })).toBe(
      "mailto:owner@example.com",
    );
  });
});
