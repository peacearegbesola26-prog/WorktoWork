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
  it("does not let a chosen type reopen onboarding", () => {
    expect(accountRedirect("seller", "/app/onboarding")).toBe("/app/dashboard");
  });
});
