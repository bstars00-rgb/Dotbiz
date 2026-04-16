import { useState } from "react";

export type ScreenState = "loading" | "empty" | "error" | "success";

export function useScreenState(initialState: ScreenState = "success") {
  const [state, setState] = useState<ScreenState>(initialState);
  return { state, setState };
}
