import type { Database } from "@/integrations/supabase/types";
export const sourcePlatforms = [
  "Facebook",
  "LinkedIn",
  "Instagram",
  "TikTok",
  "Reddit",
  "Web",
] as const;
export type SourcePlatform = (typeof sourcePlatforms)[number];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export interface SourceConnector {
  platform: SourcePlatform;
  configured: boolean;
  search(filters: {
    keywords: string;
    country?: string;
    workLocation?: string;
  }): Promise<Opportunity[]>;
}
// No adapters exist yet. Platform access must be authorised before enabling a connector.
export const connectorStatus = sourcePlatforms.map((platform) => ({
  platform,
  configured: false as const,
}));
