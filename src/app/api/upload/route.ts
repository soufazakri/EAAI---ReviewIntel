import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/evidence-engine";
import { prisma } from "@/lib/db";

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
        include: { _count: { select: { reviews: true } } },
    });

    if (!dataset) {
        return NextResponse.json(
            { error: "Dataset not found." },
            { status: 404 }
        );
    }

    return NextResponse.json({
        datasetId: dataset.id,
        reviewCount: dataset._count.reviews,
        status: dataset.status,
    });
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const existingDatasetId = formData.get("datasetId") as string | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided. Please upload a CSV file." },
                { status: 400 }
            );
        }

        if (!file.name.endsWith(".csv")) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload a CSV file." },
                { status: 400 }
            );
        }

        const csvContent = await file.text();

        if (!csvContent.trim()) {
            return NextResponse.json(
                { error: "CSV file is empty." },
                { status: 400 }
            );
        }

        // Parse CSV
        let parsedReviews;
        try {
            parsedReviews = parseCSV(csvContent);
        } catch (err) {
            return NextResponse.json(
                {
                    error:
                        err instanceof Error
                            ? err.message
                            : "Failed to parse CSV. Check the format.",
                },
                { status: 400 }
            );
        }

        // Append mode: add reviews to existing dataset
        if (existingDatasetId) {
            const dataset = await prisma.dataset.findUnique({
                where: { id: existingDatasetId },
            });

            if (!dataset) {
                return NextResponse.json(
                    { error: "Dataset not found." },
                    { status: 404 }
                );
            }

            // Clear old analysis results (respect FK constraints — order matters)
            await prisma.actionItem.deleteMany({ where: { datasetId: existingDatasetId } });
            await prisma.insightTheme.deleteMany({ where: { datasetId: existingDatasetId } });
            await prisma.claim.deleteMany({ where: { datasetId: existingDatasetId } });
            await prisma.competitor.deleteMany({ where: { datasetId: existingDatasetId } });

            // Reset dataset status
            await prisma.dataset.update({
                where: { id: existingDatasetId },
                data: { status: "parsing", errorMsg: null },
            });

            // Add new reviews
            await prisma.review.createMany({
                data: parsedReviews.map((review) => ({
                    datasetId: existingDatasetId,
                    reviewText: review.reviewText,
                    rating: review.rating,
                    reviewDate: review.reviewDate,
                    platform: review.platform,
                    reviewerName: review.reviewerName,
                    reviewerRole: review.reviewerRole,
                    productName: review.productName,
                    reviewUrl: review.reviewUrl,
                })),
            });

            // Get total review count (old + new)
            const totalCount = await prisma.review.count({
                where: { datasetId: existingDatasetId },
            });

            return NextResponse.json({
                datasetId: existingDatasetId,
                reviewCount: totalCount,
                isAppend: true,
                status: "parsing",
            });
        }

        // New dataset mode
        const dataset = await prisma.dataset.create({
            data: {
                name: file.name,
                status: "parsing",
            },
        });

        // Store reviews in database (bulk insert)
        await prisma.review.createMany({
            data: parsedReviews.map((review) => ({
                datasetId: dataset.id,
                reviewText: review.reviewText,
                rating: review.rating,
                reviewDate: review.reviewDate,
                platform: review.platform,
                reviewerName: review.reviewerName,
                reviewerRole: review.reviewerRole,
                productName: review.productName,
                reviewUrl: review.reviewUrl,
            })),
        });

        return NextResponse.json({
            datasetId: dataset.id,
            reviewCount: parsedReviews.length,
            status: "parsing",
        });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error ? err.message : "An unexpected error occurred.",
            },
            { status: 500 }
        );
    }
}
