import { describe, expect, it } from "vitest";
import {
  jobSchema,
  applySchema,
  reviewSchema,
  jobCommand,
  jobSearchSchema,
  splitList,
  money,
  amountOrNone,
  emptyJob,
} from "./schemas";

const valid = {
  title: "Build a landing page",
  description: "We need a landing page for a Lagos bakery with a menu and a contact form.",
  category: "Design",
  skills: ["Figma", "HTML"],
  experience_level: "Intermediate",
  location_type: "Remote",
  country: "Nigeria",
  budget_type: "Fixed price",
  budget_amount: 350000,
  budget_currency: "NGN",
  closing_date: "2026-09-30",
};

describe("job posting rules", () => {
  it("accepts a complete job", () => expect(jobSchema.safeParse(valid).success).toBe(true));
  it("requires a clearer title", () => {
    expect(jobSchema.safeParse({ ...valid, title: "abc" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, title: "x".repeat(151) }).success).toBe(false);
  });
  it("requires a real description", () => {
    expect(jobSchema.safeParse({ ...valid, description: "too short" }).success).toBe(false);
  });
  it("requires a category", () => {
    expect(jobSchema.safeParse({ ...valid, category: "  " }).success).toBe(false);
  });
  it("rejects a budget of zero or below", () => {
    expect(jobSchema.safeParse({ ...valid, budget_amount: 0 }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, budget_amount: -5 }).success).toBe(false);
  });
  it("rejects a budget that is too large", () => {
    expect(jobSchema.safeParse({ ...valid, budget_amount: 100000001 }).success).toBe(false);
  });
  it("requires a three letter currency code", () => {
    expect(jobSchema.safeParse({ ...valid, budget_currency: "naira" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, budget_currency: "ngn" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, budget_currency: "USD" }).success).toBe(true);
  });
  it("rejects a malformed closing date", () => {
    expect(jobSchema.safeParse({ ...valid, closing_date: "30/09/2026" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, closing_date: "" }).success).toBe(true);
  });
  it("allows a draft with no budget yet", () => {
    expect(jobSchema.safeParse({ ...valid, budget_amount: null }).success).toBe(true);
  });
  it("caps the skill list at 20 entries", () => {
    const skills = Array.from({ length: 21 }, (_, i) => "skill " + i);
    expect(jobSchema.safeParse({ ...valid, skills }).success).toBe(false);
  });
  it("rejects an empty skill entry", () => {
    expect(jobSchema.safeParse({ ...valid, skills: ["Figma", "  "] }).success).toBe(false);
  });
  it("rejects unknown job lifecycle actions", () => {
    expect(jobCommand.safeParse({ action: "delete", id: "not-a-uuid" }).success).toBe(false);
    expect(jobCommand.safeParse({ action: "unpublish", id: valid.title }).success).toBe(false);
  });
  it("starts from an empty draft", () => {
    expect(emptyJob.budget_amount).toBeNull();
    expect(emptyJob.skills).toEqual([]);
  });
});

describe("application rules", () => {
  const jobId = "11111111-1111-4111-8111-111111111111";
  it("requires a note that says something", () => {
    expect(
      applySchema.safeParse({ job_id: jobId, cover_note: "hi", proposed_amount: null }).success,
    ).toBe(false);
  });
  it("allows a note with no proposed amount", () => {
    expect(
      applySchema.safeParse({
        job_id: jobId,
        cover_note: "I have built three bakery sites with online ordering.",
        proposed_amount: null,
      }).success,
    ).toBe(true);
  });
  it("rejects a zero proposed amount", () => {
    expect(
      applySchema.safeParse({
        job_id: jobId,
        cover_note: "I have built three bakery sites with online ordering.",
        proposed_amount: 0,
      }).success,
    ).toBe(false);
  });
  it("lets the buyer set a review status but not withdraw", () => {
    expect(reviewSchema.safeParse({ id: jobId, status: "shortlisted" }).success).toBe(true);
    expect(reviewSchema.safeParse({ id: jobId, status: "withdrawn" }).success).toBe(false);
  });
});

describe("job search and money", () => {
  it("defaults to the newest first page", () => {
    const parsed = jobSearchSchema.parse({});
    expect(parsed).toMatchObject({ page: 1, sort: "newest", work: "All", experience: "All" });
  });
  it("refuses a page below 1", () => {
    expect(jobSearchSchema.safeParse({ page: 0 }).success).toBe(false);
  });
  it("splits comma lists and drops blanks", () => {
    expect(splitList(" Figma , , HTML ,,")).toEqual(["Figma", "HTML"]);
  });
  it("shows a budget with its currency", () => {
    expect(money(350000, "NGN")).toBe("NGN 350,000");
    expect(money(1250.5, "USD")).toBe("USD 1,250.5");
    expect(money(null, "NGN")).toBe("No budget set");
    expect(money(300, "")).toBe("300");
    expect(amountOrNone(null, "NGN")).toBe("Not stated");
    expect(amountOrNone(300, "NGN")).toBe("NGN 300");
  });
});
