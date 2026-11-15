import { z } from "zod";
export const opportunityStatuses = ["draft", "published", "expired", "archived"] as const;
export const platforms = ["Facebook", "LinkedIn", "Instagram", "TikTok", "Reddit", "Web"];
export const safeUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return ["http:", "https:"].includes(u.protocol) && !!u.hostname && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Enter an http or https URL without embedded credentials.");
const date = z
  .string()
  .refine(
    (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
    "Enter a valid date.",
  );
export const opportunitySchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    company: z.string().trim().max(200),
    description: z.string().trim().max(30000),
    summary: z.string().trim().max(3000),
    skills: z.array(z.string().trim().min(1).max(100)).max(100),
    service_category: z.string().trim().max(200),
    country: z.string().trim().max(100),
    work_location: z.enum(["All", "Remote", "Hybrid", "On-site"]),
    opportunity_type: z.string().trim().min(1).max(100),
    budget: z.number().min(0).nullable(),
    currency: z.string().regex(/^$|^[A-Z]{3}$/),
    source_id: z.string().uuid().nullable(),
    url: safeUrl,
    posted_at: date,
    application_url: safeUrl,
    application_instructions: z.string().trim().max(10000),
    closing_date: date,
    status: z.enum(opportunityStatuses),
    origin: z.enum(["external", "direct"]),
    discovery_section: z.enum(["social", "web", "direct"]),
  })
  .superRefine((v, ctx) => {
    if ((v.origin === "direct") !== (v.discovery_section === "direct"))
      ctx.addIssue({
        code: "custom",
        path: ["origin"],
        message: "Choose the matching discovery section.",
      });
    if (v.budget !== null && !v.currency)
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message: "A budget requires a currency.",
      });
    if (v.status === "published") {
      for (const field of ["description", "summary"] as const)
        if (!v[field])
          ctx.addIssue({ code: "custom", path: [field], message: "Required for publication." });
      if (!v.application_url && !v.application_instructions)
        ctx.addIssue({
          code: "custom",
          path: ["application_instructions"],
          message: "Provide application instructions or a link.",
        });
      if (v.origin === "external" && (!v.source_id || !v.url))
        ctx.addIssue({
          code: "custom",
          path: ["source_id"],
          message: "External publication requires a source and original URL.",
        });
    }
  });
export const searchSchema = z.object({
  section: z.enum(["social", "web", "direct"]),
  query: z.string().max(200).default(""),
  country: z.string().max(100).default(""),
  skill: z.string().max(100).default(""),
  work: z.string().default("All"),
  source: z.string().default("All"),
  type: z.string().max(100).default(""),
  since: date.default(""),
  sort: z.enum(["newest", "oldest", "title"]).default("newest"),
  page: z.number().int().min(1).default(1),
});
export type SearchFilters = z.infer<typeof searchSchema>;
export const emptyOpportunity: z.infer<typeof opportunitySchema> = {
  title: "",
  company: "",
  description: "",
  summary: "",
  skills: [],
  service_category: "",
  country: "",
  work_location: "All",
  opportunity_type: "Contract",
  budget: null,
  currency: "",
  source_id: null,
  url: "",
  posted_at: "",
  application_url: "",
  application_instructions: "",
  closing_date: "",
  status: "draft",
  origin: "external",
  discovery_section: "web",
};
