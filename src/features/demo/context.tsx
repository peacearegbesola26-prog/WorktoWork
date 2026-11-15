import { useEffect, useState, type ReactNode } from "react";
import { initialAlerts, initialSaved, initialTracker, opportunities } from "./model";
import { toast } from "sonner";
import { parseDemoPreferences } from "./preferences";
import { DemoContext } from "./use-demo";
export function DemoProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(initialSaved);
  const [tracker, setTracker] = useState(initialTracker);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [preference, setPreference] = useState("Remote");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const data = parseDemoPreferences(localStorage.getItem("wtw-demo-v1"));
      setSaved(data.saved);
      setPreference(data.preference);
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
    if (!opportunities.some((o) => o.id === id)) return;
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    toast.success(
      saved.includes(id) ? "Sample opportunity removed from saved." : "Sample opportunity saved.",
    );
  }
  function track(id: string) {
    if (!opportunities.some((o) => o.id === id)) return;
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
        setStatus: (id, status) => setTracker((p) => (id in p ? { ...p, [id]: status } : p)),
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
