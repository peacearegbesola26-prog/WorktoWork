import { describe, it, expect } from "vitest";
import {
  demoStats,
  initialSaved,
  initialTracker,
  initialAlerts,
  opportunities,
  filterOpportunities,
  emptyFilters,
  validSavedIds,
  statuses,
} from "./model";
describe("Stage 1 rules", () => {
  it("derives statistics from shared sample records", () => {
    expect(demoStats(initialSaved, initialTracker, initialAlerts)).toEqual({
      available: 12,
      saved: 3,
      tracked: 2,
      alerts: 1,
    });
  });
  it("offers the five requested tracker states", () => {
    expect(statuses).toEqual(["Saved", "Applied", "Interview", "Offer", "Rejected"]);
  });
  it("filters skill, country, location, source and opportunity type together", () => {
    expect(
      filterOpportunities(opportunities, {
        ...emptyFilters,
        skill: "Shopify",
        country: "United Kingdom",
        remote: "Remote",
        source: "Web",
        type: "Contract",
      }).map((o) => o.id),
    ).toEqual(["op-8"]);
  });
  it("supports the supplied natural-language web example against demo records", () => {
    expect(
      filterOpportunities(
        opportunities.filter((o) => o.source === "Web"),
        { ...emptyFilters, query: "Find businesses in the UK looking for Shopify developers." },
      ).map((o) => o.id),
    ).toEqual(["op-2", "op-8"]);
  });
  it("filters dates inclusively and excludes unknown dates", () => {
    expect(
      filterOpportunities(opportunities, {
        ...emptyFilters,
        from: "2026-11-10",
        to: "2026-11-12",
      }).map((o) => o.id),
    ).toEqual(["op-1", "op-3", "op-2"]);
  });
  it("sorts oldest and title results", () => {
    expect(filterOpportunities(opportunities, { ...emptyFilters, sort: "oldest" })[0]?.id).toBe(
      "op-12",
    );
    expect(filterOpportunities(opportunities, { ...emptyFilters, sort: "title" })[0]?.id).toBe(
      "op-5",
    );
  });
  it("stores only genuine sample IDs once", () => {
    expect(validSavedIds(["op-1", "password", "op-1", null, "op-2"])).toEqual(["op-1", "op-2"]);
  });
  it("never fabricates source URLs, contacts or live timestamps for fictional records", () => {
    expect(opportunities.filter((o) => o.originalUrl || o.checked)).toEqual([]);
    expect(opportunities.find((o) => o.id === "op-6")?.country).toBeNull();
  });
});
