"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Competitor,
  ActionItem,
  Insight,
  AnalysisStatus,
} from "./data";

interface AppStore {
  // Data
  datasetId: string | null;
  competitors: Competitor[];
  insights: Insight[];
  actionItems: ActionItem[];
  reviewCount: number;

  // Status
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  analysisStatus: AnalysisStatus;
  isReady: boolean;

  // Actions
  uploadCSV: (file: File) => Promise<void>;
  triggerAnalysis: (datasetId: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchCompetitors: () => Promise<void>;
  fetchActionItems: () => Promise<void>;
  updateActionItemStatus: (id: string, status: string) => Promise<void>;
  exportToPDF: () => Promise<void>;
  exportToCSV: () => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

const STORAGE_KEY = "reviewintel_store";

const StoreContext = createContext<AppStore | null>(null);

interface StoredState {
  datasetId: string | null;
  analysisStatus: AnalysisStatus;
  reviewCount: number;
}

function loadFromStorage(): StoredState {
  if (typeof window === "undefined")
    return { datasetId: null, analysisStatus: "idle", reviewCount: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { datasetId: null, analysisStatus: "idle", reviewCount: 0 };
    return JSON.parse(raw);
  } catch {
    return { datasetId: null, analysisStatus: "idle", reviewCount: 0 };
  }
}

function saveToStorage(state: StoredState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [isReady, setIsReady] = useState(false);

  // Load stored state on mount
  useEffect(() => {
    const stored = loadFromStorage();
    setDatasetId(stored.datasetId);
    setAnalysisStatus(stored.analysisStatus);
    setReviewCount(stored.reviewCount);
    setIsReady(true);
  }, []);

  // Fetch data when datasetId is set and analysis is complete
  useEffect(() => {
    if (!isReady || !datasetId || analysisStatus !== "complete") return;
    // Fetch all data
    fetchCompetitorsInternal(datasetId);
    fetchInsightsInternal(datasetId);
    fetchActionItemsInternal(datasetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, datasetId, analysisStatus]);

  const fetchCompetitorsInternal = async (dsId: string) => {
    try {
      const res = await fetch(`/api/competitors?datasetId=${dsId}`);
      if (!res.ok) throw new Error("Failed to fetch competitors");
      const data = await res.json();
      setCompetitors(data.competitors ?? []);
    } catch (err) {
      console.error("Error fetching competitors:", err);
    }
  };

  const fetchInsightsInternal = async (dsId: string) => {
    try {
      const res = await fetch(`/api/insights?datasetId=${dsId}`);
      if (!res.ok) throw new Error("Failed to fetch insights");
      const data = await res.json();
      setInsights(data.insights ?? []);
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  const fetchActionItemsInternal = async (dsId: string) => {
    try {
      const res = await fetch(`/api/action-items?datasetId=${dsId}`);
      if (!res.ok) throw new Error("Failed to fetch action items");
      const data = await res.json();
      setActionItems(data.actionItems ?? []);
    } catch (err) {
      console.error("Error fetching action items:", err);
    }
  };

  const uploadCSV = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setUploadProgress(10);
    setAnalysisStatus("uploading");

    try {
      // Step 1: Upload CSV
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(20);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      const newDatasetId = uploadData.datasetId;

      setDatasetId(newDatasetId);
      setReviewCount(uploadData.reviewCount);
      setUploadProgress(40);
      setAnalysisStatus("parsing");

      saveToStorage({
        datasetId: newDatasetId,
        analysisStatus: "parsing",
        reviewCount: uploadData.reviewCount,
      });

      // Step 2: Trigger analysis
      setUploadProgress(50);
      setAnalysisStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: newDatasetId }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "Analysis failed");
      }

      setUploadProgress(90);

      // Step 3: Fetch results
      await fetchCompetitorsInternal(newDatasetId);
      await fetchInsightsInternal(newDatasetId);
      await fetchActionItemsInternal(newDatasetId);

      setUploadProgress(100);
      setAnalysisStatus("complete");
      saveToStorage({
        datasetId: newDatasetId,
        analysisStatus: "complete",
        reviewCount: uploadData.reviewCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnalysisStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerAnalysis = useCallback(
    async (dsId: string) => {
      setLoading(true);
      setError(null);
      setAnalysisStatus("analyzing");

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId: dsId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Analysis failed");
        }

        await fetchCompetitorsInternal(dsId);
        await fetchInsightsInternal(dsId);
        await fetchActionItemsInternal(dsId);

        setAnalysisStatus("complete");
        saveToStorage({
          datasetId: dsId,
          analysisStatus: "complete",
          reviewCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        setAnalysisStatus("error");
      } finally {
        setLoading(false);
      }
    },
    [reviewCount]
  );

  const fetchInsights = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      await fetchInsightsInternal(datasetId);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const fetchCompetitors = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      await fetchCompetitorsInternal(datasetId);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const fetchActionItems = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      await fetchActionItemsInternal(datasetId);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const updateActionItemStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await fetch("/api/action-items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });

        if (!res.ok) {
          throw new Error("Failed to update action item");
        }

        // Update local state
        setActionItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: status as ActionItem["status"] } : item
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
    },
    []
  );

  const exportToPDF = useCallback(async () => {
    if (!datasetId) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, format: "pdf" }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reviewintel-battlecard.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }, [datasetId]);

  const exportToCSV = useCallback(async () => {
    if (!datasetId) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, format: "csv" }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reviewintel-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }, [datasetId]);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDatasetId(null);
    setCompetitors([]);
    setInsights([]);
    setActionItems([]);
    setReviewCount(0);
    setAnalysisStatus("idle");
    setError(null);
    setUploadProgress(0);
    window.location.href = "/onboarding";
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        datasetId,
        competitors,
        insights,
        actionItems,
        reviewCount,
        loading,
        error,
        uploadProgress,
        analysisStatus,
        isReady,
        uploadCSV,
        triggerAnalysis,
        fetchInsights,
        fetchCompetitors,
        fetchActionItems,
        updateActionItemStatus,
        exportToPDF,
        exportToCSV,
        signOut,
        clearError,
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
