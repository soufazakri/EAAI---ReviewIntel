"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    KeyRound,
    Save,
    CheckCircle2,
    Trash2,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const SETTINGS_KEY = "reviewintel_settings";

interface AppSettings {
    exportFormat: "pdf" | "csv";
}

function loadSettings(): AppSettings {
    if (typeof window === "undefined")
        return { exportFormat: "pdf" };
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { exportFormat: "pdf" };
        return JSON.parse(raw);
    } catch {
        return { exportFormat: "pdf" };
    }
}

function saveSettings(settings: AppSettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
    const { signOut, datasetId, reviewCount, competitors } = useAppStore();
    const [settings, setSettings] = useState<AppSettings>({
        exportFormat: "pdf",
    });
    const [saved, setSaved] = useState(false);
    const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);

    useEffect(() => {
        setSettings(loadSettings());
        fetch("/api/config/status")
            .then((res) => res.json())
            .then((data) => setGeminiConfigured(data.geminiKeyConfigured))
            .catch(() => setGeminiConfigured(false));
    }, []);

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Configure your ReviewIntel preferences.
                </p>
            </div>

            {/* API Key Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <KeyRound className="h-4 w-4" />
                        Gemini API Key
                    </CardTitle>
                    <CardDescription>
                        The Gemini API key is configured server-side via environment variables.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        {geminiConfigured === null ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                    Checking configuration...
                                </span>
                            </>
                        ) : geminiConfigured ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                    Gemini API key is configured
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                        Gemini API key is not configured
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        Set <code className="rounded bg-muted px-1 py-0.5">GEMINI_API_KEY</code> in your <code className="rounded bg-muted px-1 py-0.5">.env.local</code> file and restart the server.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Export Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Export Preferences</CardTitle>
                    <CardDescription>
                        Choose your default export format for battlecards and reports.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <button
                            onClick={() =>
                                setSettings({ ...settings, exportFormat: "pdf" })
                            }
                            className={`flex-1 rounded-lg border p-3 text-center transition-colors ${settings.exportFormat === "pdf"
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border hover:border-primary/30"
                                }`}
                        >
                            <p className="font-medium text-sm">PDF</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Formatted battlecards
                            </p>
                        </button>
                        <button
                            onClick={() =>
                                setSettings({ ...settings, exportFormat: "csv" })
                            }
                            className={`flex-1 rounded-lg border p-3 text-center transition-colors ${settings.exportFormat === "csv"
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border hover:border-primary/30"
                                }`}
                        >
                            <p className="font-medium text-sm">CSV</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Raw data + citations
                            </p>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Data Management</CardTitle>
                    <CardDescription>
                        Manage your uploaded review data and analysis results.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {datasetId ? (
                        <div className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Current Dataset</span>
                                <Badge variant="secondary">{reviewCount} reviews</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {competitors.length} competitors identified
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No dataset uploaded yet.
                        </p>
                    )}

                    <Separator />

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={signOut}
                        className="w-full"
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Clear All Data & Sign Out
                    </Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-3">
                <Button onClick={handleSave}>
                    {saved ? (
                        <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="mr-1.5 h-4 w-4" />
                            Save Settings
                        </>
                    )}
                </Button>
                {saved && (
                    <span className="text-sm text-green-600">
                        Settings saved successfully.
                    </span>
                )}
            </div>
        </div>
    );
}
