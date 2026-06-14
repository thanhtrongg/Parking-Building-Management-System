import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 10_000;

export default function useAutoRefresh(
  refresh,
  { enabled = true, intervalMs = DEFAULT_INTERVAL_MS } = {},
) {
  const refreshRef = useRef(refresh);
  const runningRef = useRef(false);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    const runRefresh = async () => {
      if (document.visibilityState === "hidden" || runningRef.current) return;

      runningRef.current = true;
      try {
        await refreshRef.current?.();
      } catch {
        // Background refresh errors should not interrupt the current page state.
      } finally {
        runningRef.current = false;
      }
    };

    const timer = window.setInterval(runRefresh, intervalMs);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") runRefresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", runRefresh);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", runRefresh);
    };
  }, [enabled, intervalMs]);
}
