import { z } from "zod";

export const experienceLevels = ["Entry", "Intermediate", "Senior", "Specialist"] as const;
export const locationTypes = ["Remote", "Hybrid", "On-site"] as const;
export const budgetTypes = ["Fixed price", "Hourly", "Monthly"] as const;
export const jobStatuses = ["draft", "published", "closed", "archived"] as const;
export const applicationStatuses = [
  "submitted",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
  "withdrawn",
] as const;
/** Buyers choose the currency of each job budget; sellers are paid in that currency. */
export const currencies = [
  "USD",
  "GBP",
  "EUR",
  "GHS",
  "KES",
  "ZAR",
  "CAD",
  "AUD",
  "INR",
  "CNY",
  "AED",
] as const;
export const workFilters = ["All", ...locationTypes] as const;
export const experienceFilters = ["All", ...experienceLevels] as const;

const date = z
  .string()
  .refine(
    (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
    "Enter a valid date.",
  );

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Give your job a clearer title (at least 4 characters).")
    .max(150),
  description: z.string().trim().min(20, "Describe the work in at least 20 characters.").max(8000),
  category: z.string().trim().min(1, "A job category is required.").max(60),
  skills: z.array(z.string().trim().min(1).max(60)).max(20),
  experience_level: z.enum(experienceLevels),
  location_type: z.enum(locationTypes),
  country: z.string().trim().max(60),
  budget_type: z.enum(budgetTypes),
  budget_amount: z
    .number()
    .gt(0, "Enter a budget above zero.")
    .max(100000000, "That budget is too large.")
    .nullable(),
  budget_currency: z.string().regex(/^[A-Z]{3}$/, "Choose a currency."),
  closing_date: date,
});
export type JobDraft = z.infer<typeof jobSchema>;

export const emptyJob: JobDraft = {
  title: "",
  description: "",
  category: "",
  skills: [],
  experience_level: "Intermediate",
  location_type: "Remote",
  country: "",
  budget_type: "Fixed price",
  budget_amount: null,
  budget_currency: "USD",
  closing_date: "",
};

export const jobCommand = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), id: z.string().uuid().optional(), value: jobSchema }),
  z.object({ action: z.literal("publish"), id: z.string().uuid() }),
  z.object({ action: z.literal("close"), id: z.string().uuid() }),
  z.object({ action: z.literal("archive"), id: z.string().uuid() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);
export type JobCommand = z.infer<typeof jobCommand>;

export const jobSearchSchema = z.object({
  query: z.string().max(200).default(""),
  category: z.string().max(60).default(""),
  country: z.string().max(60).default(""),
  work: z.enum(workFilters).default("All"),
  experience: z.enum(experienceFilters).default("All"),
  sort: z.enum(["newest", "oldest", "budget"]).default("newest"),
  page: z.number().int().min(1).max(200).default(1),
});
export type JobSearch = z.infer<typeof jobSearchSchema>;

export const applySchema = z.object({
  job_id: z.string().uuid(),
  cover_note: z
    .string()
    .trim()
    .min(20, "Tell the buyer why you are a good fit (at least 20 characters).")
    .max(4000),
  proposed_amount: z
    .number()
    .gt(0, "Enter a proposed amount above zero.")
    .max(100000000, "That amount is too large.")
    .nullable(),
});
export type ApplyInput = z.infer<typeof applySchema>;

export const reviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["reviewed", "shortlisted", "rejected", "hired"]),
});

export function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function money(amount: number | null, currency: string) {
  if (amount === null || amount === undefined) return "No budget set";
  const value = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return currency ? `${currency} ${value}` : value;
}

export function amountOrNone(amount: number | null, currency: string) {
  return amount === null || amount === undefined ? "Not stated" : money(amount, currency);
}
