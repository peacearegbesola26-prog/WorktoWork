import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BriefcaseBusiness, CalendarDays, MapPin, Send, Wallet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationAction } from "@/features/marketplace/workflow-page";
import { Field, SelectField, PageHeading, EmptyState } from "@/components/work/shared";
import { myJobsOptions, jobApplicationsOptions, myApplicationsOptions } from "./query";
import {
  getMyJobs,
  saveJob,
  searchJobs,
  jobDetails,
  applyToJob,
  withdrawApplication,
  reviewApplication,
} from "./jobs.functions";
import {
  emptyJob,
  jobSchema,
  applySchema,
  splitList,
  money,
  amountOrNone,
  currencies,
  experienceLevels,
  locationTypes,
  budgetTypes,
  type JobDraft,
  type JobCommand,
  type JobSearch,
} from "./schemas";

type MyJob = Awaited<ReturnType<typeof getMyJobs>>[number];

const errorMessage = (e: unknown) =>
  e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.";

function day(value: string | null) {
  if (!value) return "No deadline";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "No deadline";
  // A date-only value ("2026-11-20") is parsed as midnight UTC, so format it in UTC to
  // avoid showing the previous day in US time zones. Full timestamps use the viewer's zone.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  });
}

const applicationNote: Record<string, string> = {
  submitted: "You can still withdraw it.",
  reviewed: "The buyer has reviewed your application.",
  shortlisted: "The buyer has shortlisted you.",
  hired: "The buyer has hired you for this job.",
  rejected: "The buyer did not choose your application this time.",
  withdrawn: "You withdrew this application.",
};

function JobStatus({ status }: { status: string }) {
  return <span className="status-pill">{status}</span>;
}

export function PostJobPage({ jobId = "" }: { jobId?: string }) {
  const { data: jobs } = useSuspenseQuery(myJobsOptions);
  const existing = jobId ? jobs.find((j) => j.id === jobId) : undefined;
  if (jobId && !existing)
    return (
      <EmptyState
        title="Job not found"
        description="This job is not in your list. It may have been deleted."
        action={
          <Button asChild>
            <Link to="/app/jobs">Back to my jobs</Link>
          </Button>
        }
      />
    );
  return <JobForm key={existing?.id ?? "new"} job={existing} />;
}

function JobForm({ job }: { job?: MyJob | undefined }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useServerFn(saveJob);
  const [value, setValue] = useState<JobDraft>(() =>
    job
      ? {
          title: job.title,
          description: job.description,
          category: job.category,
          skills: job.skills,
          experience_level: job.experience_level as JobDraft["experience_level"],
          location_type: job.location_type as JobDraft["location_type"],
          country: job.country,
          budget_type: job.budget_type as JobDraft["budget_type"],
          budget_amount: job.budget_amount,
          budget_currency: job.budget_currency,
          closing_date: job.closing_date ?? "",
        }
      : emptyJob,
  );
  const [skillText, setSkillText] = useState(job ? job.skills.join(", ") : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  // Remember the id once a new job is first saved, so a retry after a failed publish
  // updates that draft instead of inserting a duplicate.
  const [savedId, setSavedId] = useState<string | undefined>(job?.id);

  const set = <K extends keyof JobDraft>(key: K, v: JobDraft[K]) =>
    setValue((old) => ({ ...old, [key]: v }));

  async function submit(action: "draft" | "publish") {
    const parsed = jobSchema.safeParse({ ...value, skills: splitList(skillText) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setBusy(action);
    setError("");
    try {
      const saved = await save({
        data: { action: "save", id: savedId, value: parsed.data } satisfies JobCommand,
      });
      setSavedId(saved.id);
      if (action === "publish") {
        await save({ data: { action: "publish", id: saved.id } satisfies JobCommand });
        await client.invalidateQueries({ queryKey: myJobsOptions.queryKey });
        toast.success("Your job is published and visible to sellers.");
        await navigate({ to: "/app/jobs" });
        return;
      }
      await client.invalidateQueries({ queryKey: myJobsOptions.queryKey });
      toast.success("Draft saved.");
      if (!job) await navigate({ to: "/app/post-job", search: { job: saved.id } });
    } catch (e) {
      // The draft may have been saved before the publish step failed; refresh the list so it shows.
      await client.invalidateQueries({ queryKey: myJobsOptions.queryKey });
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="narrow-content">
      <PageHeading
        title={job ? "Edit job" : "Post a job"}
        description="Describe the work, the budget and the deadline. Only you can see a draft."
        action={
          <Button asChild variant="outline">
            <Link to="/app/jobs">My jobs</Link>
          </Button>
        }
      />
      <div className="form-stack">
        <Field label="Job title">
          <input
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Build a landing page for an Austin, Texas bakery"
          />
        </Field>
        <Field label="Category" hint="e.g. Design, Writing, Development, Data, Marketing">
          <input
            value={value.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Category"
          />
        </Field>
        <Field
          label="Description"
          hint="What the work involves, what you expect and how you will judge good work."
        >
          <textarea
            rows={9}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the work"
          />
        </Field>
        <Field label="Required skills" hint="Separate skills with commas.">
          <input
            value={skillText}
            onChange={(e) => setSkillText(e.target.value)}
            placeholder="e.g. Figma, HTML, Copywriting"
          />
        </Field>
        <div className="filter-grid">
          <SelectField
            label="Experience level"
            value={value.experience_level}
            onChange={(v) => set("experience_level", v as JobDraft["experience_level"])}
            options={[...experienceLevels]}
          />
          <SelectField
            label="Work location"
            value={value.location_type}
            onChange={(v) => set("location_type", v as JobDraft["location_type"])}
            options={[...locationTypes]}
          />
          <Field label="Country">
            <input
              value={value.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="e.g. United States (Texas)"
            />
          </Field>
        </div>
        <div className="filter-grid">
          <SelectField
            label="Budget type"
            value={value.budget_type}
            onChange={(v) => set("budget_type", v as JobDraft["budget_type"])}
            options={[...budgetTypes]}
          />
          <Field label="Budget amount">
            <input
              type="number"
              min="1"
              step="0.01"
              value={value.budget_amount ?? ""}
              onChange={(e) =>
                set("budget_amount", e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="e.g. 350000"
            />
          </Field>
          <SelectField
            label="Budget currency"
            value={value.budget_currency}
            onChange={(v) => set("budget_currency", v)}
            options={[...currencies]}
          />
        </div>
        <Field label="Closing date" hint="Optional. Applications stop after this date.">
          <input
            type="date"
            value={value.closing_date}
            onChange={(e) => set("closing_date", e.target.value)}
          />
        </Field>
        {error && (
          <p className="error-inline" role="alert">
            {error}
          </p>
        )}
        <div className="alert-actions">
          <Button variant="outline" disabled={!!busy} onClick={() => void submit("draft")}>
            {busy === "draft" ? "Saving…" : "Save draft"}
          </Button>
          <Button disabled={!!busy} onClick={() => void submit("publish")}>
            {busy === "publish" ? "Publishing…" : "Publish job"}
          </Button>
        </div>
        <p className="legal-note">
          Publishing makes this job visible to seller accounts on Work to Work. Payments are not
          connected, so no funds are collected or held for this job.
        </p>
      </div>
    </section>
  );
}

export function MyJobsPage() {
  const { data: jobs } = useSuspenseQuery(myJobsOptions);
  const client = useQueryClient();
  const save = useServerFn(saveJob);
  const [error, setError] = useState("");

  async function run(command: JobCommand, message: string) {
    setError("");
    try {
      await save({ data: command });
      await client.invalidateQueries({ queryKey: myJobsOptions.queryKey });
      toast.success(message);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeading
        title="My jobs"
        description="Your drafts, published, closed and archived jobs."
        action={
          <Button asChild>
            <Link to="/app/post-job">Post a job</Link>
          </Button>
        }
      />
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Draft a job and publish it when you are ready to receive applications."
          action={
            <Button asChild>
              <Link to="/app/post-job">Post a job</Link>
            </Button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Budget</th>
                <th>Closing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.title}</strong>
                    <small>{j.category}</small>
                  </td>
                  <td>
                    <JobStatus status={j.status} />
                  </td>
                  <td>
                    <strong>{j.applications}</strong>
                    <small>{j.waiting} waiting for review</small>
                  </td>
                  <td>{money(j.budget_amount, j.budget_currency)}</td>
                  <td>{day(j.closing_date)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="link" size="sm">
                        <Link to="/app/post-job" search={{ job: j.id }}>
                          Edit
                        </Link>
                      </Button>
                      <Button asChild variant="link" size="sm">
                        <Link to="/app/applications" search={{ job: j.id }}>
                          Applications
                        </Link>
                      </Button>
                      {j.status === "draft" && (
                        <>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              void run({ action: "publish", id: j.id }, "Job published.")
                            }
                          >
                            Publish
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              window.confirm("Delete this draft? This cannot be undone.") &&
                              void run({ action: "delete", id: j.id }, "Draft deleted.")
                            }
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {j.status === "published" && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void run({ action: "close", id: j.id }, "Job closed.")}
                        >
                          Close
                        </Button>
                      )}
                      {(j.status === "published" || j.status === "closed") && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void run({ action: "archive", id: j.id }, "Job archived.")}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function ApplicationsPage({ initialJob = "" }: { initialJob?: string }) {
  const { data } = useSuspenseQuery(jobApplicationsOptions);
  const client = useQueryClient();
  const review = useServerFn(reviewApplication);
  const [job, setJob] = useState(initialJob || "All");
  const [status, setStatus] = useState("All");
  const [error, setError] = useState("");

  const rows = data.applications.filter(
    (a) => (job === "All" || a.job_id === job) && (status === "All" || a.status === status),
  );

  async function decide(id: string, next: "reviewed" | "shortlisted" | "rejected" | "hired") {
    setError("");
    try {
      await review({ data: { id, status: next } });
      await client.invalidateQueries({ queryKey: jobApplicationsOptions.queryKey });
      await client.invalidateQueries({ queryKey: myJobsOptions.queryKey });
      toast.success("Application updated.");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeading
        title="Applications"
        description="Applications sellers send to your jobs. Only you can see them."
      />
      <div className="filter-grid">
        <Field label="Job">
          <select value={job} onChange={(e) => setJob(e.target.value)}>
            <option value="All">All jobs</option>
            {data.jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </Field>
        <SelectField
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            "All",
            "submitted",
            "reviewed",
            "shortlisted",
            "rejected",
            "hired",
            "withdrawn",
          ]}
        />
      </div>
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Applications appear here once sellers apply to your published jobs."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Job</th>
                <th>Note</th>
                <th>Proposed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.seller_name || "Seller"}</strong>
                    <small>{day(a.created_at)}</small>
                  </td>
                  <td>{a.jobs?.title ?? "Job unavailable"}</td>
                  <td>
                    <small>{a.cover_note.slice(0, 180)}</small>
                  </td>
                  <td>{amountOrNone(a.proposed_amount, a.jobs?.budget_currency ?? "")}</td>
                  <td>
                    <JobStatus status={a.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {!['withdrawn', 'rejected'].includes(a.status) && <ConversationAction application={a.id} />}
                      {a.status !== "reviewed" && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void decide(a.id, "reviewed")}
                        >
                          Review
                        </Button>
                      )}
                      {a.status !== "shortlisted" && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void decide(a.id, "shortlisted")}
                        >
                          Shortlist
                        </Button>
                      )}
                      {a.status !== "rejected" && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void decide(a.id, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                      {a.status !== "hired" && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() =>
                            window.confirm(`Hire ${a.seller_name || "this seller"}?`) &&
                            void decide(a.id, "hired")
                          }
                        >
                          Hire
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function BrowseJobsPage() {
  const initial: JobSearch = {
    query: "",
    category: "",
    country: "",
    work: "All",
    experience: "All",
    sort: "newest",
    page: 1,
  };
  const [filters, setFilters] = useState<JobSearch>(initial);
  const search = useServerFn(searchJobs);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["job-search", filters],
    queryFn: () => search({ data: filters }),
  });
  const change = <K extends keyof JobSearch>(key: K, value: JobSearch[K]) =>
    setFilters((old) => ({ ...old, [key]: value, page: 1 }));
  const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const goPage = (p: number) =>
    setFilters((old) => ({ ...old, page: Math.min(pages, Math.max(1, p)) }));

  return (
    <>
      <PageHeading
        title="Open jobs"
        description="Jobs hiring accounts have published. Applications are free and go straight to the buyer."
      />
      <Field label="Search jobs">
        <input
          value={filters.query}
          onChange={(e) => change("query", e.target.value)}
          placeholder="Title, description or category"
        />
      </Field>
      <div className="filter-grid mt-4">
        <Field label="Category">
          <input
            value={filters.category}
            onChange={(e) => change("category", e.target.value)}
            placeholder="e.g. Design"
          />
        </Field>
        <Field label="Country">
          <input
            value={filters.country}
            onChange={(e) => change("country", e.target.value)}
            placeholder="e.g. United States (Texas)"
          />
        </Field>
        <SelectField
          label="Work location"
          value={filters.work}
          onChange={(v) => change("work", v as JobSearch["work"])}
          options={["All", ...locationTypes]}
        />
        <SelectField
          label="Experience level"
          value={filters.experience}
          onChange={(v) => change("experience", v as JobSearch["experience"])}
          options={["All", ...experienceLevels]}
        />
        <SelectField
          label="Sort by"
          value={filters.sort}
          onChange={(v) => change("sort", v as JobSearch["sort"])}
          options={["newest", "oldest", "budget"]}
        />
      </div>
      <div className="results-top">
        <p>{data ? `${data.total} open job${data.total === 1 ? "" : "s"}` : "Loading jobs…"}</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </div>
      {error && (
        <p className="error-inline" role="alert">
          Jobs could not be loaded. Please try again.
        </p>
      )}
      {isPending ? (
        <p className="loading-state" role="status">
          Loading jobs…
        </p>
      ) : !data || data.rows.length === 0 ? (
        <EmptyState
          title="No open jobs found"
          description="Try another category, country or work location."
        />
      ) : (
        <div className="opportunity-grid">
          {data.rows.map((j) => (
            <article className="opportunity-card" key={j.id}>
              <h3>
                <Link to="/app/open-jobs/$id" params={{ id: j.id }}>
                  {j.title}
                </Link>
              </h3>
              <p>{j.category}</p>
              <div className="opportunity-meta">
                <span>
                  <MapPin size={14} /> {j.location_type}
                  {j.country ? ` · ${j.country}` : ""}
                </span>
                <span>
                  <Wallet size={14} /> {money(j.budget_amount, j.budget_currency)}
                </span>
                <span>
                  <CalendarDays size={14} /> {day(j.closing_date)}
                </span>
              </div>
              {j.my_application ? (
                <span className="status-pill">Applied · {j.my_application}</span>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to="/app/open-jobs/$id" params={{ id: j.id }}>
                    View and apply
                  </Link>
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => goPage(filters.page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {filters.page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= pages}
            onClick={() => goPage(filters.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}

export function JobDetailPage({ id }: { id: string }) {
  const client = useQueryClient();
  const load = useServerFn(jobDetails);
  const apply = useServerFn(applyToJob);
  const withdraw = useServerFn(withdrawApplication);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, isPending } = useQuery({
    queryKey: ["job-details", id],
    queryFn: () => load({ data: id }),
  });

  async function send() {
    const parsed = applySchema.safeParse({
      job_id: id,
      cover_note: note,
      proposed_amount: amount === "" ? null : Number(amount),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your application.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apply({ data: parsed.data });
      await client.invalidateQueries({ queryKey: ["job-details", id] });
      await client.invalidateQueries({ queryKey: myApplicationsOptions.queryKey });
      toast.success("Your application was sent.");
      setNote("");
      setAmount("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function pull() {
    if (!data?.application) return;
    setBusy(true);
    setError("");
    try {
      await withdraw({ data: data.application.id });
      await client.invalidateQueries({ queryKey: ["job-details", id] });
      await client.invalidateQueries({ queryKey: myApplicationsOptions.queryKey });
      toast.success("Application withdrawn.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (isPending)
    return (
      <p className="loading-state" role="status">
        Loading job…
      </p>
    );
  if (!data)
    return (
      <EmptyState
        title="Job not available"
        description="This job is no longer open, or it was never published."
        action={
          <Button asChild>
            <Link to="/app/open-jobs">Back to open jobs</Link>
          </Button>
        }
      />
    );

  const { job, application } = data;

  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link to="/app/open-jobs">
          <ArrowLeft size={16} /> Back to open jobs
        </Link>
      </Button>
      <div className="detail-layout">
        <div className="detail-main">
          <PageHeading title={job.title} description={job.category} />
          <h2>About this job</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
          {job.skills.length > 0 && (
            <>
              <h2>Required skills</h2>
              <div className="skills">
                {job.skills.map((s) => (
                  <span className="status-pill" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <aside className="detail-aside">
          <dl>
            <dt>Budget</dt>
            <dd>{money(job.budget_amount, job.budget_currency)}</dd>
            <dt>Budget type</dt>
            <dd>{job.budget_type}</dd>
            <dt>Experience</dt>
            <dd>{job.experience_level}</dd>
            <dt>Location</dt>
            <dd>
              {job.location_type}
              {job.country ? ` · ${job.country}` : ""}
            </dd>
            <dt>Closing</dt>
            <dd>{day(job.closing_date)}</dd>
          </dl>
          {application ? (
            <div className="integration-state">
              <div>
                <strong>
                  <Send size={16} /> Application {application.status}
                </strong>
                <p>
                  Sent {day(application.created_at)}.{" "}
                  {applicationNote[application.status] ?? "The buyer is reviewing your application."}
                </p>
                {application.status === "submitted" && (
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void pull()}>
                    Withdraw application
                  </Button>
                )}
                {!['withdrawn', 'rejected'].includes(application.status) && <ConversationAction application={application.id} />}
              </div>
            </div>
          ) : (
            <div className="form-stack">
              <Field
                label="Why are you a good fit?"
                hint="At least 20 characters. Only the buyer sees this."
              >
                <textarea
                  rows={6}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe relevant experience"
                />
              </Field>
              <Field
                label={`Proposed amount (${job.budget_currency})`}
                hint="Optional. Enter it in the job's currency."
              >
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 300000"
                />
              </Field>
              {error && (
                <p className="error-inline" role="alert">
                  {error}
                </p>
              )}
              <Button disabled={busy} onClick={() => void send()}>
                {busy ? "Sending…" : "Send application"}
              </Button>
              <p className="legal-note">
                Payments are not connected. Work to Work does not hold funds or guarantee payment.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export function MyApplicationsPage() {
  const { data } = useSuspenseQuery(myApplicationsOptions);
  const client = useQueryClient();
  const withdraw = useServerFn(withdrawApplication);
  const [error, setError] = useState("");

  async function pull(id: string) {
    setError("");
    try {
      await withdraw({ data: id });
      await client.invalidateQueries({ queryKey: myApplicationsOptions.queryKey });
      toast.success("Application withdrawn.");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeading
        title="My applications"
        description="Every job you have applied for, and where it stands."
        action={
          <Button asChild>
            <Link to="/app/open-jobs">Browse open jobs</Link>
          </Button>
        }
      />
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      {data.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Apply to an open job and it will appear here."
          action={
            <Button asChild>
              <Link to="/app/open-jobs">Browse open jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Status</th>
                <th>Proposed</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.jobs?.title ?? "Job unavailable"}</strong>
                    <small>{a.jobs?.category ?? ""}</small>
                  </td>
                  <td>
                    <JobStatus status={a.status} />
                  </td>
                  <td>{amountOrNone(a.proposed_amount, a.jobs?.budget_currency ?? "")}</td>
                  <td>{day(a.created_at)}</td>
                  <td>
                    {!['withdrawn', 'rejected'].includes(a.status) && <ConversationAction application={a.id} />}
                    {a.status === "submitted" ? (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          window.confirm("Withdraw this application?") && void pull(a.id)
                        }
                      >
                        Withdraw
                      </Button>
                    ) : (
                      <small className="text-muted-foreground">No action available</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function MarketplaceNotice() {
  return (
    <div className="integration-state">
      <BriefcaseBusiness size={22} />
      <div>
        <strong>Payments Not connected</strong>
        <p>
          Work to Work does not collect, hold or release funds yet. Agree terms directly with the
          other party.
        </p>
      </div>
    </div>
  );
}
