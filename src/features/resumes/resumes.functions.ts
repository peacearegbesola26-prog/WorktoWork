import { createServerFn } from "@tanstack/react-start";
import { requireActiveAccount } from "@/features/account/active-auth";
import { z } from "zod";
import { resumeSchema, blankResume, modes, missingInput } from "./schema";
export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireActiveAccount])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("*")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error("Your resumes could not be loaded. Please try again.");
    return (data ?? []).map((r) => ({
      ...r,
      content: resumeSchema.parse({ ...blankResume, ...(r.content as object) }),
    }));
  });
export const resumeCommand = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("save"),
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(200),
        content: resumeSchema,
      }),
      z.object({ action: z.literal("duplicate"), id: z.string().uuid() }),
      z.object({ action: z.literal("delete"), id: z.string().uuid() }),
    ]),
  )
  .handler(async ({ data, context }) => {
    const { supabase: s, userId } = context;
    if (data.action === "delete") {
      const r = await s
        .from("resumes")
        .delete()
        .eq("id", data.id)
        .eq("user_id", userId)
        .select("id")
        .single();
      if (r.error) throw new Error("This resume could not be deleted.");
      return { id: r.data.id };
    }
    if (data.action === "duplicate") {
      const original = await s
        .from("resumes")
        .select("name,content")
        .eq("id", data.id)
        .eq("user_id", userId)
        .single();
      if (original.error) throw new Error("This resume is not available.");
      const r = await s
        .from("resumes")
        .insert({
          user_id: userId,
          name: (original.data.name + " (copy)").slice(0, 200),
          content: original.data.content,
        })
        .select("id")
        .single();
      if (r.error) throw new Error("The copy could not be saved.");
      return { id: r.data.id };
    }
    const value = { name: data.name, content: data.content };
    const r = data.id
      ? await s
          .from("resumes")
          .update(value)
          .eq("id", data.id)
          .eq("user_id", userId)
          .select("id")
          .single()
      : await s
          .from("resumes")
          .insert({ ...value, user_id: userId })
          .select("id")
          .single();
    if (r.error) throw new Error("Your resume could not be saved. Please try again.");
    return { id: r.data.id };
  });
export const optimizeResume = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(z.object({ id: z.string().uuid(), mode: z.enum(modes) }))
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("resumes")
      .select("content")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (r.error) throw new Error("This resume is not available.");
    const content = resumeSchema.parse({ ...blankResume, ...(r.data.content as object) });
    const missing = missingInput(content, data.mode);
    if (missing) return { text: "", error: missing };
    const { runResumeOptimization } = await import("./optimization.server");
    const reservation = await context.supabase.rpc("reserve_resume_ai", {
      mode_value: data.mode,
      input_length: JSON.stringify(content).length,
    });
    if (reservation.error || !reservation.data)
      return {
        text: "",
        error: reservation.error?.message ?? "AI request could not be authorised.",
      };
    const result = await runResumeOptimization(content, data.mode);
    await context.supabase.rpc("finish_resume_ai", {
      request_id: reservation.data,
      request_status: result.error ? "error" : "completed",
    });
    return result;
  });
