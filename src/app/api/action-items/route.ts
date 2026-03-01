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

    const actionItems = await prisma.actionItem.findMany({
        where: { datasetId },
        include: {
            insightTheme: {
                include: {
                    sourceQuotes: {
                        include: {
                            review: true,
                            claim: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ priority: "asc" }, { status: "asc" }],
    });

    const result = actionItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: item.status,
        insightTitle: item.insightTheme?.title ?? null,
        insightDescription: item.insightTheme?.description ?? null,
        insightCategory: item.insightTheme?.category ?? null,
        confidenceScore: item.insightTheme?.confidenceScore ?? 0,
        sourceQuotes:
            item.insightTheme?.sourceQuotes.map((sq) => ({
                id: sq.id,
                quoteText: sq.claim.quoteText,
                claimText: sq.claim.claimText,
                reviewDate: sq.review.reviewDate,
                platform: sq.review.platform,
                rating: sq.review.rating,
                reviewerName: sq.review.reviewerName,
                reviewerRole: sq.review.reviewerRole,
                productName: sq.review.productName,
            })) ?? [],
    }));

    return NextResponse.json({ actionItems: result });
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: "Missing id or status." },
                { status: 400 }
            );
        }

        const validStatuses = ["not_started", "in_progress", "complete"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }

        const updated = await prisma.actionItem.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ actionItem: updated });
    } catch (err) {
        console.error("Error updating action item:", err);
        return NextResponse.json(
            { error: "Failed to update action item." },
            { status: 500 }
        );
    }
}
