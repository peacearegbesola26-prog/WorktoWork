import { describe, it, expect } from "vitest";
import { safeNext } from "@/features/account/navigation";
import { permissionForAdminPath } from "./permissions";
describe("staff navigation", () => {
  it("requires specific permissions for every privileged staff page", () => {
    expect(permissionForAdminPath("/admin/users")).toBe("users.manage");
    expect(permissionForAdminPath("/admin/sources")).toBe("sources.manage");
    expect(permissionForAdminPath("/admin/audit")).toBe("audit.read");
    expect(permissionForAdminPath("/admin/access")).toBe("ai.manage");
    expect(permissionForAdminPath("/admin/opportunities")).toBe("opportunities.manage");
    expect(permissionForAdminPath("/admin")).toBe("admin.access");
  });
  it("preserves protected admin settings after sign in", () =>
    expect(safeNext("/admin/access")).toBe("/admin/access"));
  it("does not accept external admin destinations", () =>
    expect(safeNext("https://example.com/admin")).toBe("/app/dashboard"));
});
