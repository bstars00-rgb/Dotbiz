import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Syncs the active tab of a <Tabs> component with a URL query parameter so that
 *   1. The active tab survives browser Back / Forward navigation — when the
 *      user drills into a row (e.g. invoice detail) and returns, they land on
 *      the same tab they were on, not the page default.
 *   2. Tabs become linkable — copy-paste a URL with `?tab=billing` and the
 *      right tab opens.
 *
 * Usage:
 *   const [tab, setTab] = useTabParam("invoices");
 *   <Tabs value={tab} onValueChange={setTab}>...</Tabs>
 *
 * Notes:
 *   - Uses `replace: true` when switching tabs so tab clicks do NOT pollute
 *     history (otherwise every tab switch becomes a Back step).
 *   - The param key defaults to "tab" but can be overridden if the page needs
 *     multiple independent tab groups.
 */
export function useTabParam(
  defaultTab: string,
  paramKey: string = "tab",
): [string, (next: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get(paramKey) || defaultTab;

  const setTab = useCallback(
    (next: string) => {
      setSearchParams(
        prev => {
          const params = new URLSearchParams(prev);
          if (next === defaultTab) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, next);
          }
          return params;
        },
        { replace: true },
      );
    },
    [defaultTab, paramKey, setSearchParams],
  );

  return [current, setTab];
}
