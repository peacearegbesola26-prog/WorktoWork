import { describe, expect, it } from "vitest";
import { accountRedirect } from "./account-type";
describe("account type routing", () => {
  it("sends accounts without a type to onboarding", () => {
    expect(accountRedirect(null, "/app/dashboard")).toBe("/app/onboarding");
    expect(accountRedirect(null, "/app/onboarding")).toBeNull();
  });
  it("keeps buyers out of seller discovery and career tools", () => {
    expect(accountRedirect("buyer", "/app/social")).toBe("/app/dashboard");
    expect(accountRedirect("buyer", "/app/resume-builder")).toBe("/app/dashboard");
    expect(accountRedirect("buyer", "/app/post-job")).toBeNull();
  });
  it("keeps sellers out of buyer hiring pages", () => {
    expect(accountRedirect("seller", "/app/post-job")).toBe("/app/dashboard");
    expect(accountRedirect("seller", "/app/direct")).toBeNull();
  });
  it("shows published job browsing to sellers only", () => {
    expect(accountRedirect("buyer", "/app/open-jobs")).toBe("/app/dashboard");
    expect(accountRedirect("buyer", "/app/open-jobs/11111111-1111-4111-8111-111111111111")).toBe(
      "/app/dashboard",
    );
    expect(accountRedirect("seller", "/app/open-jobs")).toBeNull();
    expect(
      accountRedirect("seller", "/app/open-jobs/11111111-1111-4111-8111-111111111111"),
    ).toBeNull();
  });
  it("does not let a chosen type reopen onboarding", () => {
    expect(accountRedirect("seller", "/app/onboarding")).toBe("/app/dashboard");
  });
});
