import { z } from "zod";

export const messageSchema = z.object({
  conversation: z.string().uuid(),
  request: z.string().uuid(),
  body: z.string().trim().min(1, "Write a message.").max(4000),
  attachment: z.string().max(400).nullable().default(null),
  name: z.string().max(150).nullable().default(null),
});
export const offerSchema = z.object({
  conversation: z.string().uuid(),
  terms: z.string().trim().min(20, "Describe the agreed work in at least 20 characters.").max(8000),
  milestones: z.array(z.object({
    title: z.string().trim().min(1).max(150),
    amount: z.number().positive().max(100000000),
    due_date: z.string().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v)),
  })).min(1).max(20),
});
export const canDeliver = (_status: string) => false;