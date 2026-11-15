import { describe, expect, it } from "vitest";
import { safeNext } from "./navigation";
describe("Protected application destinations", () => {
  for (const page of [
    "dashboard",
    "social",
    "web",
    "saved",
    "tracker",
    "alerts",
    "toolkit",
    "settings",
  ])
    it(`keeps /app/${page} after sign in`, () =>
      expect(safeNext("/app/" + page)).toBe("/app/" + page));
  it("does not accept an external redirect", () =>
    expect(safeNext("https://example.com/app/dashboard")).toBe("/app/dashboard"));
  it("does not return to the old demo experience", () =>
    expect(safeNext("/demo/dashboard")).toBe("/app/dashboard"));
});
