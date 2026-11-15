import { describe, expect, it } from "vitest";
import { parseDemoPreferences } from "./preferences";

describe("Safe demo preference restoration", () => {
  it("falls back safely for non-object stored JSON", () => {
    for (const raw of ["null", "42", "[]", '"text"']) {
      expect(parseDemoPreferences(raw)).toEqual({
        saved: ["op-1", "op-2", "op-3"],
        preference: "Remote",
      });
    }
  });
  it("retains only known sample IDs and work location preferences", () => {
    expect(
      parseDemoPreferences(
        JSON.stringify({
          saved: ["op-2", "op-2", "secret"],
          preference: "Hybrid",
          password: "ignored",
        }),
      ),
    ).toEqual({ saved: ["op-2"], preference: "Hybrid" });
  });
  it("preserves an intentionally empty shortlist", () => {
    expect(parseDemoPreferences('{"saved":[],"preference":"invalid"}')).toEqual({
      saved: [],
      preference: "Remote",
    });
  });
  it("reports malformed JSON to the provider recovery handler", () => {
    expect(() => parseDemoPreferences("{broken")).toThrow();
  });
});
