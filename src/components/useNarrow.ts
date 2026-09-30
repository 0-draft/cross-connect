import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 639px)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia?.(QUERY);
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
}

/**
 * True on phone-width screens. Wide left-to-right diagrams switch to a
 * top-to-bottom layout there instead of shrinking into illegibility.
 */
export function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(QUERY).matches ?? false,
    () => false,
  );
}
