import { useCallback, useEffect, useRef, useState } from "react";

// Pending sample searches must not restore stale input after reset or navigation.
export function useDemoSearch() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setLoading(false);
  }, []);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  const run = useCallback(
    (complete: () => void) => {
      cancel();
      setLoading(true);
      timer.current = setTimeout(() => {
        timer.current = null;
        complete();
        setLoading(false);
      }, 250);
    },
    [cancel],
  );
  return { loading, run, cancel };
}
