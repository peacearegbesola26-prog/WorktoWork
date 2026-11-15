export const sources = ["LinkedIn", "Facebook", "Instagram", "TikTok", "Reddit", "Web"] as const;
export type Source = (typeof sources)[number];
export type Status = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
export const statuses: Status[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
export interface Opportunity {
  id: string;
  title: string;
  company: string;
  summary: string;
  source: Source;
  country: string | null;
  posted: string | null;
  checked: string | null;
  skills: string[];
  type: string;
  remote: string;
  originalUrl?: string;
}
// Fictional records: dates below belong to demonstration scenarios, not live posts.
export const opportunities: Opportunity[] = [
  {
    id: "op-1",
    title: "Product designer for a SaaS dashboard",
    company: "Northstar Studio · Fictional",
    summary:
      "A small product team is looking for a designer to rethink their analytics dashboard, from research to high-fidelity prototypes.",
    source: "LinkedIn",
    country: "United Kingdom",
    posted: "2026-11-12",
    checked: null,
    skills: ["UI/UX Design", "Figma", "Prototyping"],
    type: "Contract",
    remote: "Remote",
  },
  {
    id: "op-2",
    title: "Shopify developer for a growing store",
    company: "Field & Form · Fictional",
    summary:
      "Help a homeware business create a faster, more thoughtful Shopify shopping experience and customise its storefront.",
    source: "Web",
    country: "United Kingdom",
    posted: "2026-11-10",
    checked: null,
    skills: ["Shopify", "Web Development", "Liquid"],
    type: "Freelance",
    remote: "Remote",
  },
  {
    id: "op-3",
    title: "Short-form video editor",
    company: "Frame Collective · Fictional",
    summary:
      "A creative team needs an editor for a monthly series of short-form videos, with a focus on storytelling and strong pacing.",
    source: "Instagram",
    country: "United States",
    posted: "2026-11-11",
    checked: null,
    skills: ["Video Editing", "Premiere Pro"],
    type: "Freelance",
    remote: "Remote",
  },
  {
    id: "op-4",
    title: "Frontend developer for a web platform",
    company: "Orbit Works · Fictional",
    summary:
      "Collaborate with a product designer to build accessible React interfaces for a new customer platform.",
    source: "Reddit",
    country: "Canada",
    posted: "2026-11-09",
    checked: null,
    skills: ["React", "TypeScript", "Web Development"],
    type: "Contract",
    remote: "Remote",
  },
  {
    id: "op-5",
    title: "Brand identity designer",
    company: "Bloom Project · Fictional",
    summary:
      "An independent business is seeking a designer for its visual identity, including a logo system and digital guidelines.",
    source: "Facebook",
    country: "Nigeria",
    posted: "2026-11-08",
    checked: null,
    skills: ["Graphic Design", "Branding"],
    type: "Freelance",
    remote: "Hybrid",
  },
  {
    id: "op-6",
    title: "Content creator for a lifestyle series",
    company: "Everyday Stories · Fictional",
    summary: "Develop engaging concepts and edit short lifestyle videos for a new content series.",
    source: "TikTok",
    country: null,
    posted: null,
    checked: null,
    skills: ["Content Creation", "Video Editing"],
    type: "Freelance",
    remote: "Unknown",
  },
  {
    id: "op-7",
    title: "UX researcher for a digital service",
    company: "Clearpath Lab · Fictional",
    summary:
      "Plan and conduct user interviews, synthesise research, and identify opportunities to improve an onboarding experience.",
    source: "LinkedIn",
    country: "Germany",
    posted: "2026-11-07",
    checked: null,
    skills: ["UI/UX Design", "UX Research"],
    type: "Full-time",
    remote: "Hybrid",
  },
  {
    id: "op-8",
    title: "Shopify theme specialist",
    company: "Studio Morrow · Fictional",
    summary:
      "As a Shopify developer, customise a Shopify theme for an independent fashion shop and improve the mobile product pages.",
    source: "Web",
    country: "United Kingdom",
    posted: "2026-11-06",
    checked: null,
    skills: ["Shopify", "Liquid"],
    type: "Contract",
    remote: "Remote",
  },
  {
    id: "op-9",
    title: "Copywriter for a website refresh",
    company: "Goodword Studio · Fictional",
    summary: "Write clear website messaging and service pages for a small creative agency.",
    source: "Web",
    country: "Australia",
    posted: "2026-11-05",
    checked: null,
    skills: ["Copywriting", "Content Strategy"],
    type: "Freelance",
    remote: "Remote",
  },
  {
    id: "op-10",
    title: "Mobile app interface designer",
    company: "Forma Team · Fictional",
    summary:
      "Design a cohesive mobile experience with a reusable component system and interactive prototypes.",
    source: "Facebook",
    country: "United States",
    posted: "2026-11-04",
    checked: null,
    skills: ["UI/UX Design", "Figma"],
    type: "Contract",
    remote: "Remote",
  },
  {
    id: "op-11",
    title: "Website developer for a local business",
    company: "Corner House · Fictional",
    summary:
      "Create a clean, accessible website for a neighbourhood business, including its services and location pages.",
    source: "Web",
    country: "Nigeria",
    posted: "2026-11-03",
    checked: null,
    skills: ["Web Development", "WordPress"],
    type: "Freelance",
    remote: "On-site",
  },
  {
    id: "op-12",
    title: "Motion designer for a product launch",
    company: "Motion Room · Fictional",
    summary: "Create a short product explainer and motion assets for a digital launch.",
    source: "Reddit",
    country: "Netherlands",
    posted: "2026-11-02",
    checked: null,
    skills: ["Motion Design", "After Effects"],
    type: "Contract",
    remote: "Remote",
  },
];
export interface Filters {
  query: string;
  skill: string;
  country: string;
  source: string;
  remote: string;
  type: string;
  from: string;
  to: string;
  sort: string;
}
export const emptyFilters: Filters = {
  query: "",
  skill: "All",
  country: "All",
  source: "All",
  remote: "All",
  type: "All",
  from: "",
  to: "",
  sort: "newest",
};
export function filterOpportunities(rows: Opportunity[], f: Filters): Opportunity[] {
  const stop = new Set([
    "find",
    "businesses",
    "business",
    "in",
    "the",
    "looking",
    "for",
    "a",
    "an",
    "developers",
    "opportunities",
    "work",
    "needed",
  ]);
  const query = f.query
    .toLowerCase()
    .replace(/\buk\b/g, "united kingdom")
    .replace(/developers/g, "developer");
  const words = query.split(/\W+/).filter((w) => w.length > 1 && !stop.has(w));
  const found = rows.filter((o) => {
    const text = [o.title, o.summary, o.country, ...o.skills].join(" ").toLowerCase();
    return (
      words.every((w) => text.includes(w)) &&
      (f.skill === "All" || o.skills.includes(f.skill)) &&
      (f.country === "All" || (o.country ?? "Unknown") === f.country) &&
      (f.source === "All" || o.source === f.source) &&
      (f.remote === "All" || o.remote === f.remote) &&
      (f.type === "All" || o.type === f.type) &&
      (!f.from || Boolean(o.posted && o.posted >= f.from)) &&
      (!f.to || Boolean(o.posted && o.posted <= f.to))
    );
  });
  return found.sort((a, b) =>
    f.sort === "title"
      ? a.title.localeCompare(b.title)
      : f.sort === "oldest"
        ? (a.posted ?? "9999").localeCompare(b.posted ?? "9999")
        : (b.posted ?? "").localeCompare(a.posted ?? ""),
  );
}
export interface AlertRule {
  id: string;
  name: string;
  skill: string;
  country: string;
  source: string;
  frequency: string;
  active: boolean;
}
export const initialAlerts: AlertRule[] = [
  {
    id: "alert-1",
    name: "Remote design opportunities",
    skill: "UI/UX Design",
    country: "All",
    source: "All",
    frequency: "Daily",
    active: true,
  },
];
export const initialTracker: Record<string, Status> = { "op-1": "Applied", "op-3": "Interview" };
export const initialSaved = ["op-1", "op-2", "op-3"];
export function validSavedIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string => typeof id === "string" && opportunities.some((o) => o.id === id),
          ),
        ),
      ]
    : initialSaved;
}
export function demoStats(saved: string[], tracker: Record<string, Status>, alerts: AlertRule[]) {
  return {
    available: opportunities.length,
    saved: saved.length,
    tracked: Object.keys(tracker).length,
    alerts: alerts.filter((a) => a.active).length,
  };
}
