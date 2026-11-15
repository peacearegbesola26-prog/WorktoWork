import { initialSaved, validSavedIds } from "./model";

export const workLocations = ["Remote", "Hybrid", "On-site", "All"] as const;
export interface DemoPreferences {
  saved: string[];
  preference: string;
}
export function parseDemoPreferences(raw: string | null): DemoPreferences {
  const defaults = { saved: [...initialSaved], preference: "Remote" };
  if (!raw) return defaults;
  const value: unknown = JSON.parse(raw);
  if (typeof value !== "object" || value === null || Array.isArray(value)) return defaults;
  const data = value as Record<string, unknown>;
  return {
    saved: validSavedIds(data["saved"]),
    preference:
      typeof data["preference"] === "string" && workLocations.some((v) => v === data["preference"])
        ? data["preference"]
        : defaults.preference,
  };
}
