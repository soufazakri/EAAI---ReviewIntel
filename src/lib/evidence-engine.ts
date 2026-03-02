/**
 * Evidence Engine Pipeline
 * Processes uploaded CSV reviews into trustworthy, source-traced insights.
 *
 * Uses a batched multi-step pipeline:
 *   1. Extraction — Batch reviews into groups, extract structured claims via Gemini
 *   2. Clustering — Group related claims by theme (code-based)
 *   3. Synthesis — Generate actionable insights from clustered claims via Gemini
 *   4. Battlecard — Generate action items from insights via Gemini
 *   5. Competitors — Extract competitor intelligence via Gemini
 */

import { parse } from "csv-parse/sync";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./db";
import {
    type ReviewForExtraction,
    type ClaimForSynthesis,
    type ClaimCluster,
    getExtractionSystemPrompt,
    getExtractionUserPrompt,
    getSynthesisSystemPrompt,
    getSynthesisUserPrompt,
    getBattlecardSystemPrompt,
    getBattlecardUserPrompt,
    getCompetitorExtractionSystemPrompt,
    getCompetitorExtractionUserPrompt,
} from "./prompts";

// ─── Column mapping for CSV formats ──────────────────────────────────

interface ColumnMap {
    reviewText: string;
    rating: string;
    reviewDate: string;
    platform: string;
    reviewerName: string;
    reviewerRole: string;
    productName: string;
    reviewUrl: string;
}

const STANDARD_COLUMNS: ColumnMap = {
    reviewText: "review_text",
    rating: "rating",
    reviewDate: "review_date",
    platform: "platform",
    reviewerName: "reviewer_name",
    reviewerRole: "reviewer_role",
    productName: "product_name",
    reviewUrl: "review_url",
};

const CAPTERRA_COLUMNS: ColumnMap = {
    reviewText: "Review",
    rating: "Overall Rating",
    reviewDate: "Date",
    platform: "platform",
    reviewerName: "Reviewer",
    reviewerRole: "Role",
    productName: "Product",
    reviewUrl: "URL",
};

const G2_COLUMNS: ColumnMap = {
    reviewText: "Review Text",
    rating: "Star Rating",
    reviewDate: "Review Date",
    platform: "platform",
    reviewerName: "Reviewer Name",
    reviewerRole: "Reviewer Role",
    productName: "Product Name",
    reviewUrl: "Review URL",
};

function detectColumnMap(headers: string[]): ColumnMap {
    const h = new Set(headers.map((s) => s.trim().toLowerCase()));
    if (h.has("review_text") && h.has("rating")) return STANDARD_COLUMNS;
    if (h.has("overall rating") || h.has("review")) return CAPTERRA_COLUMNS;
    if (h.has("star rating") || h.has("review text")) return G2_COLUMNS;
    return STANDARD_COLUMNS; // fallback
}

function getField(
    row: Record<string, string>,
    colMap: ColumnMap,
    field: keyof ColumnMap,
    fallback: string = ""
): string {
    const key = colMap[field];
    if (row[key] !== undefined) return row[key].trim();
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(row)) {
        if (k.trim().toLowerCase() === lower) return v.trim();
    }
    return fallback;
}

// ─── Step 1: Parse CSV ───────────────────────────────────────────────

export interface ParsedReview {
    reviewText: string;
    rating: number;
    reviewDate: string;
    platform: string;
    reviewerName: string;
    reviewerRole: string;
    productName: string;
    reviewUrl: string;
}

export function parseCSV(csvContent: string): ParsedReview[] {
    const records: Record<string, string>[] = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
    });

    if (records.length === 0) {
        throw new Error("CSV file is empty or has no valid rows.");
    }

    const headers = Object.keys(records[0]);
    const colMap = detectColumnMap(headers);

    const reviews: ParsedReview[] = [];

    for (const row of records) {
        const reviewText = getField(row, colMap, "reviewText");
        if (!reviewText) continue;

        const ratingStr = getField(row, colMap, "rating", "3");
        const rating = Math.min(5, Math.max(1, parseFloat(ratingStr) || 3));

        reviews.push({
            reviewText,
            rating,
            reviewDate: getField(row, colMap, "reviewDate", new Date().toISOString().split("T")[0]),
            platform: getField(row, colMap, "platform", "Unknown"),
            reviewerName: getField(row, colMap, "reviewerName", "Anonymous"),
            reviewerRole: getField(row, colMap, "reviewerRole", ""),
            productName: getField(row, colMap, "productName", "Unknown Product"),
            reviewUrl: getField(row, colMap, "reviewUrl", ""),
        });
    }

    if (reviews.length === 0) {
        throw new Error(
            "No valid reviews found. Ensure your CSV has a column for review text (e.g., 'review_text', 'Review', or 'Review Text')."
        );
    }

    return reviews;
}

// ─── Gemini Client ───────────────────────────────────────────────────

function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
        throw new Error(
            "Missing GEMINI_API_KEY. Please set it in .env or .env.local."
        );
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────

interface ExtractedClaim {
    reviewId: string;
    claimText: string;
    category: "feature_request" | "complaint" | "praise" | "churn_signal";
    quoteText: string;
    confidence: "high" | "medium" | "low";
    competitorMentions: string[];
}

interface SynthesizedInsight {
    title: string;
    description: string;
    category: string;
    impact: string;
    confidenceScore: number;
    supportingClaimIds: number[];
    affectedCompetitors: string[];
    suggestedAction: string;
}

interface BattlecardItem {
    title: string;
    description: string;
    priority: string;
    relatedInsightTitle: string;
}

interface ExtractedCompetitor {
    name: string;
    mentionCount: number;
    avgSentiment: number;
    complaintThemes: string[];
    praiseThemes: string[];
}

function validateCategory(cat: string): "feature_request" | "complaint" | "praise" | "churn_signal" {
    const valid = ["feature_request", "complaint", "praise", "churn_signal"] as const;
    if ((valid as readonly string[]).includes(cat)) return cat as typeof valid[number];
    return "complaint";
}

function validateInsightCategory(cat: string): string {
    const valid = ["feature_gap", "churn_driver", "product_strength", "pricing_concern"];
    if (valid.includes(cat)) return cat;
    return "feature_gap";
}

function validateLevel(val: string): "high" | "medium" | "low" {
    const valid = ["high", "medium", "low"] as const;
    if ((valid as readonly string[]).includes(val)) return val as typeof valid[number];
    return "medium";
}

function getQuoteText(claim: { quoteText?: string }, reviewText: string): string {
    if (claim.quoteText && claim.quoteText.trim().length > 0) {
        return claim.quoteText;
    }
    console.warn(`[extraction] No quoteText for claim, using fallback from review`);
    return reviewText.substring(0, 200) + (reviewText.length > 200 ? "..." : "");
}

function safeJsonParse<T>(content: string, label: string): T {
    try {
        // Strip markdown code fences if present
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
        }
        return JSON.parse(cleaned);
    } catch {
        console.error(`[${label}] Failed to parse JSON response:`, content.substring(0, 500));
        throw new Error(`Gemini returned invalid JSON in ${label} step. Please try again.`);
    }
}

// ─── Clustering (code-based) ─────────────────────────────────────────

const STOP_WORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "for", "and", "nor", "but",
    "or", "yet", "so", "in", "on", "at", "to", "from", "by", "with", "of",
    "about", "between", "through", "during", "before", "after", "above",
    "below", "it", "its", "this", "that", "these", "those", "i", "we",
    "they", "our", "their", "my", "your", "not", "no", "very", "too",
    "also", "just", "more", "most", "much", "many", "some", "than", "then",
    "when", "what", "which", "who", "how", "like", "need", "want", "good",
    "well", "really", "there", "been", "only", "even", "still",
]);

function extractSignificantWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function generateThemeName(category: string, claims: ExtractedClaim[]): string {
    const allWords = claims.flatMap((c) => extractSignificantWords(c.claimText));
    const wordCounts = new Map<string, number>();
    for (const word of allWords) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    const topWords = [...wordCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([w]) => w);

    const categoryLabel: Record<string, string> = {
        feature_request: "Feature Request",
        complaint: "Complaint",
        praise: "Strength",
        churn_signal: "Churn Risk",
    };

    return `${categoryLabel[category] || category}: ${topWords.join(", ")}`;
}

function clusterClaims(
    claims: ExtractedClaim[],
    reviewMap: Map<string, { platform: string; rating: number; reviewDate: string; productName: string }>
): ClaimCluster[] {
    // Group by category
    const byCategory = new Map<string, ExtractedClaim[]>();
    for (const claim of claims) {
        const existing = byCategory.get(claim.category) || [];
        existing.push(claim);
        byCategory.set(claim.category, existing);
    }

    const clusters: ClaimCluster[] = [];

    for (const [category, categoryClaims] of byCategory) {
        const unclustered = new Set(categoryClaims.map((_, i) => i));

        while (unclustered.size > 0) {
            const seedIdx = unclustered.values().next().value!;
            const seed = categoryClaims[seedIdx];
            unclustered.delete(seedIdx);

            const clusterMembers: ExtractedClaim[] = [seed];
            const seedWords = extractSignificantWords(seed.claimText);

            for (const idx of [...unclustered]) {
                const candidate = categoryClaims[idx];
                const candidateWords = extractSignificantWords(candidate.claimText);
                const overlap = seedWords.filter((w) => candidateWords.includes(w));

                if (overlap.length >= 1) {
                    clusterMembers.push(candidate);
                    unclustered.delete(idx);
                }
            }

            const theme = generateThemeName(category, clusterMembers);

            clusters.push({
                theme,
                claims: clusterMembers.map((c): ClaimForSynthesis => {
                    const review = reviewMap.get(c.reviewId);
                    return {
                        claimText: c.claimText,
                        category: c.category,
                        quoteText: c.quoteText,
                        confidence: c.confidence,
                        reviewId: c.reviewId,
                        platform: review?.platform || "",
                        rating: review?.rating || 0,
                        reviewDate: review?.reviewDate || "",
                        productName: review?.productName || "",
                    };
                }),
            });
        }
    }

    return clusters;
}

// ─── Pipeline Steps ──────────────────────────────────────────────────

const BATCH_SIZE = 20;

async function runExtractionStep(
    model: ReturnType<typeof getGeminiModel>,
    dbReviews: Array<{ id: string; reviewText: string; rating: number; platform: string; productName: string; reviewDate: string }>
): Promise<ExtractedClaim[]> {
    const allClaims: ExtractedClaim[] = [];
    const totalBatches = Math.ceil(dbReviews.length / BATCH_SIZE);

    for (let i = 0; i < dbReviews.length; i += BATCH_SIZE) {
        const batch = dbReviews.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        const reviewsForExtraction: ReviewForExtraction[] = batch.map((r) => ({
            id: r.id,
            reviewText: r.reviewText,
            rating: r.rating,
            platform: r.platform,
            productName: r.productName,
            reviewDate: r.reviewDate,
        }));

        const systemPrompt = getExtractionSystemPrompt();
        const userPrompt = getExtractionUserPrompt(reviewsForExtraction);

        let parsed: Array<{
            reviewId?: string;
            claimText?: string;
            category?: string;
            quoteText?: string;
            confidence?: string;
            competitorMentions?: string[];
        }>;

        // Try up to 2 times on parse failure
        let attempts = 0;
        while (true) {
            attempts++;
            try {
                const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
                const content = result.response.text();
                parsed = safeJsonParse(content, `extraction batch ${batchNum}`);
                if (!Array.isArray(parsed)) parsed = [];
                break;
            } catch (err) {
                if (attempts >= 2) throw err;
                console.warn(`[extraction] Batch ${batchNum} parse failed, retrying...`);
            }
        }

        const batchClaims: ExtractedClaim[] = parsed.map((claim) => {
            const reviewId = claim.reviewId || batch[0]?.id || "";
            const review = batch.find((r) => r.id === reviewId);
            return {
                reviewId,
                claimText: claim.claimText || "",
                category: validateCategory(claim.category || "complaint"),
                quoteText: getQuoteText(claim, review?.reviewText || ""),
                confidence: validateLevel(claim.confidence || "medium"),
                competitorMentions: claim.competitorMentions || [],
            };
        }).filter((c) => c.claimText.length > 0);

        allClaims.push(...batchClaims);
        console.log(`[extraction] Batch ${batchNum}/${totalBatches}: ${batchClaims.length} claims extracted`);
    }

    return allClaims;
}

async function runSynthesisStep(
    model: ReturnType<typeof getGeminiModel>,
    clusters: ClaimCluster[]
): Promise<SynthesizedInsight[]> {
    const systemPrompt = getSynthesisSystemPrompt();
    const userPrompt = getSynthesisUserPrompt(clusters);

    const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
    const content = result.response.text();
    const parsed = safeJsonParse<SynthesizedInsight[]>(content, "synthesis");

    if (!Array.isArray(parsed)) return [];

    return parsed.map((insight) => ({
        title: insight.title || "Untitled Insight",
        description: insight.description || "",
        category: validateInsightCategory(insight.category || "feature_gap"),
        impact: validateLevel(insight.impact || "medium"),
        confidenceScore: Math.max(0, Math.min(1, insight.confidenceScore ?? 0.5)),
        supportingClaimIds: Array.isArray(insight.supportingClaimIds) ? insight.supportingClaimIds : [],
        affectedCompetitors: Array.isArray(insight.affectedCompetitors) ? insight.affectedCompetitors : [],
        suggestedAction: insight.suggestedAction || "",
    }));
}

async function runBattlecardStep(
    model: ReturnType<typeof getGeminiModel>,
    insights: SynthesizedInsight[]
): Promise<BattlecardItem[]> {
    const systemPrompt = getBattlecardSystemPrompt();
    const insightsForPrompt = insights.map((ins) => ({
        title: ins.title,
        description: ins.description,
        category: ins.category,
        impact: ins.impact,
        supportingQuoteCount: ins.supportingClaimIds.length,
    }));
    const userPrompt = getBattlecardUserPrompt(insightsForPrompt);

    const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
    const content = result.response.text();
    const parsed = safeJsonParse<BattlecardItem[]>(content, "battlecard");

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
        title: item.title || "Action Item",
        description: item.description || "",
        priority: validateLevel(item.priority || "medium"),
        relatedInsightTitle: item.relatedInsightTitle || "",
    }));
}

async function runCompetitorExtractionStep(
    model: ReturnType<typeof getGeminiModel>,
    reviews: Array<{ productName: string; reviewText: string; rating: number }>
): Promise<ExtractedCompetitor[]> {
    const systemPrompt = getCompetitorExtractionSystemPrompt();
    const userPrompt = getCompetitorExtractionUserPrompt(reviews);

    const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
    const content = result.response.text();
    const parsed = safeJsonParse<ExtractedCompetitor[]>(content, "competitor extraction");

    if (!Array.isArray(parsed)) return [];

    return parsed.map((comp) => ({
        name: comp.name || "Unknown",
        mentionCount: comp.mentionCount || 1,
        avgSentiment: comp.avgSentiment || 0,
        complaintThemes: Array.isArray(comp.complaintThemes) ? comp.complaintThemes : [],
        praiseThemes: Array.isArray(comp.praiseThemes) ? comp.praiseThemes : [],
    }));
}

// ─── Evidence Rules (No Quote, No Claim) ─────────────────────────────

function applyEvidenceRules(
    insights: SynthesizedInsight[],
    totalClaimCount: number
): SynthesizedInsight[] {
    return insights
        .filter((insight) => {
            const validClaims = insight.supportingClaimIds.filter(
                (idx) => idx >= 0 && idx < totalClaimCount
            );
            if (validClaims.length === 0) {
                console.warn(`[evidence-rules] Dropping insight "${insight.title}": no supporting claims`);
                return false;
            }
            return true;
        })
        .map((insight) => {
            const validClaims = insight.supportingClaimIds.filter(
                (idx) => idx >= 0 && idx < totalClaimCount
            );
            if (validClaims.length === 1) {
                return {
                    ...insight,
                    confidenceScore: Math.min(insight.confidenceScore, 0.3),
                    category: insight.category.includes("_low_evidence")
                        ? insight.category
                        : insight.category + "_low_evidence",
                    supportingClaimIds: validClaims,
                };
            }
            return { ...insight, supportingClaimIds: validClaims };
        });
}

// ─── Storage Functions ───────────────────────────────────────────────

async function storeExtractionResults(
    datasetId: string,
    claims: ExtractedClaim[],
    reviewTextMap: Map<string, string>
): Promise<Map<string, string>> {
    // Bulk insert claims
    await prisma.claim.createMany({
        data: claims.map((claim) => ({
            datasetId,
            reviewId: claim.reviewId,
            claimText: claim.claimText,
            category: claim.category,
            quoteText: getQuoteText(claim, reviewTextMap.get(claim.reviewId) || ""),
            confidence: claim.confidence,
        })),
    });

    // Fetch back to get IDs for linking
    const dbClaims = await prisma.claim.findMany({
        where: { datasetId },
        select: { id: true, reviewId: true, claimText: true },
    });

    const claimIdMap = new Map<string, string>();
    for (const c of dbClaims) {
        claimIdMap.set(`${c.reviewId}|${c.claimText}`, c.id);
    }

    return claimIdMap;
}

async function storeInsightsAndLinks(
    datasetId: string,
    insights: SynthesizedInsight[],
    allClaims: ExtractedClaim[],
    claimIdMap: Map<string, string>
): Promise<{ insightIds: string[]; insightTitles: string[] }> {
    const insightIds: string[] = [];
    const insightTitles: string[] = [];

    for (const insight of insights) {
        const theme = await prisma.insightTheme.create({
            data: {
                datasetId,
                title: insight.title,
                description: insight.description,
                category: insight.category,
                impact: validateLevel(insight.impact),
                confidenceScore: insight.confidenceScore,
            },
        });
        insightIds.push(theme.id);
        insightTitles.push(insight.title);

        // Link supporting claims via InsightSourceQuote
        for (const claimIdx of insight.supportingClaimIds) {
            if (claimIdx >= 0 && claimIdx < allClaims.length) {
                const claim = allClaims[claimIdx];
                const claimId = claimIdMap.get(`${claim.reviewId}|${claim.claimText}`);
                if (claimId) {
                    await prisma.insightSourceQuote.create({
                        data: {
                            insightThemeId: theme.id,
                            claimId,
                            reviewId: claim.reviewId,
                        },
                    });
                }
            }
        }
    }

    return { insightIds, insightTitles };
}

async function storeCompetitors(
    datasetId: string,
    competitors: ExtractedCompetitor[]
): Promise<void> {
    await prisma.competitor.createMany({
        data: competitors.map((comp) => ({
            datasetId,
            name: comp.name,
            mentionCount: comp.mentionCount,
            avgSentiment: comp.avgSentiment,
            complaintThemes: JSON.stringify(comp.complaintThemes),
            praiseThemes: JSON.stringify(comp.praiseThemes),
        })),
    });
}

async function storeActionItems(
    datasetId: string,
    battlecardItems: BattlecardItem[],
    insightIds: string[],
    insightTitles: string[]
): Promise<void> {
    await prisma.actionItem.createMany({
        data: battlecardItems.map((item) => {
            const insightIdx = insightTitles.findIndex(
                (t) => t.toLowerCase() === item.relatedInsightTitle.toLowerCase()
            );
            return {
                datasetId,
                insightThemeId: insightIdx >= 0 ? insightIds[insightIdx] : null,
                title: item.title,
                description: item.description,
                priority: validateLevel(item.priority),
                status: "not_started",
            };
        }),
    });
}

// ─── Full Pipeline (Multi-Step) ──────────────────────────────────────

export async function runFullPipeline(datasetId: string): Promise<{
    insightCount: number;
    competitorCount: number;
    actionItemCount: number;
}> {
    try {
        // ── Step 1: Extraction ──
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "extracting" },
        });

        const reviews = await prisma.review.findMany({
            where: { datasetId },
        });

        if (reviews.length === 0) {
            throw new Error("No reviews found for this dataset.");
        }

        const model = getGeminiModel();

        console.log(`[pipeline] Step 1: Extracting claims from ${reviews.length} reviews...`);
        const extractedClaims = await runExtractionStep(
            model,
            reviews.map((r) => ({
                id: r.id,
                reviewText: r.reviewText,
                rating: r.rating,
                platform: r.platform,
                productName: r.productName,
                reviewDate: r.reviewDate,
            }))
        );
        console.log(`[pipeline] Step 1 complete: ${extractedClaims.length} claims extracted`);

        // Build review text map for fallback quotes
        const reviewTextMap = new Map(reviews.map((r) => [r.id, r.reviewText]));

        // Store claims in DB
        const claimIdMap = await storeExtractionResults(datasetId, extractedClaims, reviewTextMap);

        // ── Step 2: Clustering ──
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "clustering" },
        });

        console.log(`[pipeline] Step 2: Clustering ${extractedClaims.length} claims...`);

        const reviewMap = new Map(
            reviews.map((r) => [
                r.id,
                { platform: r.platform, rating: r.rating, reviewDate: r.reviewDate, productName: r.productName },
            ])
        );

        const clusters = clusterClaims(extractedClaims, reviewMap);
        console.log(`[pipeline] Step 2 complete: ${clusters.length} clusters formed`);

        // ── Step 3: Synthesis ──
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "synthesizing" },
        });

        console.log(`[pipeline] Step 3: Synthesizing insights from ${clusters.length} clusters...`);
        const rawInsights = await runSynthesisStep(model, clusters);

        // Apply evidence rules
        const filteredInsights = applyEvidenceRules(rawInsights, extractedClaims.length);
        console.log(`[pipeline] Step 3 complete: ${filteredInsights.length} insights (${rawInsights.length - filteredInsights.length} dropped for insufficient evidence)`);

        // Store insights and link source quotes
        const { insightIds, insightTitles } = await storeInsightsAndLinks(
            datasetId,
            filteredInsights,
            extractedClaims,
            claimIdMap
        );

        // ── Step 4: Battlecard Generation ──
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "generating_battlecards" },
        });

        console.log(`[pipeline] Step 4: Generating battlecard action items...`);
        const battlecardItems = await runBattlecardStep(model, filteredInsights);
        console.log(`[pipeline] Step 4 complete: ${battlecardItems.length} action items generated`);

        await storeActionItems(datasetId, battlecardItems, insightIds, insightTitles);

        // ── Step 5: Competitor Extraction ──
        console.log(`[pipeline] Step 5: Extracting competitor intelligence...`);
        const competitorData = await runCompetitorExtractionStep(
            model,
            reviews.map((r) => ({
                productName: r.productName,
                reviewText: r.reviewText,
                rating: r.rating,
            }))
        );
        console.log(`[pipeline] Step 5 complete: ${competitorData.length} competitors extracted`);

        await storeCompetitors(datasetId, competitorData);

        // ── Complete ──
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "complete" },
        });

        const insightCount = await prisma.insightTheme.count({ where: { datasetId } });
        const competitorCount = await prisma.competitor.count({ where: { datasetId } });
        const actionItemCount = await prisma.actionItem.count({ where: { datasetId } });

        console.log(`[pipeline] Complete: ${insightCount} insights, ${competitorCount} competitors, ${actionItemCount} action items`);

        return { insightCount, competitorCount, actionItemCount };
    } catch (err) {
        console.error("[pipeline] Error:", err);
        await prisma.dataset.update({
            where: { id: datasetId },
            data: {
                status: "error",
                errorMsg: err instanceof Error ? err.message : "An unknown error occurred",
            },
        });
        throw err;
    }
}
