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

    const competitors = await prisma.competitor.findMany({
        where: { datasetId },
        orderBy: { mentionCount: "desc" },
    });

    const result = competitors.map((c) => ({
        id: c.id,
        name: c.name,
        mentionCount: c.mentionCount,
        avgSentiment: c.avgSentiment,
        complaintThemes: JSON.parse(c.complaintThemes) as string[],
        praiseThemes: JSON.parse(c.praiseThemes) as string[],
    }));

    return NextResponse.json({ competitors: result });
}
