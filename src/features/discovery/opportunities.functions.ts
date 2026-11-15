import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { searchSchema } from "./schemas";
export const searchOpportunities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => searchSchema.parse(v))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("opportunities")
      .select("*, sources(name,platform)", { count: "exact" })
      .eq("published", true)
      .eq("status", "published")
      .eq("discovery_section", data.section)
      .or(`closing_date.is.null,closing_date.gte.${new Date().toISOString().slice(0, 10)}`);
    const clean = (v: string) => v.replace(/[%,()\\]/g, " ").trim();
    if (clean(data.query)) {
      const term = clean(data.query);
      q = q.or(
        `title.ilike.%${term}%,company.ilike.%${term}%,description.ilike.%${term}%,summary.ilike.%${term}%,service_category.ilike.%${term}%`,
      );
    }
    if (data.country.trim()) q = q.ilike("country", `%${clean(data.country)}%`);
    if (data.skill.trim()) q = q.contains("skills", [data.skill.trim()]);
    if (data.work !== "All") q = q.eq("work_location", data.work === "Unknown" ? "All" : data.work);
    if (data.source !== "All") q = q.eq("source_id", data.source);
    if (data.type.trim()) q = q.ilike("opportunity_type", clean(data.type));
    if (data.since) q = q.gte("posted_at", data.since);
    q =
      data.sort === "title"
        ? q.order("title").order("id")
        : q
            .order("posted_at", { ascending: data.sort === "oldest", nullsFirst: false })
            .order("id");
    const r = await q.range((data.page - 1) * 12, data.page * 12 - 1);
    if (r.error) throw new Error("Opportunities could not be loaded.");
    const sources = await context.supabase.from("sources").select("id,name,platform").order("name");
    return { rows: r.data ?? [], total: r.count ?? 0, sources: sources.data ?? [] };
  });
export const opportunityDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("opportunities")
      .select("*, sources(name,platform)")
      .eq("id", data)
      .eq("status", "published")
      .eq("published", true)
      .or(`closing_date.is.null,closing_date.gte.${new Date().toISOString().slice(0, 10)}`)
      .maybeSingle();
    if (r.error) throw new Error("Opportunity could not be loaded.");
    return r.data;
  });
