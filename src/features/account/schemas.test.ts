import { describe, it, expect } from "vitest";
import { commandSchema, profileSchema } from "./schemas";
describe("Account record validation", () => {
  it("accepts name, skills, services, countries and work preference", () => {
    expect(
      profileSchema.parse({
        name: "Peace",
        skills: ["Writing"],
        services: ["Editing"],
        preferred_countries: ["Nigeria"],
        work_preference: "Remote",
      }),
    ).toEqual({
      name: "Peace",
      skills: ["Writing"],
      services: ["Editing"],
      preferred_countries: ["Nigeria"],
      work_preference: "Remote",
    });
  });
  it("rejects demo IDs for real saves", () => {
    expect(commandSchema.safeParse({ action: "save", id: "op-1" }).success).toBe(false);
  });
  it("rejects unsupported tracking status", () => {
    expect(
      commandSchema.safeParse({
        action: "application",
        value: { title: "Editor", company: "", notes: "", status: "Automatically submitted" },
      }).success,
    ).toBe(false);
  });
  it("does not accept administrator commands", () => {
    expect(commandSchema.safeParse({ action: "assignRole", role: "admin" }).success).toBe(false);
  });
});
