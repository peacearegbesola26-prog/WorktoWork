import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, SelectField, PageHeading, EmptyState } from "@/components/work/shared";
import { searchOpportunities, opportunityDetails } from "./opportunities.functions";
import type { SearchFilters } from "./schemas";
import { workspaceOptions } from "@/features/account/query";
import { updateWorkspace } from "@/features/account/workspace.functions";
import type { Command } from "@/features/account/schemas";
function useActions() {
  const client = useQueryClient(),
    update = useServerFn(updateWorkspace);
  const workspace = useQuery(workspaceOptions);
  const mutation = useMutation({
    mutationFn: (c: Command) => update({ data: c }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workspaceOptions.queryKey });
      toast.success("Changes saved.");
    },
    onError: () => toast.error("This opportunity could not be saved or tracked."),
  });
  return { workspace: workspace.data, mutation };
}
export function OpportunityActions({ id }: { id: string }) {
  const { workspace, mutation } = useActions();
  const saved = workspace?.saved.some((s) => s.opportunity_id === id),
    tracked = workspace?.tracker.some((t) => t.opportunity_id === id);
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Button
        variant="outline"
        disabled={mutation.isPending || !workspace}
        onClick={() => mutation.mutate({ action: saved ? "unsave" : "save", id })}
      >
        {saved ? "Unsave" : "Save opportunity"}
      </Button>
      <Button
        variant="outline"
        disabled={mutation.isPending || !workspace || tracked}
        onClick={() => mutation.mutate({ action: "trackOpportunity", id })}
      >
        {tracked ? "In application tracker" : "Track application"}
      </Button>
    </div>
  );
}
export function DiscoveryPage({ section }: { section: "social" | "web" | "direct" }) {
  const initial: SearchFilters = {
    section,
    query: "",
    country: "",
    skill: "",
    work: "All",
    source: "All",
    type: "",
    since: "",
    sort: "newest",
    page: 1,
  };
  const [filters, setFilters] = useState(initial);
  const search = useServerFn(searchOpportunities);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["opportunity-search", filters],
    queryFn: () => search({ data: filters }),
  });
  const change = (key: keyof SearchFilters, value: string) =>
    setFilters((old) => ({ ...old, [key]: value, page: 1 }));
  return (
    <>
      <PageHeading
        title={
          section === "direct"
            ? "Direct Work to Work opportunities"
            : section === "web"
              ? "Web Discovery"
              : "Social Discovery"
        }
        description={
          section === "direct"
            ? "Opportunities submitted directly to Work to Work."
            : "Manually entered external opportunities. Automatic source integrations are not connected."
        }
      />
      <nav className="flex flex-wrap gap-2 mb-6">
        <Button asChild variant="outline">
          <Link to="/app/social">Social Discovery</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/web">Web Discovery</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/direct">Direct Work to Work</Link>
        </Button>
      </nav>
      <Field label="Search opportunities">
        <input
          value={filters.query}
          onChange={(e) => change("query", e.target.value)}
          placeholder="Title, description or service category"
        />
      </Field>
      <div className="filter-grid mt-4">
        <Field label="Country">
          <input value={filters.country} onChange={(e) => change("country", e.target.value)} />
        </Field>
        <Field label="Required skill">
          <input value={filters.skill} onChange={(e) => change("skill", e.target.value)} />
        </Field>
        <Field label="Work location">
          <select value={filters.work} onChange={(e) => change("work", e.target.value)}>
            <option value="All">All locations</option>
            <option value="Unknown">Unknown</option>
            {["Remote", "Hybrid", "On-site"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <select value={filters.source} onChange={(e) => change("source", e.target.value)}>
            <option value="All">All sources</option>
            {data?.sources
              .filter((s) =>
                section === "web"
                  ? s.platform === "Web"
                  : section === "social"
                    ? s.platform !== "Web"
                    : false,
              )
              .map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Opportunity type">
          <input value={filters.type} onChange={(e) => change("type", e.target.value)} />
        </Field>
        <Field label="Posted on or after">
          <input
            type="date"
            value={filters.since}
            onChange={(e) => change("since", e.target.value)}
          />
        </Field>
        <SelectField
          label="Sort"
          value={filters.sort}
          onChange={(v) => change("sort", v)}
          options={["newest", "oldest", "title"]}
        />
      </div>
      <Button variant="ghost" className="mt-4" onClick={() => setFilters(initial)}>
        Reset filters
      </Button>
      {error ? (
        <p role="alert">
          Opportunities could not be loaded.{" "}
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </p>
      ) : isPending ? (
        <p role="status">Loading opportunities…</p>
      ) : !data?.rows.length ? (
        <EmptyState
          title="No matching opportunities"
          description="No active published opportunities match these filters. Unknown posted dates are excluded when a date filter is selected."
        />
      ) : (
        <>
          <p className="text-muted-foreground my-4">{data.total} opportunities</p>
          <div className="opportunity-grid">
            {data.rows.map((o) => (
              <article className="opportunity-card" key={o.id}>
                <p className="text-primary text-xs">
                  {o.origin === "direct" ? "Direct Work to Work" : "Manually entered external"}
                </p>
                <h3>{o.title}</h3>
                <p>{o.company}</p>
                <p>{o.summary}</p>
                <p>
                  {o.country || "Country unknown"} ·{" "}
                  {o.work_location === "All" ? "Location unknown" : o.work_location}
                </p>
                <p>{o.posted_at ? `Posted ${o.posted_at.slice(0, 10)}` : "Posted date unknown"}</p>
                <Button asChild variant="link">
                  <Link to="/app/opportunities/$id" params={{ id: o.id }}>
                    View opportunity
                  </Link>
                </Button>
                <OpportunityActions id={o.id} />
              </article>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <Button
          variant="outline"
          disabled={filters.page === 1 || isPending}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          Previous
        </Button>
        <span>
          Page {filters.page} of {Math.max(1, Math.ceil((data?.total ?? 0) / 12))}
        </span>
        <Button
          variant="outline"
          disabled={isPending || filters.page * 12 >= (data?.total ?? 0)}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
        >
          Next
        </Button>
      </div>
    </>
  );
}
export function OpportunityDetailPage({ id }: { id: string }) {
  const fetch = useServerFn(opportunityDetails),
    {
      data: o,
      isPending,
      error,
    } = useQuery({ queryKey: ["opportunity-detail", id], queryFn: () => fetch({ data: id }) });
  if (isPending) return <p role="status">Loading opportunity…</p>;
  if (error || !o)
    return (
      <EmptyState
        title="Opportunity unavailable"
        description="This opportunity may be unpublished, expired or archived."
      />
    );
  return (
    <>
      <PageHeading
        title={o.title}
        description={o.company || "Organisation not provided"}
        eyebrow={
          o.origin === "direct" ? "Direct Work to Work" : "Manually entered external opportunity"
        }
      />
      <p className="text-muted-foreground mb-4">
        {o.country || "Country unknown"} ·{" "}
        {o.work_location === "All" ? "Location unknown" : o.work_location} · {o.opportunity_type}
      </p>
      <p>{o.summary}</p>
      <section className="my-6">
        <h2 className="text-xl mb-3">Description</h2>
        <p className="whitespace-pre-wrap break-words">{o.description}</p>
      </section>
      <p>Required skills: {o.skills.join(", ") || "Not provided"}</p>
      <p>Service category: {o.service_category || "Not provided"}</p>
      <p>Budget: {o.budget === null ? "Not provided" : `${o.budget} ${o.currency ?? ""}`}</p>
      <p>
        Source:{" "}
        {o.sources?.name ||
          (o.origin === "direct" ? "Work to Work direct submission" : "Not provided")}
      </p>
      <p>Posted date: {o.posted_at?.slice(0, 10) || "Unknown"}</p>
      <p>Closing date: {o.closing_date || "Not provided"}</p>
      <section className="my-6">
        <h2 className="text-xl mb-3">Application</h2>
        <p className="whitespace-pre-wrap break-words">
          {o.application_instructions || "Use the application link provided."}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {o.url && (
            <Button asChild variant="outline">
              <a href={o.url} target="_blank" rel="noopener noreferrer">
                Open original source
              </a>
            </Button>
          )}
          {o.application_url && (
            <Button asChild>
              <a href={o.application_url} target="_blank" rel="noopener noreferrer">
                Open application link
              </a>
            </Button>
          )}
        </div>
      </section>
      <OpportunityActions id={o.id} />
    </>
  );
}
