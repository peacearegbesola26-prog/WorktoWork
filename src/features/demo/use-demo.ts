import { createContext, useContext } from "react";
import type { AlertRule, Status } from "./model";

export interface DemoState {
  saved: string[];
  toggleSaved: (id: string) => void;
  tracker: Record<string, Status>;
  track: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  removeTracked: (id: string) => void;
  alerts: AlertRule[];
  setAlerts: (value: AlertRule[]) => void;
  preference: string;
  setPreference: (value: string) => void;
  reset: () => void;
}
export const DemoContext = createContext<DemoState | null>(null);
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Demo provider is required");
  return context;
}
