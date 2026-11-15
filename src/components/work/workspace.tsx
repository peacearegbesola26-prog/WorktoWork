import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Globe2,
  Bookmark,
  BriefcaseBusiness,
  Bell,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  RotateCcw,
  FileText,
  Upload,
  Check,
  Mail,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  opportunities,
  sources,
  emptyFilters,
  filterOpportunities,
  demoStats,
  statuses,
  type Filters,
  type AlertRule,
} from "@/features/demo/model";
import { useDemo } from "@/features/demo/context";
import {
  PageHeading,
  DemoNotice,
  OpportunityCard,
  EmptyState,
  Field,
  SelectField,
  AIRequired,
  SourceIcon,
  DemoBadge,
} from "./shared";
const skills = ["All", ...new Set(opportunities.flatMap((o) => o.skills))];
const countries = ["All", ...new Set(opportunities.map((o) => o.country ?? "Unknown"))];
export function Dashboard() {
  const demo = useDemo();
  const stats = demoStats(demo.saved, demo.tracker, demo.alerts);
  return (
    <div className="fade-in">
      <PageHeading
        eyebrow="YOUR OPPORTUNITY WORKSPACE"
        title="A world of possibilities."
        description="Welcome to your demo workspace. Let’s find your next chapter."
        action={
          <Button asChild>
            <Link to="/demo/social">
              <Search /> Find opportunities
            </Link>
          </Button>
        }
      />
      <DemoNotice />
      <div className="stat-grid">
        {Object.entries(stats).map(([key, value], i) => {
          const Icon = [Search, Bookmark, BriefcaseBusiness, Bell][i] ?? Search;
          return (
            <div className="stat" key={key}>
              <div className="stat-top">
                <span>
                  {
                    [
                      "Available opportunities",
                      "Saved opportunities",
                      "Tracked applications",
                      "Active demo alerts",
                    ][i]
                  }
                </span>
                <Icon />
              </div>
              <strong>{value}</strong>
              <small>
                {
                  [
                    "Fictional sample records",
                    "Your demonstration shortlist",
                    "In your demo pipeline",
                    "No notifications sent",
                  ][i]
                }
              </small>
            </div>
          );
        })}
      </div>
      <div className="section-heading">
        <div>
          <h2>Recommended opportunities</h2>
          <p>A selection from the shared sample dataset, not AI recommendations.</p>
        </div>
        <Link to="/demo/social">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="opportunity-grid">
        {opportunities.slice(0, 4).map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
      <div className="section-heading mt-8">
        <h2>Make your next move</h2>
      </div>
      <div className="quick-actions">
        <Link to="/demo/web" className="quick-action">
          <Globe2 />
          <div>
            <strong>Explore the wider web</strong>
            <span>Find possibilities beyond social</span>
          </div>
          <ArrowUpRight />
        </Link>
        <Link to="/demo/resume-builder" className="quick-action">
          <FileText />
          <div>
            <strong>Build your resume</strong>
            <span>Bring your experience together</span>
          </div>
          <ArrowUpRight />
        </Link>
        <Link to="/demo/alerts" className="quick-action">
          <Bell />
          <div>
            <strong>Create a demo alert</strong>
            <span>Define what you’re looking for</span>
          </div>
          <ArrowUpRight />
        </Link>
      </div>
    </div>
  );
}
export function Discovery({ web = false }: { web?: boolean }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rows = opportunities.filter((o) => (web ? o.source === "Web" : o.source !== "Web"));
  const results = filterOpportunities(rows, filters);
  const pages = Math.max(1, Math.ceil(results.length / 4));
  const visiblePage = Math.min(page, pages);
  function update(key: keyof Filters, value: string) {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }
  function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    window.setTimeout(() => {
      setFilters((p) => ({ ...p, query: draft }));
      setLoading(false);
    }, 250);
  }
  return (
    <div className="fade-in">
      <PageHeading
        eyebrow="DISCOVER YOUR NEXT CHAPTER"
        title={web ? "Web Discovery" : "Social Discovery"}
        description={
          web
            ? "Explore sample opportunities from the wider web."
            : "Find possibilities across your favourite social sources."
        }
      />
      <DemoNotice>
        {web
          ? "This stage searches demonstration records only. Natural-language input uses local keyword matching, not AI."
          : "Live connectors are not configured. These fictional records do not imply platform access or permission."}
      </DemoNotice>
      {!web && (
        <div className="source-status">
          {sources
            .filter((s) => s !== "Web")
            .map((s) => (
              <span key={s}>{s} · Not connected</span>
            ))}
        </div>
      )}
      <form className="search-form" onSubmit={search}>
        <Field
          label={
            web ? "What opportunity are you looking for?" : "Search by skill, service or keyword"
          }
        >
          <div className="search-input-wrap">
            <Search />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                web
                  ? "Find businesses in the UK looking for Shopify developers."
                  : "Try UI/UX Design, React or Video Editing"
              }
            />
            <Button type="submit" disabled={loading}>
              <Search />
              {loading ? "Searching…" : "Search " + (web ? "web" : "opportunities")}
            </Button>
          </div>
        </Field>
        {web && (
          <Button
            type="button"
            variant="link"
            className="mt-2 h-auto p-0 text-xs"
            onClick={() => {
              setDraft("Find businesses in the UK looking for Shopify developers.");
              setFilters((p) => ({
                ...p,
                query: "Find businesses in the UK looking for Shopify developers.",
              }));
              setPage(1);
            }}
          >
            Try the example search <ArrowUpRight />
          </Button>
        )}
        <div className="filter-grid">
          <SelectField
            label="Skill/service"
            value={filters.skill}
            onChange={(v) => update("skill", v)}
            options={skills}
          />
          <SelectField
            label="Country"
            value={filters.country}
            onChange={(v) => update("country", v)}
            options={countries}
          />
          <SelectField
            label="Work location"
            value={filters.remote}
            onChange={(v) => update("remote", v)}
            options={["All", "Remote", "On-site", "Hybrid", "Unknown"]}
          />
          <SelectField
            label="Source"
            value={filters.source}
            onChange={(v) => update("source", v)}
            options={["All", ...sources.filter((s) => (web ? s === "Web" : s !== "Web"))]}
          />
          <SelectField
            label="Opportunity type"
            value={filters.type}
            onChange={(v) => update("type", v)}
            options={["All", "Freelance", "Contract", "Full-time"]}
          />
          <Field label="Posted from">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => update("from", e.target.value)}
            />
          </Field>
          <Field label="Posted to">
            <input
              type="date"
              min={filters.from || undefined}
              value={filters.to}
              onChange={(e) => update("to", e.target.value)}
            />
          </Field>
        </div>
        <div className="filters-footer">
          <p className="sample-label">Dates refer to fictional demonstration scenarios.</p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFilters(emptyFilters);
              setDraft("");
              setPage(1);
            }}
          >
            <RotateCcw /> Reset filters
          </Button>
        </div>
        {filters.from && filters.to && filters.from > filters.to && (
          <p className="error-inline">The end date must be on or after the start date.</p>
        )}
      </form>
      <div className="results-top">
        <p>
          <strong>{results.length}</strong> sample opportunities
        </p>
        <label className="sort-control">
          Sort by
          <select
            aria-label="Sort results"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          Searching sample records…
        </div>
      ) : results.length ? (
        <>
          <div className="opportunity-grid">
            {results.slice((visiblePage - 1) * 4, visiblePage * 4).map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
          <div className="pagination">
            <Button
              variant="outline"
              disabled={visiblePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span>
              Page {visiblePage} of {pages}
            </span>
            <Button
              variant="outline"
              disabled={visiblePage === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
export function OpportunityDetails({ id }: { id: string }) {
  const o = opportunities.find((o) => o.id === id);
  const demo = useDemo();
  if (!o)
    return (
      <EmptyState
        title="Sample opportunity not found"
        description="This demonstration record does not exist."
        action={
          <Button asChild>
            <Link to="/demo/social">Back to discovery</Link>
          </Button>
        }
      />
    );
  return (
    <div className="fade-in">
      <Link to={o.source === "Web" ? "/demo/web" : "/demo/social"} className="back-link">
        <ArrowLeft size={14} /> Back to discovery
      </Link>
      <DemoNotice />
      <PageHeading title={o.title} description={o.company} />
      <div className="detail-layout">
        <div className="detail-main">
          <div className="flex items-center gap-3">
            <SourceIcon source={o.source} />
            <strong>{o.source}</strong>
            <DemoBadge>Sample opportunity</DemoBadge>
          </div>
          <h2>About the opportunity</h2>
          <p>{o.summary}</p>
          <h2>Skills & services</h2>
          <div className="skills">
            {o.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <h2>Source transparency</h2>
          <p>
            This is a fictional demonstration scenario, not a real or verified opportunity. No
            original source URL or publicly provided contact details are available. Source
            connectors require approved access before live discovery can be enabled.
          </p>
          <h2>Prepare your application</h2>
          <AIRequired />
          <Button asChild variant="outline">
            <Link to="/demo/resume-tailoring">
              Job-specific resume tailoring <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <aside className="detail-aside">
          <dl>
            {[
              ["Country", o.country ?? "Unknown"],
              ["Work location", o.remote],
              ["Opportunity type", o.type],
              ["Posted date (sample)", o.posted ?? "Unknown"],
              ["Last checked", o.checked ?? "Unknown"],
              ["Contact details", "Unknown"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Button
            variant={demo.saved.includes(id) ? "outline" : "default"}
            onClick={() => demo.toggleSaved(id)}
          >
            <Bookmark />
            {demo.saved.includes(id) ? "Unsave opportunity" : "Save opportunity"}
          </Button>
          <Button variant="outline" onClick={() => demo.track(id)}>
            <Plus />
            {demo.tracker[id] ? "Already in tracker" : "Add to tracker"}
          </Button>
          {o.originalUrl && (
            <Button asChild variant="outline">
              <a href={o.originalUrl} target="_blank" rel="noreferrer">
                View original <ArrowUpRight />
              </a>
            </Button>
          )}
          <p className="legal-note">
            Tracking changes stay in memory. No application is submitted.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Saved() {
  const demo = useDemo();
  const [q, setQ] = useState("");
  const rows = opportunities.filter(
    (o) => demo.saved.includes(o.id) && o.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Saved Opportunities"
        description="A little less searching. A shortlist of possibilities."
      />
      <DemoNotice />
      <Field label="Search your saved opportunities">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your demo shortlist"
        />
      </Field>
      <div className="section-heading mt-7">
        <h2>{rows.length} saved sample opportunities</h2>
      </div>
      {rows.length ? (
        <div className="opportunity-grid">
          {rows.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your shortlist is clear"
          description="Save an opportunity from discovery to see it here."
          action={
            <Button asChild>
              <Link to="/demo/social">
                Explore opportunities <ArrowUpRight />
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}
export function Tracker() {
  const demo = useDemo();
  const [filter, setFilter] = useState("All");
  const rows = opportunities.filter(
    (o) => demo.tracker[o.id] && (filter === "All" || demo.tracker[o.id] === filter),
  );
  return (
    <>
      <PageHeading
        title="Application Tracker"
        description="Keep your next steps in sight, from shortlist to offer."
        action={
          <Button asChild>
            <Link to="/demo/social">
              <Plus /> Add opportunity
            </Link>
          </Button>
        }
      />
      <DemoNotice>
        Demonstration tracking only. Changes stay in memory; no applications are submitted.
      </DemoNotice>
      <div className="narrow-content mb-6">
        <SelectField
          label="Application status"
          value={filter}
          onChange={setFilter}
          options={["All", ...statuses]}
        />
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to="/demo/opportunities/$id" params={{ id: o.id }}>
                      <strong>{o.title}</strong>
                      <small>{o.company}</small>
                    </Link>
                  </td>
                  <td>{o.source}</td>
                  <td>
                    <select
                      aria-label={`Status for ${o.title}`}
                      value={demo.tracker[o.id]}
                      onChange={(e) => {
                        const status = statuses.find((s) => s === e.target.value);
                        if (status) {
                          demo.setStatus(o.id, status);
                          toast.success("Demo application status updated.");
                        }
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${o.title} from tracker`}
                      title="Remove from tracker"
                      onClick={() => {
                        demo.removeTracked(o.id);
                        toast.success("Sample removed from tracker.");
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No applications in this view"
          description="Add a sample opportunity or choose another status."
        />
      )}
    </>
  );
}
const blankAlert: Omit<AlertRule, "id"> = {
  name: "",
  skill: "All",
  country: "All",
  source: "All",
  frequency: "Daily",
  active: true,
};
export function Alerts() {
  const demo = useDemo();
  const [editing, setEditing] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blankAlert);
  function update(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const rule = { ...form, name: form.name.trim(), id: editing ?? `alert-${Date.now()}` };
    demo.setAlerts(
      editing ? demo.alerts.map((a) => (a.id === editing ? rule : a)) : [...demo.alerts, rule],
    );
    setShow(false);
    setEditing(null);
    setForm(blankAlert);
    toast.success(
      "Demo alert " + (editing ? "updated." : "created. No notifications will be sent."),
    );
  }
  return (
    <>
      <PageHeading
        title="Alerts"
        description="Define the opportunities you’d like to hear about in the future."
        action={
          <Button
            onClick={() => {
              setShow(true);
              setEditing(null);
              setForm(blankAlert);
            }}
          >
            <Plus /> Create demo alert
          </Button>
        }
      />
      <DemoNotice>
        Demo alert rules send no notifications. Rules remain in memory and reset when the page is
        refreshed.
      </DemoNotice>
      {show && (
        <form className="alert-form" onSubmit={submit}>
          <h2 className="text-lg mb-5">{editing ? "Edit" : "Create"} demo alert</h2>
          <Field label="Alert name">
            <input
              required
              maxLength={100}
              placeholder="e.g. Remote design opportunities"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <div className="filter-grid">
            <SelectField
              label="Skill/service"
              value={form.skill}
              onChange={(v) => update("skill", v)}
              options={skills}
            />
            <SelectField
              label="Country"
              value={form.country}
              onChange={(v) => update("country", v)}
              options={countries}
            />
            <SelectField
              label="Source"
              value={form.source}
              onChange={(v) => update("source", v)}
              options={["All", ...sources]}
            />
            <SelectField
              label="Planned frequency"
              value={form.frequency}
              onChange={(v) => update("frequency", v)}
              options={["Hourly", "Daily", "Weekly"]}
            />
          </div>
          <div className="alert-actions">
            <Button type="submit">
              <Check /> Save demo rule
            </Button>
            <Button type="button" variant="outline" onClick={() => setShow(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {demo.alerts.length ? (
        <div className="alert-list">
          {demo.alerts.map((a) => (
            <article className="alert-item" key={a.id}>
              <Bell size={20} />
              <div>
                <h3>{a.name}</h3>
                <p>
                  {a.skill === "All" ? "All skills" : a.skill} ·{" "}
                  {a.country === "All" ? "All countries" : a.country} ·{" "}
                  {a.source === "All" ? "All sources" : a.source} · {a.frequency} (demo only)
                </p>
              </div>
              <Switch
                checked={a.active}
                aria-label={`Activate ${a.name}`}
                onCheckedChange={(active) =>
                  demo.setAlerts(demo.alerts.map((x) => (x.id === a.id ? { ...x, active } : x)))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                title="Edit demo alert"
                aria-label={`Edit ${a.name}`}
                onClick={() => {
                  setForm({ ...a });
                  setEditing(a.id);
                  setShow(true);
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete demo alert"
                aria-label={`Delete ${a.name}`}
                onClick={() => {
                  demo.setAlerts(demo.alerts.filter((x) => x.id !== a.id));
                  toast.success("Demo alert deleted.");
                }}
              >
                <Trash2 />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No demo alerts yet"
          description="Create a rule to explore your future alert preferences."
        />
      )}
    </>
  );
}
const tools = [
  {
    title: "Resume Builder",
    description:
      "Bring your experience, skills and education together in an editable resume with a live preview.",
    to: "/demo/resume-builder",
    icon: FileText,
    available: true,
  },
  {
    title: "Resume Optimizer",
    description:
      "A future AI review of your resume, including structure, clarity and how you present your achievements.",
    to: "/demo/resume-optimizer",
    icon: Sparkles,
  },
  {
    title: "Job-specific Resume Tailoring",
    description:
      "Prepare a resume that speaks to a specific opportunity, with your approval of every suggested change.",
    to: "/demo/resume-tailoring",
    icon: BriefcaseBusiness,
  },
  {
    title: "LinkedIn Profile Optimizer",
    description:
      "Refine your professional headline, about section and experience with future AI suggestions.",
    to: "/demo/linkedin-optimizer",
    icon: UserRound,
  },
  {
    title: "Cover Letter Generator",
    description:
      "Prepare a thoughtful, opportunity-specific cover letter using your experience and voice.",
    to: "/demo/cover-letter",
    icon: Mail,
  },
] as const;
export function Toolkit() {
  return (
    <>
      <PageHeading
        eyebrow="PUT YOUR BEST WORK FORWARD"
        title="Career Toolkit"
        description="A stronger application starts with a clearer story."
      />
      <DemoNotice>
        Resume editing works in memory. All AI-dependent actions require a future connection.
      </DemoNotice>
      <div className="toolkit-grid">
        {tools.map((t) => (
          <article key={t.title} className="toolkit-card">
            <div className="feature-icon">
              <t.icon size={22} />
            </div>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <Button variant={"available" in t ? "default" : "outline"} asChild>
              <Link to={t.to}>
                {"available" in t ? "Start building" : "View tool"}
                <ArrowUpRight />
              </Link>
            </Button>
            {!("available" in t) && (
              <span className="sample-label mt-3">AI connection required</span>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
export function ResumeBuilder() {
  const [resume, setResume] = useState({
    name: "",
    title: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    portfolio: "",
  });
  function update(key: keyof typeof resume, value: string) {
    setResume((p) => ({ ...p, [key]: value }));
  }
  return (
    <>
      <PageHeading
        title="Resume Builder"
        description="Bring your experience together. Your preview updates as you write."
      />
      <DemoNotice>
        Resume content stays only in memory. It is never saved to browser storage or transmitted.
        Refreshing clears your entries.
      </DemoNotice>
      <div className="editor-layout">
        <div className="form-stack">
          {Object.entries(resume).map(([key, value]) => (
            <Field
              key={key}
              label={
                {
                  name: "Full name",
                  title: "Professional title",
                  summary: "Professional summary",
                  experience: "Experience",
                  education: "Education",
                  skills: "Skills",
                  portfolio: "Portfolio links",
                }[key] ?? key
              }
            >
              {["summary", "experience", "education"].includes(key) ? (
                <textarea
                  value={value}
                  onChange={(e) => update(key as keyof typeof resume, e.target.value)}
                  placeholder={
                    {
                      summary: "Your experience and what you bring to a team",
                      experience: "Role, company, dates and key achievements",
                      education: "Qualification, institution and dates",
                    }[key]
                  }
                />
              ) : (
                <input
                  value={value}
                  onChange={(e) => update(key as keyof typeof resume, e.target.value)}
                  placeholder={
                    key === "portfolio"
                      ? "Portfolio and professional URLs"
                      : key === "skills"
                        ? "Separate your skills with commas"
                        : ""
                  }
                />
              )}
            </Field>
          ))}
          <AIRequired />
          <Button disabled>
            <Sparkles /> Enhance with AI — connection required
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setResume({
                name: "",
                title: "",
                summary: "",
                experience: "",
                education: "",
                skills: "",
                portfolio: "",
              })
            }
          >
            <RotateCcw /> Clear resume
          </Button>
        </div>
        <div>
          <p className="preview-label">LIVE RESUME PREVIEW · NOT STORED</p>
          <article className="resume-preview">
            <h2>{resume.name || "Your name"}</h2>
            <p className="resume-title">{resume.title || "Your professional title"}</p>
            {(["summary", "experience", "education", "skills", "portfolio"] as const).map((k) => (
              <section key={k}>
                <h3>
                  {
                    {
                      summary: "Profile",
                      experience: "Experience",
                      education: "Education",
                      skills: "Skills",
                      portfolio: "Portfolio",
                    }[k]
                  }
                </h3>
                <p>{resume[k] || "—"}</p>
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}
export function AITool({ kind }: { kind: "resume" | "linkedin" | "tailoring" | "cover" }) {
  const titles = {
    resume: "Resume Optimizer",
    linkedin: "LinkedIn Profile Optimizer",
    tailoring: "Job-specific Resume Tailoring",
    cover: "Cover Letter Generator",
  };
  const [text, setText] = useState("");
  return (
    <>
      <PageHeading
        title={titles[kind]}
        description="A future career tool, ready for an AI connection."
      />
      <DemoNotice>
        Entered text stays in memory only. Nothing is transmitted or processed.
      </DemoNotice>
      <div className="narrow-content">
        {kind === "resume" || kind === "tailoring" ? (
          <div className="upload-future">
            <Upload size={26} />
            <h3>Resume upload · Future integration</h3>
            <p>
              PDF and DOCX uploads will be available after secure storage and processing are
              connected.
            </p>
            <Button disabled variant="outline" className="mt-5">
              Upload unavailable in demo
            </Button>
          </div>
        ) : null}
        {kind === "tailoring" || kind === "cover" ? (
          <Field label="Sample opportunity">
            <select>
              {opportunities.map((o) => (
                <option key={o.id}>{o.title}</option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field
          label={
            kind === "linkedin"
              ? "Headline and about section"
              : kind === "cover"
                ? "Your experience and application notes"
                : "Resume text (optional preview input)"
          }
        >
          <textarea
            className="mt-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Keep personal information out of demonstration inputs."
          />
        </Field>
        <AIRequired />
        <Button disabled>
          <Sparkles /> AI connection required
        </Button>
        <p className="legal-note">
          No successful AI result is simulated. You will be able to review suggestions before using
          them when the integration is available.
        </p>
      </div>
    </>
  );
}
export function Profile() {
  const [form, setForm] = useState({
    name: "Demo professional",
    title: "Product designer",
    country: "Nigeria",
    city: "",
    skills: "UI/UX Design, Figma",
    services: "Product design",
    experience: "",
    portfolio: "",
    linkedin: "",
    countries: "United Kingdom, United States",
  });
  return (
    <>
      <PageHeading
        title="Profile"
        description="A place for your professional story and preferences."
      />
      <DemoNotice>
        This is a fictional demo profile. Edits stay in memory only; do not enter sensitive personal
        information.
      </DemoNotice>
      <form
        className="narrow-content form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Demo profile updated in memory. It is not saved to an account.");
        }}
      >
        {Object.entries(form).map(([key, value]) => (
          <Field
            key={key}
            label={
              {
                name: "Full name",
                title: "Professional title",
                country: "Country",
                city: "City",
                skills: "Skills",
                services: "Services",
                experience: "Experience",
                portfolio: "Portfolio URL",
                linkedin: "LinkedIn URL",
                countries: "Preferred countries",
              }[key] ?? key
            }
          >
            <input
              type={["portfolio", "linkedin"].includes(key) ? "url" : "text"}
              value={value}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            />
          </Field>
        ))}
        <Button type="submit">
          <Check /> Update demo profile
        </Button>
      </form>
    </>
  );
}
export function Settings() {
  const demo = useDemo();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeading
        title="Settings"
        description="Make this workspace feel a little more like you."
      />
      <DemoNotice />
      <div className="narrow-content">
        <section className="settings-section">
          <h2>Demo preferences</h2>
          <p>
            Your work location preference and saved sample IDs are the only information retained in
            browser storage.
          </p>
          <SelectField
            label="Preferred work location"
            value={demo.preference}
            onChange={demo.setPreference}
            options={["Remote", "Hybrid", "On-site", "All"]}
          />
        </section>
        <section className="settings-section">
          <h2>Connections</h2>
          <div className="source-status">
            {["Authentication", "Source connectors", "AI", "Email notifications"].map((s) => (
              <span key={s}>{s} · Not connected</span>
            ))}
          </div>
          <p>No services, API keys or payments are connected in Stage 1.</p>
        </section>
        <section className="settings-section">
          <h2>Reset Demo</h2>
          <p>
            Restore saved opportunities, tracked applications, alerts and preferences to their
            initial demonstration state.
          </p>
          {confirm ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  demo.reset();
                  setConfirm(false);
                }}
              >
                Confirm reset
              </Button>
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setConfirm(true)}>
              <RotateCcw /> Reset Demo
            </Button>
          )}
        </section>
        <section>
          <h2 className="text-lg mb-3">Account management</h2>
          <p className="legal-note">
            No real account exists in demo mode. Account deletion and password changes require
            authentication to be connected.
          </p>
          <Button disabled variant="outline">
            Account connection required
          </Button>
        </section>
      </div>
    </>
  );
}
export function Admin() {
  const [tab, setTab] = useState("Overview");
  const tabs = [
    "Overview",
    "Users",
    "Opportunities",
    "Sources",
    "AI Processing",
    "Analytics",
    "Reports",
    "System Settings",
  ];
  return (
    <>
      <PageHeading
        eyebrow="READ-ONLY DEMONSTRATION"
        title="Admin Preview"
        description="Fictional records for reviewing the future administration experience."
      />
      <DemoNotice>
        This public demo is not secure administration. All views are read-only; real roles and
        server-side access checks are not connected.
      </DemoNotice>
      <div className="admin-tabs" role="tablist" aria-label="Admin preview sections">
        {tabs.map((t) => (
          <Button
            key={t}
            role="tab"
            aria-selected={tab === t}
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      <div role="tabpanel">
        <div className="section-heading">
          <h2>{tab}</h2>
          <DemoBadge>Fictional demonstration</DemoBadge>
        </div>
        {tab === "Overview" || tab === "Analytics" ? (
          <>
            <div className="admin-overview">
              <div>
                <strong>3</strong>
                <p>Fictional demo users</p>
              </div>
              <div>
                <strong>{opportunities.length}</strong>
                <p>Sample opportunities</p>
              </div>
              <div>
                <strong>0</strong>
                <p>Configured live connectors</p>
              </div>
            </div>
            <p className="legal-note">
              No production usage, real traffic, conversion rates or AI accuracy statistics are
              available.
            </p>
          </>
        ) : tab === "Users" ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fictional user</th>
                  <th>Profession</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Demo Alex", "Designer"],
                  ["Demo Sam", "Developer"],
                  ["Demo Jo", "Video editor"],
                ].map(([name, job]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{job}</td>
                    <td>Demonstration only</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "Opportunities" ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sample opportunity</th>
                  <th>Source</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td>{o.source}</td>
                    <td>Fictional · Not verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "Sources" ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Planned source</th>
                  <th>Connection</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>
                    <td>Not configured</td>
                    <td>Permission not established</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "AI Processing" ? (
          <>
            <AIRequired />
            <div className="admin-overview">
              <div>
                <strong>0</strong>
                <p>Processing jobs</p>
              </div>
              <div>
                <strong>0</strong>
                <p>AI-generated results</p>
              </div>
            </div>
          </>
        ) : tab === "Reports" ? (
          <EmptyState
            title="No reports available"
            description="Reporting and source-removal workflows require a connected service."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {["Authentication", "Role checks", "Storage", "Notifications", "Payments"].map(
                  (s) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td>Not connected · read-only preview</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
