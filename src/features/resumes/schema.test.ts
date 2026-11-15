import { describe, it, expect } from "vitest";
import { blankResume, resumeSchema, missingInput, hasInventedNumbers } from "./schema";
describe("resume factual boundaries", () => {
  it("asks for experience before strengthening achievements", () =>
    expect(missingInput(blankResume, "achievements")).toBe(
      "Add your work experience, responsibilities and any real achievements first.",
    ));
  it("asks for summary or experience before improving summary", () =>
    expect(missingInput(blankResume, "summary")).toBe(
      "Add your summary or work experience first.",
    ));
  it("rejects invented achievement numbers", () =>
    expect(hasInventedNumbers("Managed projects", "Increased revenue by 30%")).toBe(true));
  it("allows supplied numbers", () =>
    expect(hasInventedNumbers("Managed 3 projects", "Delivered 3 projects")).toBe(false));
  it("includes all requested resume fields", () =>
    expect(
      resumeSchema.parse({
        ...blankResume,
        email: "me@example.com",
        certifications: "Certificate",
        projects: "Portfolio project",
      }),
    ).toMatchObject({
      email: "me@example.com",
      certifications: "Certificate",
      projects: "Portfolio project",
    }));
});
