import { useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, PageHeading } from "@/components/work/shared";
import { websiteEditorOptions } from "./query";
import { saveWebsiteSettings, uploadBrandImage } from "./website.functions";
import { settingsSchema, type SiteSettings } from "./schema";
export function SiteSettingsPage() {
  const { data } = useSuspenseQuery(websiteEditorOptions);
  const client = useQueryClient();
  const save = useServerFn(saveWebsiteSettings),
    upload = useServerFn(uploadBrandImage);
  const [edited, setEdited] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  if (!data.owner) return <p>Owner access required.</p>;
  const value = edited ?? data.settings;
  const update = (v: Partial<SiteSettings>) => {
    setEdited({ ...value, ...v });
    setStatus("Unsaved changes");
  };
  async function image(file: File | undefined, field: "logo" | "favicon") {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      )
        throw new Error("Use PNG, JPEG or WebP up to 2 MB. SVG is not accepted.");
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width,
        h = bitmap.height;
      bitmap.close();
      if (w > 4096 || h > 4096 || w < 16 || h < 16)
        throw new Error("Use an image between 16 and 4096 pixels on each side.");
      if (field === "favicon" && w !== h) throw new Error("Use a square favicon image.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (const b of bytes) binary += String.fromCharCode(b);
      const result = await upload({ data: { base64: btoa(binary), purpose: field } });
      update({ [field]: result.path });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Site settings"
        description="Owner-managed brand and operating controls."
      />
      <form
        className="form-stack max-w-3xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          try {
            await save({ data: settingsSchema.parse(value) });
            await client.invalidateQueries({ queryKey: ["website-editor"] });
            await client.invalidateQueries({ queryKey: ["published-website"] });
            setEdited(null);
            setStatus("Settings saved");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Save failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Site display name">
          <input
            aria-label="Site display name"
            value={value.displayName}
            maxLength={100}
            onChange={(e) => update({ displayName: e.target.value })}
          />
        </Field>
        {(["logo", "favicon"] as const).map((k) => (
          <div key={k}>
            <Field
              label={k === "logo" ? "Logo" : "Favicon"}
              hint="PNG, JPEG or WebP · up to 2 MB. SVG is not accepted."
            >
              <input
                aria-label={k === "logo" ? "Logo" : "Favicon"}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={(e) => void image(e.target.files?.[0], k)}
              />
            </Field>
            {value[k] && (
              <div className="flex items-center gap-3">
                <span>Image uploaded{edited ? " · save to apply" : ""}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove ${k}`}
                  title={`Remove ${k}`}
                  onClick={() => update({ [k]: "" })}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        ))}
        {(["primary", "foreground"] as const).map((k) => (
          <Field
            label={k === "primary" ? "Accent colour" : "Text colour"}
            key={k}
            hint="Dark enough to remain readable on white. Clear to use the original colour."
          >
            <div className="flex gap-3">
              <input
                type="color"
                aria-label={`${k} colour swatch`}
                value={value[k] || (k === "primary" ? "#2455d6" : "#16233e")}
                onChange={(e) => update({ [k]: e.target.value })}
              />
              <input
                aria-label={`${k} hex colour`}
                value={value[k]}
                placeholder="Original colour"
                onChange={(e) => update({ [k]: e.target.value })}
              />
            </div>
          </Field>
        ))}
        <Field label="Support email">
          <input
            type="email"
            value={value.supportEmail}
            onChange={(e) => update({ supportEmail: e.target.value })}
          />
        </Field>
        <Field label="Announcement banner">
          <textarea
            aria-label="Announcement banner"
            value={value.announcement}
            maxLength={300}
            onChange={(e) => update({ announcement: e.target.value })}
          />
        </Field>
        <h2 className="text-xl">Operations</h2>
        <label className="flex gap-3 items-center">
          <input
            type="checkbox"
            checked={value.registrationEnabled}
            onChange={(e) => update({ registrationEnabled: e.target.checked })}
          />
          Registration enabled
        </label>
        <p className="legal-note">
          Closing registration rejects new account creation in the backend. Existing accounts can
          still sign in and recover passwords.
        </p>
        <label className="flex gap-3 items-center">
          <input
            type="checkbox"
            checked={value.maintenance}
            onChange={(e) => update({ maintenance: e.target.checked })}
          />
          Maintenance mode
        </label>
        <p className="legal-note">
          Staff retain access. Account settings, profile, password recovery, privacy information and
          sign-out remain available.
        </p>
        <Button disabled={busy}>
          <Save />
          {busy ? "Saving…" : "Save settings"}
        </Button>
        {error && (
          <p role="alert" className="error-inline">
            {error}
          </p>
        )}
        {status && <p role="status">{status}</p>}
      </form>
    </>
  );
}
