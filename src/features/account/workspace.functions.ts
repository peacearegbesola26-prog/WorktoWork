import { createServerFn } from "@tanstack/react-start";
import { requireActiveAccount } from "@/features/account/active-auth";
import { commandSchema } from "./schemas";
const emptyMarketplace = {
  role: null as "buyer" | "seller" | null,
  published: 0,
  drafts: 0,
  closed: 0,
  applications: 0,
  openJobs: 0,
};
export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireActiveAccount])
  .handler(async ({ context }) => {
    const { supabase: s, userId } = context;
    const available = await s.rpc("website_available");
    if (available.error) throw new Error("Workspace availability could not be checked.");
    if (!available.data) {
      const profile = await s.from("profiles").select("*").eq("id", userId).single();
      if (profile.error) throw new Error("Account settings could not be loaded.");
      return {
        profile: profile.data,
        saved: [],
        tracker: [],
        alerts: [],
        opportunities: [],
        counts: { saved: 0, tracker: 0, alerts: 0 },
        marketplace: emptyMarketplace,
      };
    }
    const [profile, saved, tracker, alerts, opportunities, savedCount, trackerCount, alertCount] =
      await Promise.all([
        s.from("profiles").select("*").eq("id", userId).single(),
        s
          .from("saved_opportunities")
          .select("*, opportunities(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        s
          .from("tracked_applications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        s
          .from("alert_preferences")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        s
          .from("opportunities")
          .select("*, sources(platform)")
          .eq("published", true)
          .eq("status", "published")
          .or(`closing_date.is.null,closing_date.gte.${new Date().toISOString().slice(0, 10)}`)
          .order("created_at", { ascending: false })
          .limit(100),
        s
          .from("saved_opportunities")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        s
          .from("tracked_applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        s
          .from("alert_preferences")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);
    if (
      [profile, saved, tracker, alerts, opportunities, savedCount, trackerCount, alertCount].some(
        (r) => r.error,
      )
    )
      throw new Error("Your workspace could not be loaded. Please try again.");
    const type = await s.rpc("current_account_type");
    if (type.error) throw new Error("Your account type could not be checked. Please try again.");
    let marketplace = emptyMarketplace;
    if (type.data === "buyer") {
      const c = await s.rpc("buyer_workspace_counts");
      if (c.error) throw new Error("Your hiring counts could not be loaded. Please try again.");
      const v = (c.data ?? {}) as Record<string, number>;
      marketplace = {
        role: "buyer",
        published: v["published"] ?? 0,
        drafts: v["drafts"] ?? 0,
        closed: v["closed"] ?? 0,
        applications: v["applications"] ?? 0,
        openJobs: 0,
      };
    } else if (type.data === "seller") {
      const c = await s.rpc("seller_workspace_counts");
      if (c.error) throw new Error("Your seller counts could not be loaded. Please try again.");
      const v = (c.data ?? {}) as Record<string, number>;
      marketplace = {
        role: "seller",
        published: 0,
        drafts: 0,
        closed: 0,
        applications: v["applications"] ?? 0,
        openJobs: v["open_jobs"] ?? 0,
      };
    }
    return {
      profile: profile.data,
      saved: saved.data ?? [],
      tracker: tracker.data ?? [],
      alerts: alerts.data ?? [],
      opportunities: opportunities.data ?? [],
      counts: {
        saved: savedCount.count ?? 0,
        tracker: trackerCount.count ?? 0,
        alerts: alertCount.count ?? 0,
      },
      marketplace,
    };
  });
export const updateWorkspace = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator((input) => commandSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase: s, userId } = context;
    let result;
    switch (data.action) {
      case "profile":
      case "preferences":
        result = await s.from("profiles").update(data.value).eq("id", userId).select("id").single();
        break;
      case "application":
        result = data.id
          ? await s
              .from("tracked_applications")
              .update(data.value)
              .eq("id", data.id)
              .eq("user_id", userId)
              .select("id")
              .single()
          : await s
              .from("tracked_applications")
              .insert({ ...data.value, user_id: userId })
              .select("id")
              .single();
        break;
      case "removeApplication":
        result = await s
          .from("tracked_applications")
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId)
          .select("id")
          .single();
        break;
      case "alert":
        result = data.id
          ? await s
              .from("alert_preferences")
              .update(data.value)
              .eq("id", data.id)
              .eq("user_id", userId)
              .select("id")
              .single()
          : await s
              .from("alert_preferences")
              .insert({ ...data.value, user_id: userId })
              .select("id")
              .single();
        break;
      case "removeAlert":
        result = await s
          .from("alert_preferences")
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId)
          .select("id")
          .single();
        break;
      case "save":
        result = await s
          .from("saved_opportunities")
          .upsert(
            { user_id: userId, opportunity_id: data.id },
            { onConflict: "user_id,opportunity_id", ignoreDuplicates: true },
          );
        break;
      case "unsave":
        result = await s
          .from("saved_opportunities")
          .delete()
          .eq("user_id", userId)
          .eq("opportunity_id", data.id);
        break;
      case "trackOpportunity": {
        const item = await s
          .from("opportunities")
          .select("title,company")
          .eq("id", data.id)
          .eq("published", true)
          .eq("status", "published")
          .or(`closing_date.is.null,closing_date.gte.${new Date().toISOString().slice(0, 10)}`)
          .single();
        if (item.error || !item.data) throw new Error("This opportunity is no longer available.");
        result = await s
          .from("tracked_applications")
          .upsert(
            { user_id: userId, opportunity_id: data.id, ...item.data },
            { onConflict: "user_id,opportunity_id", ignoreDuplicates: true },
          );
        break;
      }
    }
    if (result.error) throw new Error("Your changes could not be saved. Please try again.");
    return { ok: true };
  });
