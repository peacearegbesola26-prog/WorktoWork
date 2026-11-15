import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Field, PageHeading } from "@/components/work/shared";
import { getStaffSettings, changeStaffRole, changeAiControls } from "./access.functions";
export function StaffSettingsPage() {
  const load = useServerFn(getStaffSettings),
    roleCommand = useServerFn(changeStaffRole),
    aiCommand = useServerFn(changeAiControls);
  const client = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["staff-settings"],
    queryFn: () => load(),
  });
  const [email, setEmail] = useState(""),
    [role, setRole] = useState<"owner" | "admin" | "moderator">("moderator"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await client.invalidateQueries();
      setMessage("Changes saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Changes could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  if (isLoading) return <p role="status">Loading administration settings…</p>;
  if (error || !data) return <p role="alert">{error?.message ?? "Access unavailable."}</p>;
  return (
    <>
      <PageHeading title="Access and AI controls" description="Work to Work administration." />
      <section className="mb-8">
        <h2 className="text-xl mb-4">Staff permissions</h2>
        <p className="legal-note">
          Owner: staff roles and all administration. Administrator: opportunities, sources, AI
          controls and audit. Moderator: opportunity management only. Private resumes and
          application notes remain private.
        </p>
        {data.owner && (
          <>
            <form
              className="form-stack max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (window.confirm(`Grant ${role} access to ${email}?`))
                  void run(() => roleCommand({ data: { email, role, grant: true } }));
              }}
            >
              <Field label="Verified account email">
                <input
                  aria-label="Verified account email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Staff role">
                <select
                  aria-label="Staff role"
                  value={role}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "owner" || v === "admin" || v === "moderator") setRole(v);
                  }}
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                  <option value="owner">Owner</option>
                </select>
              </Field>
              <Button disabled={busy}>Grant role</Button>
            </form>
            <div className="grid gap-3 mt-5">
              {data.directory.map((r) => (
                <article className="opportunity-card" key={r.user_id + r.role}>
                  <h3>{r.email}</h3>
                  <p>{r.role === "admin" ? "Administrator" : r.role}</p>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Revoke ${r.role} from ${r.email}?`))
                        void run(() =>
                          roleCommand({
                            data: {
                              email: r.email,
                              role:
                                r.role === "owner"
                                  ? "owner"
                                  : r.role === "admin"
                                    ? "admin"
                                    : "moderator",
                              grant: false,
                            },
                          }),
                        );
                    }}
                  >
                    Revoke role
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <AiForm
        key={JSON.stringify(data.controls)}
        value={data.controls}
        busy={busy}
        onSave={(v) => run(() => aiCommand({ data: v }))}
      />
      <section className="mt-8">
        <h2 className="text-xl mb-4">Recent AI processing</h2>
        <p className="legal-note">
          Requests include unsuccessful attempts. Limits reset at midnight UTC. No resume content is
          recorded here.
        </p>
        {data.usage.length ? (
          data.usage.map((u) => (
            <p key={u.id}>
              {u.mode} · {u.status} · {new Date(u.created_at).toLocaleString()}
            </p>
          ))
        ) : (
          <p>No AI requests recorded yet.</p>
        )}
      </section>
      {message && (
        <p role="status" className="legal-note mt-4">
          {message}
        </p>
      )}
    </>
  );
}
function AiForm({
  value,
  busy,
  onSave,
}: {
  value: { enabled: boolean; daily_limit: number; input_limit: number };
  busy: boolean;
  onSave: (v: typeof value) => Promise<void>;
}) {
  const [settings, setSettings] = useState(value);
  return (
    <section>
      <h2 className="text-xl mb-4">Resume AI controls</h2>
      <form
        className="form-stack max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(settings);
        }}
      >
        <label className="flex gap-3">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          />
          Enable resume AI
        </label>
        <Field label="Daily requests per user">
          <input
            aria-label="Daily requests per user"
            type="number"
            min={0}
            max={1000}
            required
            value={settings.daily_limit}
            onChange={(e) => setSettings({ ...settings, daily_limit: Number(e.target.value) })}
          />
        </Field>
        <Field label="Maximum input characters">
          <input
            aria-label="Maximum input characters"
            type="number"
            min={1}
            max={200000}
            required
            value={settings.input_limit}
            onChange={(e) => setSettings({ ...settings, input_limit: Number(e.target.value) })}
          />
        </Field>
        <Button disabled={busy}>Save AI controls</Button>
      </form>
    </section>
  );
}
