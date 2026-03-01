import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/evidence-engine";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

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

        // Create dataset
        const dataset = await prisma.dataset.create({
            data: {
                name: file.name,
                status: "parsing",
            },
        });

        // Store reviews in database
        for (const review of parsedReviews) {
            await prisma.review.create({
                data: {
                    datasetId: dataset.id,
                    reviewText: review.reviewText,
                    rating: review.rating,
                    reviewDate: review.reviewDate,
                    platform: review.platform,
                    reviewerName: review.reviewerName,
                    reviewerRole: review.reviewerRole,
                    productName: review.productName,
                    reviewUrl: review.reviewUrl,
                },
            });
        }

        // Update status
        await prisma.dataset.update({
            where: { id: dataset.id },
            data: { status: "parsing" },
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
