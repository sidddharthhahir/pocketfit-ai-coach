import { useState, useCallback } from "react";

const STORAGE_KEY = "dashboard-sections-state";

export type SectionId = "daily" | "countdowns" | "stats" | "night" | "motivation";

const DEFAULT_STATE: Record<SectionId, boolean> = {
  daily: true,
  countdowns: false,
  stats: false,
  night: false,
  motivation: false,
};

function loadState(): Record<SectionId, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

export function useCollapsibleSections() {
  const [sections, setSections] = useState<Record<SectionId, boolean>>(loadState);

  const toggle = useCallback((id: SectionId) => {
    setSections((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { sections, toggle };
}
