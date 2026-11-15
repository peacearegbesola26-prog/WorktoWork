import { z } from "zod";
export const locations = ["All", "Remote", "Hybrid", "On-site"] as const;
export const statuses = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
const list = z.array(z.string().trim().min(1).max(100)).max(100);
export const profileSchema = z.object({
  name: z.string().trim().max(200),
  skills: list,
  services: list,
  preferred_countries: list,
  work_preference: z.enum(locations),
});
export const applicationSchema = z.object({
  title: z.string().trim().min(1).max(300),
  company: z.string().trim().max(200),
  notes: z.string().max(10000),
  status: z.enum(statuses),
});
export const alertSchema = z.object({
  name: z.string().trim().min(1).max(200),
  keywords: z.string().trim().max(1000),
  countries: list,
  work_preference: z.enum(locations),
  enabled: z.boolean(),
});
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("profile"), value: profileSchema }),
  z.object({
    action: z.literal("application"),
    id: z.string().uuid().optional(),
    value: applicationSchema,
  }),
  z.object({ action: z.literal("removeApplication"), id: z.string().uuid() }),
  z.object({ action: z.literal("alert"), id: z.string().uuid().optional(), value: alertSchema }),
  z.object({ action: z.literal("removeAlert"), id: z.string().uuid() }),
  z.object({ action: z.literal("save"), id: z.string().uuid() }),
  z.object({ action: z.literal("unsave"), id: z.string().uuid() }),
  z.object({ action: z.literal("trackOpportunity"), id: z.string().uuid() }),
]);
export type Command = z.infer<typeof commandSchema>;
export function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
