import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { opportunitySchema, platforms } from "@/features/discovery/schemas";
export const adminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const r = await context.supabase.rpc("has_permission", { p: "admin.access" });
    return !r.error && r.data === true;
  });
export const getAdminWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc("has_permission", { p: "admin.access" });
    if (role.error || !role.data) throw new Error("Administrator access required.");
    const [opportunities, sources, audit, totals, roles, securityAudit] = await Promise.all([
      context.supabase.from("opportunities").select("*").order("updated_at", { ascending: false }),
      context.supabase.from("sources").select("*").order("name"),
      context.supabase
        .from("admin_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      context.supabase.rpc("admin_overview"),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("security_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if ([opportunities, sources, audit, totals].some((r) => r.error))
      throw new Error("Administration could not be loaded.");
    return {
      opportunities: opportunities.data ?? [],
      sources: sources.data ?? [],
      audit: audit.data ?? [],
      totals: totals.data,
      roles: roles.data?.map((r) => r.role) ?? [],
      securityAudit: securityAudit.data ?? [],
    };
  });
export const saveAdminOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ id: z.string().uuid().optional(), value: opportunitySchema }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_permission", { p: "opportunities.manage" });
    if (role.error || !role.data) throw new Error("Administrator access required.");
    const v = data.value;
    const value = {
      ...v,
      country: v.country || null,
      currency: v.currency || null,
      url: v.url || null,
      application_url: v.application_url || null,
      posted_at: v.posted_at ? v.posted_at + "T00:00:00Z" : null,
      closing_date: v.closing_date || null,
      source_id: v.origin === "direct" ? null : v.source_id,
      published: v.status === "published",
    };
    const r = data.id
      ? await context.supabase
          .from("opportunities")
          .update(value)
          .eq("id", data.id)
          .select("id")
          .single()
      : await context.supabase.from("opportunities").insert(value).select("id").single();
    if (r.error)
      throw new Error("Opportunity could not be saved. Check its required fields and source.");
    return r.data;
  });
export const saveAdminSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(200),
        platform: z.string().refine((v) => platforms.includes(v)),
        enabled: z.boolean(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_permission", { p: "sources.manage" });
    if (role.error || !role.data) throw new Error("Administrator access required.");
    const { id, ...value } = data;
    const r = id
      ? await context.supabase.from("sources").update(value).eq("id", id).select("id").single()
      : await context.supabase.from("sources").insert(value).select("id").single();
    if (r.error) throw new Error("Source could not be saved. Check for a duplicate name.");
    return r.data;
  });
