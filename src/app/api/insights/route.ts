import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    const datasetId = request.nextUrl.searchParams.get("datasetId");

    if (!datasetId) {
        return NextResponse.json(
            { error: "Missing datasetId parameter." },
            { status: 400 }
        );
    }

    const insights = await prisma.insightTheme.findMany({
        where: { datasetId },
        include: {
            sourceQuotes: {
                include: {
                    review: true,
                    claim: true,
                },
            },
        },
        orderBy: { confidenceScore: "desc" },
    });

    const result = insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        impact: insight.impact,
        confidenceScore: insight.confidenceScore,
        sourceQuotes: insight.sourceQuotes.map((sq) => ({
            id: sq.id,
            quoteText: sq.claim.quoteText,
            claimText: sq.claim.claimText,
            reviewDate: sq.review.reviewDate,
            platform: sq.review.platform,
            rating: sq.review.rating,
            reviewerName: sq.review.reviewerName,
            reviewerRole: sq.review.reviewerRole,
            productName: sq.review.productName,
            reviewUrl: sq.review.reviewUrl,
        })),
    }));

    return NextResponse.json({ insights: result });
}
