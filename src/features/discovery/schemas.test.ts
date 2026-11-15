import { describe, it, expect } from "vitest";
import { emptyOpportunity, opportunitySchema, safeUrl, searchSchema } from "./schemas";
describe("Opportunity rules", () => {
  it("rejects script and credential-bearing links", () => {
    expect(safeUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(safeUrl.safeParse("https://user:pass@example.com").success).toBe(false);
    expect(safeUrl.safeParse("https://example.com/apply").success).toBe(true);
  });
  it("requires real publication information", () => {
    expect(
      opportunitySchema.safeParse({ ...emptyOpportunity, title: "Real title", status: "published" })
        .success,
    ).toBe(false);
  });
  it("allows direct publication without an external URL", () => {
    expect(
      opportunitySchema.safeParse({
        ...emptyOpportunity,
        title: "Real title",
        status: "published",
        origin: "direct",
        discovery_section: "direct",
        description: "Provided description",
        summary: "Provided summary",
        application_instructions: "Provided instructions",
      }).success,
    ).toBe(true);
  });
  it("requires external source attribution before publication", () => {
    expect(
      opportunitySchema.safeParse({
        ...emptyOpportunity,
        title: "Real title",
        status: "published",
        description: "Description",
        summary: "Summary",
        application_instructions: "Instructions",
      }).success,
    ).toBe(false);
  });
  it("rejects a negative budget", () =>
    expect(
      opportunitySchema.safeParse({
        ...emptyOpportunity,
        title: "Real title",
        budget: -1,
        currency: "USD",
      }).success,
    ).toBe(false));
  it("requires currency when a budget is entered", () =>
    expect(
      opportunitySchema.safeParse({ ...emptyOpportunity, title: "Real title", budget: 100 })
        .success,
    ).toBe(false));
  it("rejects zero and fractional pages", () => {
    expect(searchSchema.safeParse({ section: "web", page: 0 }).success).toBe(false);
    expect(searchSchema.safeParse({ section: "web", page: 1.5 }).success).toBe(false);
  });
});
