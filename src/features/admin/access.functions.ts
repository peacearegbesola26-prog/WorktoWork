import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const getStaffSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const values = roles.data?.map((r) => r.role) ?? [];
    if (!values.some((r) => ["owner", "admin"].includes(r)))
      throw new Error("Administrator access required.");
    const [controls, usage, directory] = await Promise.all([
      context.supabase.from("ai_controls").select("*").eq("scope", "resume").maybeSingle(),
      context.supabase
        .from("ai_usage")
        .select("id,mode,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      values.includes("owner")
        ? context.supabase.rpc("staff_directory")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (controls.error || usage.error || directory.error)
      throw new Error("Staff settings could not be loaded.");
    return {
      owner: values.includes("owner"),
      directory: directory.data ?? [],
      controls: controls.data ?? { enabled: true, daily_limit: 20, input_limit: 50000 },
      usage: usage.data ?? [],
    };
  });
export const changeStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      email: z.string().email(),
      role: z.enum(["owner", "admin", "moderator"]),
      grant: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const target = await context.supabase.rpc("verified_staff_target", { address: data.email });
    if (target.error || !target.data)
      throw new Error(target.error?.message ?? "Verified account not found.");
    const result = await context.supabase.rpc("set_staff_role", {
      target: target.data,
      new_role: data.role,
      grant_role: data.grant,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
export const changeAiControls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      enabled: z.boolean(),
      daily_limit: z.number().int().min(0).max(1000),
      input_limit: z.number().int().min(1).max(200000),
    }),
  )
  .handler(async ({ data, context }) => {
    const permission = await context.supabase.rpc("has_permission", { p: "ai.manage" });
    if (permission.error || !permission.data) throw new Error("Administrator access required.");
    const result = await context.supabase.from("ai_controls").upsert({ scope: "resume", ...data });
    if (result.error) throw new Error("AI settings could not be saved.");
    return { ok: true };
  });
