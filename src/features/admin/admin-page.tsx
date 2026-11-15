import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, SelectField, PageHeading, EmptyState } from "@/components/work/shared";
import { adminOptions } from "./query";
import { saveAdminOpportunity, saveAdminSource } from "./admin.functions";
import {
  emptyOpportunity,
  opportunitySchema,
  opportunityStatuses,
  platforms,
} from "@/features/discovery/schemas";
import { splitList } from "@/features/account/schemas";
export function AdminPage({ view }: { view: "overview" | "opportunities" | "sources" | "audit" }) {
  const { data } = useSuspenseQuery(adminOptions);
  const client = useQueryClient();
  const saveOpportunity = useServerFn(saveAdminOpportunity),
    saveSource = useServerFn(saveAdminSource);
  const [editing, setEditing] = useState(false),
    [id, setId] = useState<string | undefined>();
  const [value, setValue] = useState({ ...emptyOpportunity }),
    [error, setError] = useState("");
  const [sourceId, setSourceId] = useState<string | undefined>(),
    [sourceName, setSourceName] = useState(""),
    [platform, setPlatform] = useState("Web"),
    [enabled, setEnabled] = useState(false);
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: adminOptions.queryKey }),
      client.invalidateQueries({ queryKey: ["opportunity-search"] }),
      client.invalidateQueries({ queryKey: ["opportunity-detail"] }),
      client.invalidateQueries({ queryKey: ["account-workspace"] }),
    ]);
  }
  const mutation = useMutation({
    mutationFn: () => saveOpportunity({ data: { id, value: opportunitySchema.parse(value) } }),
    onSuccess: async () => {
      await refresh();
      setEditing(false);
      toast.success("Opportunity saved.");
    },
    onError: (e) => setError(e.message),
  });
  const sourceMutation = useMutation({
    mutationFn: () => saveSource({ data: { id: sourceId, name: sourceName, platform, enabled } }),
    onSuccess: async () => {
      await refresh();
      setSourceId(undefined);
      setSourceName("");
      setEnabled(false);
      toast.success("Source saved.");
    },
    onError: (e) => setError(e.message),
  });
  const set = (key: keyof typeof value, v: unknown) => setValue((old) => ({ ...old, [key]: v }));
  const text = (key: keyof typeof value, label: string, multiline = false, type = "text") => (
    <Field key={key} label={label}>
      {multiline ? (
        <textarea value={String(value[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
      ) : (
        <input
          type={type}
          value={String(value[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </Field>
  );
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title={
          {
            overview: "Workspace overview",
            opportunities: "Manage opportunities",
            sources: "Manage sources",
            audit: "Administrator audit trail",
          }[view]
        }
        description="Work to Work administration."
      />
      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Administration navigation">
        {(
          [
            ["/admin", "Overview"],
            ["/admin/opportunities", "Opportunities"],
            ["/admin/sources", "Sources"],
            ["/admin/audit", "Audit trail"],
            ["/admin/access", "Access and AI controls"],
          ] as const
        ).map(
          ([to, label]) =>
            ((to !== "/admin/sources" && to !== "/admin/audit" && to !== "/admin/access") ||
              data.roles.some((r) => r === "owner" || r === "admin")) && (
              <Button asChild variant="outline" key={to}>
                <Link to={to}>{label}</Link>
              </Button>
            ),
        )}
      </nav>
      {view === "overview" && (
        <div className="stat-grid">
          {data.totals &&
            typeof data.totals === "object" &&
            !Array.isArray(data.totals) &&
            Object.entries(data.totals).map(([key, count]) => (
              <article className="stat-card" key={key}>
                <p>{key.replaceAll("_", " ")}</p>
                <strong>{String(count)}</strong>
              </article>
            ))}
        </div>
      )}
      {view === "opportunities" && (
        <>
          {!editing && (
            <Button
              onClick={() => {
                setId(undefined);
                setValue({ ...emptyOpportunity });
                setEditing(true);
                setError("");
              }}
            >
              Create opportunity
            </Button>
          )}
          {editing && (
            <form
              className="form-stack mt-6 max-w-3xl"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                const parsed = opportunitySchema.safeParse(value);
                if (!parsed.success) {
                  setError(
                    parsed.error.issues.map((i) => `${i.path.join(" ")}: ${i.message}`).join(" "),
                  );
                  return;
                }
                mutation.mutate();
              }}
            >
              <h2 className="text-xl">{id ? "Edit opportunity" : "New opportunity"}</h2>
              {text("title", "Title")}
              {text("company", "Company or organisation")}
              {text("description", "Description", true)}
              {text("summary", "Summary", true)}
              <Field label="Required skills">
                <input
                  value={value.skills.join(", ")}
                  onChange={(e) => set("skills", splitList(e.target.value))}
                />
              </Field>
              {text("service_category", "Service category")}
              {text("country", "Country (optional)")}
              <Field label="Work location">
                <select
                  value={value.work_location}
                  onChange={(e) => set("work_location", e.target.value)}
                >
                  <option value="All">Unknown</option>
                  {["Remote", "Hybrid", "On-site"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              {text("opportunity_type", "Opportunity type")}
              <Field label="Budget (optional)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value.budget ?? ""}
                  onChange={(e) =>
                    set("budget", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Currency (three-letter code)">
                <input
                  maxLength={3}
                  value={value.currency}
                  onChange={(e) => set("currency", e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Opportunity origin">
                <select
                  value={value.origin}
                  onChange={(e) => {
                    const origin = e.target.value as "external" | "direct";
                    setValue((old) => ({
                      ...old,
                      origin,
                      discovery_section: origin === "direct" ? "direct" : "web",
                      source_id: null,
                    }));
                  }}
                >
                  <option value="external">Manually entered external opportunity</option>
                  <option value="direct">Submitted directly to Work to Work</option>
                </select>
              </Field>
              {value.origin === "external" && (
                <>
                  <SelectField
                    label="Discovery section"
                    value={value.discovery_section}
                    onChange={(v) =>
                      setValue((old) => ({
                        ...old,
                        discovery_section: v as "web" | "social",
                        source_id: null,
                      }))
                    }
                    options={["web", "social"]}
                  />
                  <Field label="Source">
                    <select
                      value={value.source_id ?? ""}
                      onChange={(e) => set("source_id", e.target.value || null)}
                    >
                      <option value="">Choose source</option>
                      {data.sources
                        .filter((s) =>
                          value.discovery_section === "web"
                            ? s.platform === "Web"
                            : s.platform !== "Web",
                        )
                        .map((s) => (
                          <option value={s.id} key={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </Field>
                </>
              )}
              {text("url", "Original source URL (optional for direct submissions)", false, "url")}
              {text("posted_at", "Posted date (optional)", false, "date")}
              {text("application_url", "Application URL (optional)", false, "url")}
              {text("application_instructions", "Application instructions", true)}
              {text("closing_date", "Closing date (optional)", false, "date")}
              <SelectField
                label="Publication status"
                value={value.status}
                onChange={(v) => set("status", v)}
                options={[...opportunityStatuses]}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "Save opportunity"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {!editing &&
            (data.opportunities.length ? (
              <div className="grid gap-4 mt-6">
                {data.opportunities.map((o) => (
                  <article className="opportunity-card" key={o.id}>
                    <h3>{o.title}</h3>
                    <p>
                      {o.status} ·{" "}
                      {o.origin === "direct" ? "Direct Work to Work" : "Manually entered external"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setId(o.id);
                        setValue({
                          ...o,
                          country: o.country ?? "",
                          currency: o.currency ?? "",
                          url: o.url ?? "",
                          application_url: o.application_url ?? "",
                          posted_at: o.posted_at?.slice(0, 10) ?? "",
                          closing_date: o.closing_date ?? "",
                          status: o.status as typeof value.status,
                          origin: o.origin as typeof value.origin,
                          discovery_section: o.discovery_section as typeof value.discovery_section,
                          work_location: o.work_location as typeof value.work_location,
                        });
                        setEditing(true);
                        setError("");
                      }}
                    >
                      Edit {o.title}
                    </Button>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No opportunities entered"
                description="Only real opportunities should be added."
              />
            ))}
        </>
      )}
      {view === "sources" && (
        <>
          <p className="legal-note">
            Integrations: Not connected. Sources added here identify manually entered opportunities.
          </p>
          <form
            className="form-stack max-w-2xl mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              sourceMutation.mutate();
            }}
          >
            <Field label="Source name">
              <input required value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
            </Field>
            <SelectField
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={platforms}
            />
            <label className="flex gap-2 items-center">
              <input
                className="w-4"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enable source listing (integration remains unconfigured)
            </label>
            <div className="flex flex-wrap gap-2">
              <Button disabled={sourceMutation.isPending}>
                {sourceId ? "Save source" : "Add source"}
              </Button>
              {sourceId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSourceId(undefined);
                    setSourceName("");
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
          <div className="grid gap-4">
            {data.sources.map((s) => (
              <article className="opportunity-card" key={s.id}>
                <h3>{s.name}</h3>
                <p>
                  {s.platform} ·{" "}
                  {!s.enabled
                    ? "Disabled"
                    : s.integration_configured
                      ? "Connected"
                      : "Not configured"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSourceId(s.id);
                    setSourceName(s.name);
                    setPlatform(s.platform);
                    setEnabled(s.enabled);
                  }}
                >
                  Edit {s.name}
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
      {view === "audit" &&
        data.securityAudit.map((a) => (
          <article className="opportunity-card mb-3" key={a.id}>
            <h3>{a.action}</h3>
            <p>{new Date(a.created_at).toLocaleString()}</p>
            <p className="break-all">Actor: {a.actor_id ?? "Trusted owner setup"}</p>
            <pre className="whitespace-pre-wrap break-all text-xs">
              {JSON.stringify(a.details, null, 2)}
            </pre>
          </article>
        ))}
      {view === "audit" &&
        (data.audit.length ? (
          <div className="grid gap-4">
            {data.audit.map((a) => (
              <article className="opportunity-card" key={a.id}>
                <h3>{a.action}</h3>
                <p>{new Date(a.created_at).toLocaleString()}</p>
                <p className="break-all">Opportunity: {a.opportunity_id}</p>
                <p className="break-all">Administrator: {a.actor_id}</p>
                <details>
                  <summary>Change record</summary>
                  <pre className="whitespace-pre-wrap break-all text-xs">
                    {JSON.stringify({ before: a.before_value, after: a.after_value }, null, 2)}
                  </pre>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No administrator changes yet"
            description="Opportunity changes will appear here."
          />
        ))}
      {error && (
        <p role="alert" className="error-inline mt-4">
          {error}
        </p>
      )}
    </>
  );
}
