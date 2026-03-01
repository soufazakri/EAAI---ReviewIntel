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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    KeyRound,
    Save,
    CheckCircle2,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const SETTINGS_KEY = "reviewintel_settings";

interface AppSettings {
    openaiKey: string;
    exportFormat: "pdf" | "csv";
}

function loadSettings(): AppSettings {
    if (typeof window === "undefined")
        return { openaiKey: "", exportFormat: "pdf" };
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { openaiKey: "", exportFormat: "pdf" };
        return JSON.parse(raw);
    } catch {
        return { openaiKey: "", exportFormat: "pdf" };
    }
}

function saveSettings(settings: AppSettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
    const { signOut, datasetId, reviewCount, competitors } = useAppStore();
    const [settings, setSettings] = useState<AppSettings>({
        openaiKey: "",
        exportFormat: "pdf",
    });
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSettings(loadSettings());
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

            {/* API Key */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <KeyRound className="h-4 w-4" />
                        Gemini API Key
                    </CardTitle>
                    <CardDescription>
                        Your Google Gemini API key is stored locally and used for review
                        analysis. The server-side key in .env.local takes priority.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                type={showKey ? "text" : "password"}
                                placeholder="AIza..."
                                value={settings.openaiKey}
                                onChange={(e) =>
                                    setSettings({ ...settings, openaiKey: e.target.value })
                                }
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            Your API key is stored in localStorage only. It is never sent to
                            any third-party server.
                        </span>
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
