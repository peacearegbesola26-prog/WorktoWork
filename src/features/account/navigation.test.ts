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
  it("keeps marketplace job pages after sign in", () => {
    for (const page of ["open-jobs", "post-job", "jobs", "applications", "my-applications"])
      expect(safeNext("/app/" + page)).toBe("/app/" + page);
    expect(safeNext("/app/open-jobs/11111111-1111-4111-8111-111111111111")).toBe(
      "/app/open-jobs/11111111-1111-4111-8111-111111111111",
    );
    expect(safeNext("/app/open-jobs/not-a-uuid")).toBe("/app/dashboard");
  });
  it("does not return to the old demo experience", () =>
    expect(safeNext("/demo/dashboard")).toBe("/app/dashboard"));
});
