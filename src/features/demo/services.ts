import type { Opportunity, Filters, Source } from "./model";
// Contracts only; no live adapter or credentials are configured in Stage 1.
export interface OpportunityService {
  search(filters: Filters): Promise<Opportunity[]>;
  get(id: string): Promise<Opportunity | null>;
}
export interface SourceConnector {
  source: Source;
  configured: boolean;
  search(filters: Filters): Promise<Opportunity[]>;
}
export interface AuthService {
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
export interface CareerAIService {
  optimise(content: string, opportunityId?: string): Promise<string>;
}
export const integrationStatus = {
  authentication: false,
  sources: false,
  ai: false,
  storage: false,
} as const;
