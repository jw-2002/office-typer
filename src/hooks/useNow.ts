import { useEffect, useState } from "react";

/** The current performance.now(), refreshed on an interval while `active`. Drives live readouts like WPM. */
export function useNow(active: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(performance.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return now;
}
