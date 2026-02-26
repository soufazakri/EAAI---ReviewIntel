"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  competitorsByIndustry,
  actionItemsByIndustry,
  industries,
  type Competitor,
  type ActionItem,
} from "./data";

interface AppStore {
  industry: string | null;
  industryLabel: string;
  selectedCompetitorNames: string[];
  competitors: Competitor[];
  actionItems: ActionItem[];
  setIndustry: (id: string) => void;
  setSelectedCompetitors: (names: string[]) => void;
  isReady: boolean;
}

const STORAGE_KEY = "reviewintel_store";

const StoreContext = createContext<AppStore | null>(null);

function loadFromStorage(): {
  industry: string | null;
  selectedCompetitorNames: string[];
} {
  if (typeof window === "undefined") return { industry: null, selectedCompetitorNames: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { industry: null, selectedCompetitorNames: [] };
    return JSON.parse(raw);
  } catch {
    return { industry: null, selectedCompetitorNames: [] };
  }
}

function saveToStorage(industry: string | null, selectedCompetitorNames: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ industry, selectedCompetitorNames }));
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustryState] = useState<string | null>(null);
  const [selectedCompetitorNames, setSelectedCompetitorNamesState] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    setIndustryState(stored.industry);
    setSelectedCompetitorNamesState(stored.selectedCompetitorNames);
    setIsReady(true);
  }, []);

  const setIndustry = useCallback((id: string) => {
    setIndustryState(id);
    setSelectedCompetitorNamesState([]);
    saveToStorage(id, []);
  }, []);

  const setSelectedCompetitors = useCallback(
    (names: string[]) => {
      setSelectedCompetitorNamesState(names);
      saveToStorage(industry, names);
    },
    [industry]
  );

  const allCompetitors = industry ? competitorsByIndustry[industry] ?? [] : [];
  const competitors = allCompetitors.filter((c) =>
    selectedCompetitorNames.includes(c.name)
  );

  const allActions = industry ? actionItemsByIndustry[industry] ?? [] : [];
  const actionItems = allActions.filter((a) =>
    selectedCompetitorNames.includes(a.competitorName)
  );

  const industryLabel =
    industries.find((i) => i.id === industry)?.label ?? "";

  return (
    <StoreContext.Provider
      value={{
        industry,
        industryLabel,
        selectedCompetitorNames,
        competitors,
        actionItems,
        setIndustry,
        setSelectedCompetitors,
        isReady,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useAppStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
