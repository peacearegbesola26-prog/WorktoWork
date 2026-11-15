import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Bookmark, BriefcaseBusiness, Bell, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PageHeading, EmptyState, SelectField } from "@/components/work/shared";
import { getWorkspace, updateWorkspace } from "./workspace.functions";
import {
  applicationSchema,
  alertSchema,
  profileSchema,
  splitList,
  locations,
  statuses,
  type Command,
} from "./schemas";
import { SignOutButton } from "./shell";
import { workspaceOptions } from "./query";
type Data = Awaited<ReturnType<typeof getWorkspace>>;
export function WorkspacePage({
  view,
}: {
  view: "dashboard" | "profile" | "settings" | "saved" | "tracker" | "alerts" | "opportunities";
}) {
  const { data } = useSuspenseQuery(workspaceOptions);
  const client = useQueryClient();
  const update = useServerFn(updateWorkspace);
  const mutation = useMutation({
    mutationFn: (command: Command) => update({ data: command }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workspaceOptions.queryKey });
      toast.success("Changes saved.");
    },
    onError: () => toast.error("Your changes could not be saved. Please try again."),
  });
  const save = (command: Command) => mutation.mutateAsync(command);
  if (view === "profile")
    return <ProfileForm profile={data.profile} save={save} busy={mutation.isPending} />;
  if (view === "settings")
    return (
      <>
        <PageHeading title="Settings" description="Your account and work preferences." />
        <ProfileForm profile={data.profile} save={save} busy={mutation.isPending} settings />
        <section className="mt-8">
          <h2 className="text-xl mb-4">Account</h2>
          <p className="text-muted-foreground mb-4">
            Password changes require the secure reset link sent to your email.
          </p>
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Reset password</Link>
          </Button>
          <SignOutButton />
        </section>
      </>
    );
  if (view === "tracker") return <Tracker data={data} save={save} busy={mutation.isPending} />;
  if (view === "alerts") return <Alerts data={data} save={save} busy={mutation.isPending} />;
  if (view === "dashboard")
    return (
      <>
        <PageHeading
          title={data.profile?.name ? `Welcome, ${data.profile.name}.` : "Your next chapter."}
          description="Your opportunities and applications, in one place."
        />
        <div className="stat-grid">
          {[
            {
              label: "Saved opportunities",
              count: data.counts.saved,
              icon: Bookmark,
              to: "/saved",
            },
            {
              label: "Tracked applications",
              count: data.counts.tracker,
              icon: BriefcaseBusiness,
              to: "/tracker",
            },
            { label: "Alert preferences", count: data.counts.alerts, icon: Bell, to: "/alerts" },
          ].map((item) => (
            <article className="stat-card" key={item.label}>
              <item.icon size={20} />
              <p>{item.label}</p>
              <strong>{item.count}</strong>
              <Button asChild variant="link">
                <Link to={item.to}>View</Link>
              </Button>
            </article>
          ))}
        </div>
        <section className="mt-8">
          <h2 className="text-xl mb-4">Opportunity discovery</h2>
          <p className="legal-note">
            Live sources are not connected. Notifications, AI career processing, resume uploads and
            payments are not active.
          </p>
          <Button asChild>
            <Link to="/opportunities">Explore opportunities</Link>
          </Button>
        </section>
      </>
    );
  if (view === "saved")
    return (
      <>
        <PageHeading title="Saved opportunities" description="Your private shortlist." />
        {data.saved.length === 0 ? (
          <EmptyState
            title="No saved opportunities yet"
            description="Live sources are not connected yet. Fictional demo records stay in Explore Demo."
          />
        ) : (
          <div className="opportunity-grid">
            {data.saved.map((row) => (
              <article className="opportunity-card" key={row.opportunity_id}>
                <h3>{row.opportunities?.title ?? "Opportunity unavailable"}</h3>
                <p>{row.opportunities?.company}</p>
                <Button
                  variant="outline"
                  disabled={mutation.isPending || !row.opportunities}
                  onClick={() =>
                    void save({ action: "trackOpportunity", id: row.opportunity_id }).catch(
                      () => {},
                    )
                  }
                >
                  Track application
                </Button>
                <Button
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={() =>
                    void save({ action: "unsave", id: row.opportunity_id }).catch(() => {})
                  }
                >
                  Remove saved
                </Button>
              </article>
            ))}
          </div>
        )}
      </>
    );
  return <Discovery data={data} save={save} busy={mutation.isPending} />;
}
function ProfileForm({
  profile,
  save,
  busy,
  settings = false,
}: {
  profile: Data["profile"];
  save: (c: Command) => Promise<unknown>;
  busy: boolean;
  settings?: boolean;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [skills, setSkills] = useState(profile?.skills.join(", ") ?? "");
  const [services, setServices] = useState(profile?.services.join(", ") ?? "");
  const [countries, setCountries] = useState(profile?.preferred_countries.join(", ") ?? "");
  const [work, setWork] = useState(profile?.work_preference ?? "All");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = profileSchema.safeParse({
      name,
      skills: splitList(skills),
      services: splitList(services),
      preferred_countries: splitList(countries),
      work_preference: work,
    });
    if (!parsed.success) {
      setError("Please check the profile fields and try again.");
      return;
    }
    try {
      await save({ action: "profile", value: parsed.data });
    } catch {
      setError("Your profile could not be saved. Please try again.");
    }
  }
  return (
    <>
      {!settings && (
        <PageHeading
          title="Profile"
          description="Your skills, services and preferred places to work."
        />
      )}
      <form className="form-stack max-w-2xl" onSubmit={submit}>
        {!settings && (
          <>
            <Field label="Full name">
              <input
                maxLength={200}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Skills" hint="Separate skills with commas.">
              <input value={skills} onChange={(e) => setSkills(e.target.value)} />
            </Field>
            <Field label="Services" hint="Separate services with commas.">
              <input value={services} onChange={(e) => setServices(e.target.value)} />
            </Field>
          </>
        )}
        <Field label="Preferred countries" hint="Separate countries with commas.">
          <input value={countries} onChange={(e) => setCountries(e.target.value)} />
        </Field>
        <SelectField
          label="Work preference"
          value={work}
          onChange={setWork}
          options={[...locations]}
        />
        <Button disabled={busy} type="submit">
          {busy ? "Saving…" : settings ? "Save preferences" : "Save profile"}
        </Button>
        {error && (
          <p role="alert" className="error-inline">
            {error}
          </p>
        )}
      </form>
    </>
  );
}
function Tracker({
  data,
  save,
  busy,
}: {
  data: Data;
  save: (c: Command) => Promise<unknown>;
  busy: boolean;
}) {
  const [id, setId] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Saved");
  const [error, setError] = useState("");
  function clear() {
    setId(undefined);
    setTitle("");
    setCompany("");
    setNotes("");
    setStatus("Saved");
    setError("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = applicationSchema.safeParse({ title, company, notes, status });
    if (!value.success) {
      setError("Enter an application title and valid status.");
      return;
    }
    try {
      await save({ action: "application", id, value: value.data });
      clear();
    } catch {
      setError("This application could not be saved.");
    }
  }
  return (
    <>
      <PageHeading
        title="Application tracker"
        description="Track your own applications. No application is submitted automatically."
      />
      <form className="form-stack max-w-2xl mb-8" onSubmit={submit}>
        <Field label="Application title">
          <input
            required
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input maxLength={200} value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <SelectField label="Status" value={status} onChange={setStatus} options={[...statuses]} />
        <Field label="Notes">
          <textarea maxLength={10000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <Button disabled={busy} type="submit">
            {busy ? "Saving…" : id ? "Save application" : "Add application"}
          </Button>
          {id && (
            <Button variant="outline" type="button" onClick={clear}>
              Cancel edit
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="error-inline">
            {error}
          </p>
        )}
      </form>
      {data.tracker.length === 0 ? (
        <EmptyState
          title="No tracked applications"
          description="Add an application you are working on."
        />
      ) : (
        <div className="grid gap-4">
          {data.tracker.map((row) => (
            <article className="opportunity-card" key={row.id}>
              <h3>{row.title}</h3>
              <p>{row.company}</p>
              <p className="text-primary">{row.status}</p>
              <p className="whitespace-pre-wrap break-words">{row.notes}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={busy}
                  aria-label={`Edit ${row.title}`}
                  onClick={() => {
                    setId(row.id);
                    setTitle(row.title);
                    setCompany(row.company);
                    setNotes(row.notes);
                    setStatus(row.status);
                  }}
                >
                  <Pencil size={16} />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  aria-label={`Delete ${row.title}`}
                  onClick={() => {
                    if (window.confirm("Remove this application?"))
                      void save({ action: "removeApplication", id: row.id })
                        .then(() => {
                          if (id === row.id) clear();
                        })
                        .catch(() => {});
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function Alerts({
  data,
  save,
  busy,
}: {
  data: Data;
  save: (c: Command) => Promise<unknown>;
  busy: boolean;
}) {
  const [id, setId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [countries, setCountries] = useState("");
  const [work, setWork] = useState("All");
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState("");
  function clear() {
    setId(undefined);
    setName("");
    setKeywords("");
    setCountries("");
    setWork("All");
    setEnabled(true);
    setError("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = alertSchema.safeParse({
      name,
      keywords,
      countries: splitList(countries),
      work_preference: work,
      enabled,
    });
    if (!value.success) {
      setError("Enter an alert name and valid preferences.");
      return;
    }
    try {
      await save({ action: "alert", id, value: value.data });
      clear();
    } catch {
      setError("Your alert preferences could not be saved.");
    }
  }
  return (
    <>
      <PageHeading
        title="Alert preferences"
        description="Save the opportunities you want to hear about."
      />
      <p role="status" className="legal-note">
        Preferences are saved, but notifications are not active. Scheduling and email delivery will
        be connected in a later stage.
      </p>
      <form className="form-stack max-w-2xl mb-8" onSubmit={submit}>
        <Field label="Alert name">
          <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Keywords">
          <input maxLength={1000} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </Field>
        <Field label="Countries">
          <input value={countries} onChange={(e) => setCountries(e.target.value)} />
        </Field>
        <SelectField
          label="Work preference"
          value={work}
          onChange={setWork}
          options={[...locations]}
        />
        <label className="flex gap-2 items-center">
          <input
            className="w-4"
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable preference (delivery inactive)
        </label>
        <div className="flex gap-2">
          <Button disabled={busy} type="submit">
            {busy ? "Saving…" : id ? "Save alert" : "Add alert preference"}
          </Button>
          {id && (
            <Button variant="outline" type="button" onClick={clear}>
              Cancel edit
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="error-inline">
            {error}
          </p>
        )}
      </form>
      {data.alerts.length === 0 ? (
        <EmptyState
          title="No alert preferences"
          description="Your saved preferences will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {data.alerts.map((row) => (
            <article className="opportunity-card" key={row.id}>
              <h3>{row.name}</h3>
              <p>
                {row.keywords} · {row.work_preference}
              </p>
              <p>
                {row.enabled ? "Enabled preference" : "Paused preference"} · Notifications inactive
              </p>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setId(row.id);
                  setName(row.name);
                  setKeywords(row.keywords);
                  setCountries(row.countries.join(", "));
                  setWork(row.work_preference);
                  setEnabled(row.enabled);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Remove this alert preference?"))
                    void save({ action: "removeAlert", id: row.id })
                      .then(() => {
                        if (id === row.id) clear();
                      })
                      .catch(() => {});
                }}
              >
                Delete
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function Discovery({
  data,
  save,
  busy,
}: {
  data: Data;
  save: (c: Command) => Promise<unknown>;
  busy: boolean;
}) {
  const [query, setQuery] = useState("");
  const rows = data.opportunities.filter((row) =>
    (row.title + " " + row.company + " " + row.skills.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Opportunity discovery"
        description="Opportunities from connected, permitted sources."
      />
      <Field label="Search opportunities">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, company or skill"
        />
      </Field>
      {rows.length === 0 ? (
        <EmptyState
          title={
            data.opportunities.length
              ? "No matching opportunities"
              : "Live sources are not connected yet"
          }
          description={
            data.opportunities.length
              ? "Try another search."
              : "No live results are available. Explore Demo contains fictional examples only."
          }
          action={
            <Button variant="outline" asChild>
              <Link to="/demo/dashboard">Explore Demo</Link>
            </Button>
          }
        />
      ) : (
        <div className="opportunity-grid mt-6">
          {rows.map((row) => (
            <article className="opportunity-card" key={row.id}>
              <Search size={18} />
              <h3>{row.title}</h3>
              <p>{row.company}</p>
              <p>{row.summary}</p>
              <p>
                {row.country ?? "Country unknown"} · {row.work_location}
              </p>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() =>
                  void save({
                    action: data.saved.some((s) => s.opportunity_id === row.id) ? "unsave" : "save",
                    id: row.id,
                  }).catch(() => {})
                }
              >
                {data.saved.some((s) => s.opportunity_id === row.id)
                  ? "Unsave"
                  : "Save opportunity"}
              </Button>
              <Button
                disabled={busy}
                variant="ghost"
                onClick={() =>
                  void save({ action: "trackOpportunity", id: row.id }).catch(() => {})
                }
              >
                Track application
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
