/**
 * Evidence Engine Pipeline
 * Processes uploaded CSV reviews into trustworthy, source-traced insights.
 *
 * Uses a SINGLE Gemini API call to extract all analysis at once:
 *   1. parseCSV — Extract reviews from CSV (local, no API)
 *   2. analyzeAllReviews — One Gemini call → competitors, insights, action items
 *   3. storeResults — Persist to database
 */

import { parse } from "csv-parse/sync";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./db";

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

// ─── Single Mega-Prompt ──────────────────────────────────────────────

interface ReviewInput {
    index: number;
    text: string;
    rating: number;
    platform: string;
    product: string;
    date: string;
    reviewer: string;
    role: string;
}

interface MegaAnalysisResult {
    competitors: Array<{
        name: string;
        mentionCount: number;
        avgSentiment: number;
        praiseThemes: string[];
        complaintThemes: string[];
    }>;
    insights: Array<{
        title: string;
        description: string;
        category: string;
        impact: string;
        confidenceScore: number;
        sourceReviewIndices: number[];
    }>;
    actionItems: Array<{
        title: string;
        description: string;
        priority: string;
        relatedInsightIndex: number;
    }>;
}

function buildMegaPrompt(reviews: ReviewInput[]): string {
    const reviewsJson = JSON.stringify(reviews, null, 1);

    return `You are a competitive intelligence analyst for HR Tech SaaS companies.

Analyze ALL of the following customer reviews and produce a COMPLETE analysis in a single JSON response.

## REVIEWS DATA:
${reviewsJson}

## INSTRUCTIONS:
Analyze every review above and produce the following:

### 1. COMPETITORS
Identify each unique product/company mentioned. For each competitor:
- Count how many reviews mention them
- Calculate average sentiment (-1.0 = very negative, 0 = neutral, +1.0 = very positive)
- List 2-4 praise themes (what users love)
- List 2-4 complaint themes (what users dislike)

### 2. INSIGHTS
Generate 5-10 actionable insights from patterns across reviews. Each insight must:
- Have a clear, specific title
- Have a detailed 1-2 sentence description
- Be categorized as: "feature_gap", "churn_driver", "product_strength", or "pricing_concern"
- Have impact rated as: "high", "medium", or "low"
- Have a confidenceScore (0.0 to 1.0) based on how many reviews support it
- Reference which reviews support it using their "index" values from the input

### 3. ACTION ITEMS
Generate 4-8 concrete action items based on the insights. Each must:
- Have a specific, actionable title (start with a verb)
- Have a detailed description of what to do
- Be prioritized as: "high", "medium", or "low"
- Reference which insight it relates to (by index in the insights array)

## REQUIRED JSON FORMAT:
{
  "competitors": [
    {
      "name": "Product Name",
      "mentionCount": 5,
      "avgSentiment": 0.3,
      "praiseThemes": ["Easy to use", "Good reporting"],
      "complaintThemes": ["Slow support", "High pricing"]
    }
  ],
  "insights": [
    {
      "title": "Onboarding Complexity Drives Churn",
      "description": "Multiple reviews across Workday and BambooHR mention...",
      "category": "churn_driver",
      "impact": "high",
      "confidenceScore": 0.8,
      "sourceReviewIndices": [0, 3, 7, 12]
    }
  ],
  "actionItems": [
    {
      "title": "Build guided onboarding wizard",
      "description": "Create a step-by-step onboarding flow...",
      "priority": "high",
      "relatedInsightIndex": 0
    }
  ]
}

Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;
}

// ─── Store Results in Database ───────────────────────────────────────

async function storeAnalysisResults(
    datasetId: string,
    result: MegaAnalysisResult,
    dbReviews: Array<{ id: string; reviewText: string; rating: number; platform: string; productName: string; reviewDate: string }>
) {
    console.log(`[store] Storing ${result.competitors.length} competitors, ${result.insights.length} insights, ${result.actionItems.length} action items`);

    // Store competitors
    for (const comp of result.competitors) {
        await prisma.competitor.create({
            data: {
                datasetId,
                name: comp.name || "Unknown",
                mentionCount: comp.mentionCount || 1,
                avgSentiment: comp.avgSentiment || 0,
                complaintThemes: JSON.stringify(comp.complaintThemes || []),
                praiseThemes: JSON.stringify(comp.praiseThemes || []),
            },
        });
    }

    // Store insights with source quotes
    const insightIds: string[] = [];
    for (const insight of result.insights) {
        const validCategories = ["feature_gap", "churn_driver", "product_strength", "pricing_concern"];
        const category = validCategories.includes(insight.category) ? insight.category : "feature_gap";
        const validImpacts = ["high", "medium", "low"];
        const impact = validImpacts.includes(insight.impact) ? insight.impact : "medium";

        const theme = await prisma.insightTheme.create({
            data: {
                datasetId,
                title: insight.title || "Untitled Insight",
                description: insight.description || "",
                category,
                impact,
                confidenceScore: Math.max(0, Math.min(1, insight.confidenceScore ?? 0.5)),
            },
        });
        insightIds.push(theme.id);

        // Link source reviews
        if (insight.sourceReviewIndices && insight.sourceReviewIndices.length > 0) {
            for (const reviewIdx of insight.sourceReviewIndices) {
                if (reviewIdx >= 0 && reviewIdx < dbReviews.length) {
                    const review = dbReviews[reviewIdx];
                    // Create a claim for the source quote
                    const claim = await prisma.claim.create({
                        data: {
                            datasetId,
                            reviewId: review.id,
                            claimText: insight.title,
                            category,
                            quoteText: review.reviewText.substring(0, 500),
                            confidence: insight.confidenceScore > 0.7 ? "high" : insight.confidenceScore > 0.4 ? "medium" : "low",
                        },
                    });
                    await prisma.insightSourceQuote.create({
                        data: {
                            insightThemeId: theme.id,
                            claimId: claim.id,
                            reviewId: review.id,
                        },
                    });
                }
            }
        }
    }

    // Store action items
    for (const item of result.actionItems) {
        const validPriorities = ["high", "medium", "low"];
        const priority = validPriorities.includes(item.priority) ? item.priority : "medium";

        // Link to related insight
        const insightId = (item.relatedInsightIndex >= 0 && item.relatedInsightIndex < insightIds.length)
            ? insightIds[item.relatedInsightIndex]
            : null;

        await prisma.actionItem.create({
            data: {
                datasetId,
                insightThemeId: insightId,
                title: item.title || "Action Item",
                description: item.description || "",
                priority,
                status: "not_started",
            },
        });
    }
}

// ─── Full Pipeline (Single API Call) ─────────────────────────────────

export async function runFullPipeline(datasetId: string): Promise<{
    insightCount: number;
    competitorCount: number;
    actionItemCount: number;
}> {
    try {
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "analyzing" },
        });

        const reviews = await prisma.review.findMany({
            where: { datasetId },
        });

        console.log(`[pipeline] Starting analysis for dataset ${datasetId} with ${reviews.length} reviews`);

        if (reviews.length === 0) {
            throw new Error("No reviews found for this dataset.");
        }

        // Build review inputs for the mega-prompt
        const reviewInputs: ReviewInput[] = reviews.map((r, i) => ({
            index: i,
            text: r.reviewText,
            rating: r.rating,
            platform: r.platform,
            product: r.productName,
            date: r.reviewDate,
            reviewer: r.reviewerName,
            role: r.reviewerRole,
        }));

        // ONE single API call
        console.log("[pipeline] Sending single mega-prompt to Gemini...");
        const model = getGeminiModel();
        const prompt = buildMegaPrompt(reviewInputs);
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        if (!content) {
            throw new Error("Gemini returned an empty response.");
        }

        console.log(`[pipeline] Gemini response received (${content.length} chars)`);

        // Parse the JSON response
        let analysisResult: MegaAnalysisResult;
        try {
            const parsed = JSON.parse(content);
            analysisResult = {
                competitors: parsed.competitors ?? [],
                insights: parsed.insights ?? [],
                actionItems: parsed.actionItems ?? parsed.actions ?? [],
            };
        } catch (parseErr) {
            console.error("[pipeline] Failed to parse Gemini response:", content.substring(0, 500));
            throw new Error("Gemini returned invalid JSON. Please try again.");
        }

        console.log(`[pipeline] Parsed: ${analysisResult.competitors.length} competitors, ${analysisResult.insights.length} insights, ${analysisResult.actionItems.length} action items`);

        // Store everything in the database
        await storeAnalysisResults(datasetId, analysisResult, reviews.map(r => ({
            id: r.id,
            reviewText: r.reviewText,
            rating: r.rating,
            platform: r.platform,
            productName: r.productName,
            reviewDate: r.reviewDate,
        })));

        // Update status
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status: "complete" },
        });

        const insightCount = await prisma.insightTheme.count({ where: { datasetId } });
        const competitorCount = await prisma.competitor.count({ where: { datasetId } });
        const actionItemCount = await prisma.actionItem.count({ where: { datasetId } });

        console.log(`[pipeline] ✅ Complete: ${insightCount} insights, ${competitorCount} competitors, ${actionItemCount} action items`);

        return { insightCount, competitorCount, actionItemCount };
    } catch (err) {
        console.error("[pipeline] ❌ Error:", err);
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
