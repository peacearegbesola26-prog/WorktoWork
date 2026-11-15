import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  initialAlerts,
  initialSaved,
  initialTracker,
  validSavedIds,
  type AlertRule,
  type Status,
} from "./model";
import { toast } from "sonner";
interface DemoState {
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
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(initialSaved);
  const [tracker, setTracker] = useState(initialTracker);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [preference, setPreference] = useState("Remote");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wtw-demo-v1");
      if (raw) {
        const data = JSON.parse(raw);
        setSaved(validSavedIds(data.saved));
        if (["Remote", "Hybrid", "On-site", "All"].includes(data.preference))
          setPreference(data.preference);
      }
    } catch {
      toast.error("Demo preferences could not be loaded. Default records are shown.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("wtw-demo-v1", JSON.stringify({ saved, preference }));
      } catch {
        toast.error("Your browser could not save demo preferences.");
      }
    }
  }, [saved, preference, ready]);
  function toggleSaved(id: string) {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    toast.success(
      saved.includes(id) ? "Sample opportunity removed from saved." : "Sample opportunity saved.",
    );
  }
  function track(id: string) {
    setTracker((prev) => ({ ...prev, [id]: prev[id] ?? "Saved" }));
    toast.success("Sample opportunity added to your tracker.");
  }
  function reset() {
    setSaved([...initialSaved]);
    setTracker({ ...initialTracker });
    setAlerts(initialAlerts.map((a) => ({ ...a })));
    setPreference("Remote");
    toast.success("Demo reset to its starting records.");
  }
  return (
    <DemoContext.Provider
      value={{
        saved,
        toggleSaved,
        tracker,
        track,
        setStatus: (id, status) => setTracker((p) => ({ ...p, [id]: status })),
        removeTracked: (id) =>
          setTracker((p) => Object.fromEntries(Object.entries(p).filter(([key]) => key !== id))),
        alerts,
        setAlerts,
        preference,
        setPreference,
        reset,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Demo provider is required");
  return context;
}
