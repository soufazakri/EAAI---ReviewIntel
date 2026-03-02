"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  uploadMoreReviews: (file: File) => Promise<void>;
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

const STATUS_PROGRESS: Record<string, number> = {
  uploading: 10,
  parsing: 20,
  extracting: 30,
  clustering: 45,
  synthesizing: 60,
  generating_battlecards: 80,
  complete: 100,
};

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

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Load stored state on mount
  useEffect(() => {
    const stored = loadFromStorage();
    setDatasetId(stored.datasetId);
    setAnalysisStatus(stored.analysisStatus);
    setReviewCount(stored.reviewCount);
    setIsReady(true);

    // If the stored status is in-progress, resume polling
    const inProgressStatuses = [
      "uploading", "parsing", "extracting", "clustering",
      "synthesizing", "generating_battlecards",
    ];
    if (stored.datasetId && inProgressStatuses.includes(stored.analysisStatus)) {
      startPollingInternal(stored.datasetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when datasetId is set and analysis is complete
  useEffect(() => {
    if (!isReady || !datasetId || analysisStatus !== "complete") return;
    fetchCompetitorsInternal(datasetId);
    fetchInsightsInternal(datasetId);
    fetchActionItemsInternal(datasetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, datasetId, analysisStatus]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPollingInternal = (dsId: string) => {
    stopPolling();

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze?datasetId=${dsId}`);
        if (!res.ok) return;
        const data = await res.json();
        const status = data.status as AnalysisStatus;

        setAnalysisStatus(status);
        setUploadProgress(STATUS_PROGRESS[status] ?? 0);

        if (status === "complete") {
          stopPolling();
          setLoading(false);
          saveToStorage({ datasetId: dsId, analysisStatus: "complete", reviewCount: 0 });
          // Fetch updated review count
          fetchReviewCount(dsId);
          // Data fetching is triggered by the useEffect watching analysisStatus
        } else if (status === "error") {
          stopPolling();
          setLoading(false);
          setError(data.error || "Analysis failed");
          setAnalysisStatus("error");
          saveToStorage({ datasetId: dsId, analysisStatus: "error", reviewCount: 0 });
        } else {
          saveToStorage({ datasetId: dsId, analysisStatus: status, reviewCount: 0 });
        }
      } catch {
        // Polling fetch failed — keep retrying
      }
    }, 2000);
  };

  const fetchReviewCount = async (dsId: string) => {
    try {
      const res = await fetch(`/api/upload?datasetId=${dsId}`);
      if (res.ok) {
        const data = await res.json();
        const count = data.reviewCount ?? 0;
        setReviewCount(count);
        saveToStorage({ datasetId: dsId, analysisStatus: "complete", reviewCount: count });
      }
    } catch {
      // Non-critical
    }
  };

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
      setUploadProgress(30);
      setAnalysisStatus("extracting");

      saveToStorage({
        datasetId: newDatasetId,
        analysisStatus: "extracting",
        reviewCount: uploadData.reviewCount,
      });

      // Step 2: Fire-and-forget analysis + start polling
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: newDatasetId }),
      }).catch((err) => {
        console.error("Analysis request failed:", err);
      });

      startPollingInternal(newDatasetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnalysisStatus("error");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerAnalysis = useCallback(
    async (dsId: string) => {
      setLoading(true);
      setError(null);
      setAnalysisStatus("extracting");
      setUploadProgress(30);

      saveToStorage({
        datasetId: dsId,
        analysisStatus: "extracting",
        reviewCount,
      });

      // Fire-and-forget analysis + start polling
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: dsId }),
      }).catch((err) => {
        console.error("Analysis request failed:", err);
      });

      startPollingInternal(dsId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewCount]
  );

  const uploadMoreReviews = useCallback(async (file: File) => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);
    setUploadProgress(10);
    setAnalysisStatus("uploading");

    // Clear local state for re-analysis
    setCompetitors([]);
    setInsights([]);
    setActionItems([]);

    try {
      // Upload with existing datasetId for append mode
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetId", datasetId);

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
      setReviewCount(uploadData.reviewCount);
      setUploadProgress(30);
      setAnalysisStatus("extracting");

      saveToStorage({
        datasetId,
        analysisStatus: "extracting",
        reviewCount: uploadData.reviewCount,
      });

      // Fire-and-forget analysis + start polling
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId }),
      }).catch((err) => {
        console.error("Analysis request failed:", err);
      });

      startPollingInternal(datasetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnalysisStatus("error");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

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
    stopPolling();
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
        uploadMoreReviews,
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
