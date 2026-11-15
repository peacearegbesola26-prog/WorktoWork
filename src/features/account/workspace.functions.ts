import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { commandSchema } from "./schemas";
export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase: s, userId } = context;
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
    };
  });
export const updateWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
