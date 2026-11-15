import { describe, it, expect } from "vitest";
import { safeNext } from "@/features/account/navigation";
describe("staff navigation", () => {
  it("preserves protected admin settings after sign in", () =>
    expect(safeNext("/admin/access")).toBe("/admin/access"));
  it("does not accept external admin destinations", () =>
    expect(safeNext("https://example.com/admin")).toBe("/app/dashboard"));
});
