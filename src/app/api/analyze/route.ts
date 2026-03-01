import { NextRequest, NextResponse } from "next/server";
import { runFullPipeline } from "@/lib/evidence-engine";
import { prisma } from "@/lib/db";

export const maxDuration = 300; // Allow up to 5 minutes for analysis

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { datasetId } = body;

        console.log("[analyze] datasetId:", datasetId);
        console.log("[analyze] GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
        console.log("[analyze] GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length ?? 0);
        console.log("[analyze] GEMINI_API_KEY is placeholder:", process.env.GEMINI_API_KEY === "your-key-here");

        if (!datasetId) {
            console.log("[analyze] REJECTED: missing datasetId");
            return NextResponse.json(
                { error: "Missing datasetId." },
                { status: 400 }
            );
        }

        // Verify dataset exists
        const dataset = await prisma.dataset.findUnique({
            where: { id: datasetId },
        });

        console.log("[analyze] dataset:", dataset?.id, "status:", dataset?.status);

        if (!dataset) {
            console.log("[analyze] REJECTED: dataset not found");
            return NextResponse.json(
                { error: "Dataset not found." },
                { status: 404 }
            );
        }

        if (dataset.status === "analyzing") {
            console.log("[analyze] REJECTED: already analyzing");
            return NextResponse.json(
                { error: "Analysis is already in progress." },
                { status: 409 }
            );
        }

        // Check for Gemini API key
        const geminiKey = process.env.GEMINI_API_KEY;
        console.log("[analyze] GEMINI_API_KEY present:", !!geminiKey, "length:", geminiKey?.length ?? 0);
        if (!geminiKey || geminiKey.length < 10) {
            console.log("[analyze] REJECTED: missing or too short API key");
            return NextResponse.json(
                {
                    error:
                        "Missing Gemini API key. Please set GEMINI_API_KEY in .env or .env.local.",
                },
                { status: 400 }
            );
        }

        console.log("[analyze] All checks passed, running pipeline...");

        // Run the full evidence engine pipeline
        const result = await runFullPipeline(datasetId);

        return NextResponse.json({
            status: "complete",
            insightCount: result.insightCount,
            competitorCount: result.competitorCount,
            actionItemCount: result.actionItemCount,
        });
    } catch (err) {
        console.error("Analysis error:", err);

        // Check for rate limit errors
        const errorMessage =
            err instanceof Error ? err.message : "Analysis failed.";
        const isRateLimit =
            errorMessage.includes("rate limit") ||
            errorMessage.includes("429") ||
            errorMessage.includes("Rate limit");

        return NextResponse.json(
            {
                error: isRateLimit
                    ? "OpenAI rate limit exceeded. Please wait a moment and try again."
                    : errorMessage,
            },
            { status: isRateLimit ? 429 : 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const datasetId = request.nextUrl.searchParams.get("datasetId");

    if (!datasetId) {
        return NextResponse.json(
            { error: "Missing datasetId parameter." },
            { status: 400 }
        );
    }

    const dataset = await prisma.dataset.findUnique({
        where: { id: datasetId },
    });

    if (!dataset) {
        return NextResponse.json(
            { error: "Dataset not found." },
            { status: 404 }
        );
    }

    return NextResponse.json({
        status: dataset.status,
        error: dataset.errorMsg,
    });
}
