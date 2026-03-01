"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ArrowRight,
  FileText,
  CheckCircle2,
  Loader2,
  Download,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

function FloatingOrb({
  delay,
  size,
  x,
  y,
}: {
  delay: number;
  size: number;
  x: string;
  y: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary/5 blur-3xl"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "h-1.5 rounded-full",
            i === current ? "bg-primary" : i < current ? "bg-primary/50" : "bg-muted-foreground/20"
          )}
          animate={{ width: i === current ? 32 : 12 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const store = useAppStore();
  const [step, setStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [direction, setDirection] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedCompetitors, setExtractedCompetitors] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    goNext(); // Move to step 3 (analysis progress)

    try {
      await store.uploadCSV(selectedFile);

      // Extract competitor names from store after analysis
      const competitors = store.competitors.map((c) => c.name);
      setExtractedCompetitors(competitors);
      setSelectedCompetitors(competitors);

      // Move to competitor selection step
      setDirection(1);
      setStep(4);
    } catch {
      // Error is handled in the store
    }
  }, [selectedFile, store, goNext]);

  const handleFinish = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const statusMessages: Record<string, string> = {
    uploading: "Uploading your CSV file...",
    parsing: "Parsing review data...",
    analyzing: "Analyzing reviews with AI...",
    complete: "Analysis complete!",
    error: store.error ?? "An error occurred",
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <FloatingOrb delay={0} size={600} x="10%" y="10%" />
        <FloatingOrb delay={2} size={400} x="70%" y="60%" />
        <FloatingOrb delay={4} size={500} x="50%" y="20%" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.015 }}
        transition={{ duration: 3 }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StepIndicator current={step} total={5} />
        </motion.div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-8"
            >
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <motion.div
                    className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              <div className="space-y-3 text-center">
                <motion.h1
                  className="text-4xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Welcome to ReviewIntel
                </motion.h1>
                <motion.p
                  className="text-lg text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  AI-powered competitive intelligence for HR Tech.
                  <br />
                  Every insight backed by real review quotes.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  "Source Traceability",
                  "Competitive Battlecards",
                  "Churn Intelligence",
                ].map((feature, i) => (
                  <motion.span
                    key={feature}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    {feature}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  size="lg"
                  className="group w-full text-base"
                  onClick={goNext}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 1: SaaS Vertical Confirmation */}
          {step === 1 && (
            <motion.div
              key="vertical"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <Building2 className="h-6 w-6 text-primary" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your SaaS Vertical
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  ReviewIntel is optimized for HR Tech SaaS competitive analysis.
                </motion.p>
              </div>

              <motion.div
                className="rounded-xl border border-primary bg-primary/5 p-4 ring-1 ring-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💼</span>
                  <div>
                    <p className="font-semibold">HR Tech SaaS</p>
                    <p className="text-sm text-muted-foreground">
                      HRIS, ATS, Payroll, Benefits, Workforce Management
                    </p>
                  </div>
                  <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                </div>
              </motion.div>

              <motion.p
                className="text-center text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Analyze reviews from G2, Capterra, and app stores for products like
                BambooHR, Workday, Rippling, Deel, and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="group w-full text-base"
                  onClick={goNext}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: CSV Upload */}
          {step === 2 && (
            <motion.div
              key="upload"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <Upload className="h-6 w-6 text-blue-600" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Upload Your Reviews
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Drop a CSV export from G2, Capterra, or any review platform.
                </motion.p>
              </div>

              {/* Drag & Drop Zone */}
              <motion.div
                className={cn(
                  "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : selectedFile
                      ? "border-green-500 bg-green-500/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-10 w-10 text-green-600" />
                    <p className="font-medium text-green-700">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">
                      Drop your CSV here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accepts Capterra, G2, and standard CSV formats
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Sample Data Link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <a
                  href="/sample-data/sample-reviews.csv"
                  download
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download sample HR Tech review data
                </a>
              </motion.div>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="group w-full text-base"
                  disabled={!selectedFile}
                  onClick={handleUpload}
                >
                  Analyze Reviews
                  <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Analysis Progress */}
          {step === 3 && (
            <motion.div
              key="progress"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-8"
            >
              <div className="space-y-3 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  {store.analysisStatus === "error" ? (
                    <span className="text-3xl">⚠️</span>
                  ) : store.analysisStatus === "complete" ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  )}
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {store.analysisStatus === "error"
                    ? "Analysis Error"
                    : store.analysisStatus === "complete"
                      ? "Analysis Complete!"
                      : "Analyzing Your Reviews"}
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {statusMessages[store.analysisStatus] ?? "Processing..."}
                </motion.p>
              </div>

              {/* Progress Bar */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      store.analysisStatus === "error"
                        ? "bg-red-500"
                        : store.analysisStatus === "complete"
                          ? "bg-green-500"
                          : "bg-primary"
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: `${store.uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {store.uploadProgress}% complete
                </p>
              </motion.div>

              {/* Error Message */}
              {store.analysisStatus === "error" && store.error && (
                <motion.div
                  className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="font-medium">Error:</p>
                  <p>{store.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      store.clearError();
                      setDirection(-1);
                      setStep(2);
                    }}
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}

              {/* Steps checklist */}
              {store.analysisStatus !== "error" && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { key: "uploading", label: "Uploading CSV file" },
                    { key: "parsing", label: "Parsing review data" },
                    { key: "analyzing", label: "Running AI analysis" },
                    { key: "complete", label: "Generating insights" },
                  ].map((s) => {
                    const steps = ["uploading", "parsing", "analyzing", "complete"];
                    const currentIdx = steps.indexOf(store.analysisStatus);
                    const stepIdx = steps.indexOf(s.key);
                    const isDone = stepIdx < currentIdx || store.analysisStatus === "complete";
                    const isCurrent = stepIdx === currentIdx && store.analysisStatus !== "complete";

                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            isDone
                              ? "text-foreground"
                              : isCurrent
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Complete / Summary */}
          {step === 4 && (
            <motion.div
              key="complete"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Analysis Complete! 🎉
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Here&apos;s what we found in your reviews.
                </motion.p>
              </div>

              {/* Summary Stats */}
              <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{store.reviewCount}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{store.competitors.length}</p>
                  <p className="text-xs text-muted-foreground">Competitors</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{store.insights.length}</p>
                  <p className="text-xs text-muted-foreground">Insights</p>
                </div>
              </motion.div>

              {/* Competitor list */}
              {extractedCompetitors.length > 0 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Competitors Identified
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedCompetitors.map((name) => (
                      <span
                        key={name}
                        className="rounded-full border bg-card px-3 py-1 text-sm font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="group w-full text-base"
                  onClick={handleFinish}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
