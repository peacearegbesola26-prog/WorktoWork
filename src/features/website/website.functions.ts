import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireStaff } from "@/features/admin/staff-auth";
import { defaultSettings, pageKeys, pageSchema, settingsSchema } from "./schema";
export const getPublishedWebsite = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Website settings are unavailable.");
  const { readPublishedWebsite } = await import("./public.server");
  return readPublishedWebsite(url, key);
});
export const getWebsiteEditor = createServerFn({ method: "GET" })
  .middleware([requireStaff])
  .handler(async ({ context }) => {
    const permission = await context.supabase.rpc("has_permission", { p: "content.manage" });
    if (!permission.data || permission.error) throw new Error("Access denied.");
    const [pages, versions, owner] = await Promise.all([
      context.supabase.from("website_content").select("*").order("key"),
      context.supabase
        .from("website_versions")
        .select("*")
        .order("created_at", { ascending: false }),
      context.supabase.rpc("has_permission", { p: "site.manage" }),
    ]);
    if (pages.error || versions.error) throw new Error("Content could not be loaded.");
    const publicSettings = await context.supabase.rpc("published_website");
    let settings = z.object({ settings: settingsSchema }).parse(publicSettings.data).settings;
    if (owner.data) {
      const r = await context.supabase
        .from("website_settings")
        .select("value")
        .eq("id", true)
        .maybeSingle();
      if (r.error) throw new Error("Settings could not be loaded.");
      settings = settingsSchema.parse(r.data?.value ?? defaultSettings);
    }
    return {
      pages: (pages.data ?? []).map((p) => ({
        ...p,
        published: pageSchema.parse(p.published),
        draft: pageSchema.parse(p.draft),
      })),
      versions: (versions.data ?? []).map((v) => ({ ...v, content: pageSchema.parse(v.content) })),
      owner: owner.data === true,
      settings,
    };
  });
export const saveWebsitePage = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator(
    z.object({
      key: z.enum(pageKeys),
      content: pageSchema,
      action: z.enum(["draft", "publish", "restore"]),
      revision: z.number().int().min(0),
      version: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("website_content_command", {
      key_value: data.key,
      content_value: data.content,
      action_value: data.action,
      expected_revision: data.revision,
      ...(data.version ? { version_id: data.version } : {}),
    });
    if (result.error)
      throw new Error(
        result.error.message.includes("Reload")
          ? result.error.message
          : "Content could not be saved. Reload and check your access.",
      );
    return { revision: result.data };
  });
export const saveWebsiteSettings = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator(settingsSchema)
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("website_settings_command", { settings_value: data });
    if (result.error) throw new Error("Settings could not be saved. Owner access is required.");
    return { ok: true };
  });
export const uploadBrandImage = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator(
    z.object({ base64: z.string().max(2800000), purpose: z.enum(["logo", "favicon"]) }),
  )
  .handler(async ({ data, context }) => {
    const permission = await context.supabase.rpc("has_permission", { p: "site.manage" });
    if (permission.error || !permission.data) throw new Error("Owner access required.");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { validateBrandImage } = await import("./images.server");
    const format = validateBrandImage(bytes, data.purpose);
    const path = `brand/${crypto.randomUUID()}.${format}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.storage.from("website-brand").upload(path, bytes, {
      contentType: format === "jpg" ? "image/jpeg" : `image/${format}`,
      upsert: false,
    });
    if (result.error) throw new Error("Image could not be uploaded.");
    return { path };
  });
