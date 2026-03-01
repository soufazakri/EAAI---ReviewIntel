import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { datasetId, format = "pdf" } = body;

        if (!datasetId) {
            return NextResponse.json(
                { error: "Missing datasetId." },
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

        const insights = await prisma.insightTheme.findMany({
            where: { datasetId },
            include: {
                sourceQuotes: {
                    include: { review: true, claim: true },
                },
            },
        });

        const competitors = await prisma.competitor.findMany({
            where: { datasetId },
        });

        const actionItems = await prisma.actionItem.findMany({
            where: { datasetId },
        });

        if (format === "csv") {
            return generateCSVExport(insights, competitors, actionItems);
        }

        return generatePDFExport(insights, competitors, actionItems, dataset.name);
    } catch (err) {
        console.error("Export error:", err);
        return NextResponse.json(
            { error: "Failed to generate export." },
            { status: 500 }
        );
    }
}

function generatePDFExport(
    insights: Array<{
        title: string;
        description: string;
        category: string;
        impact: string;
        confidenceScore: number;
        sourceQuotes: Array<{
            claim: { quoteText: string; claimText: string };
            review: {
                reviewDate: string;
                platform: string;
                rating: number;
                reviewerName: string;
                productName: string;
            };
        }>;
    }>,
    competitors: Array<{
        name: string;
        mentionCount: number;
        avgSentiment: number;
        complaintThemes: string;
        praiseThemes: string;
    }>,
    actionItems: Array<{
        title: string;
        description: string;
        priority: string;
        status: string;
    }>,
    datasetName: string
): NextResponse {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    const addPage = () => {
        doc.addPage();
        y = 20;
    };

    const checkPage = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
            addPage();
        }
    };

    // Title
    doc.setFontSize(20);
    doc.text("ReviewIntel Competitive Battlecard", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated from: ${datasetName}`, margin, y);
    y += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 12;
    doc.setTextColor(0);

    // Competitors Summary
    doc.setFontSize(14);
    doc.text("Competitors Analyzed", margin, y);
    y += 8;

    doc.setFontSize(9);
    for (const comp of competitors) {
        checkPage(15);
        const sentiment = comp.avgSentiment > 0.3 ? "Positive" : comp.avgSentiment < -0.3 ? "Negative" : "Mixed";
        doc.text(
            `• ${comp.name} — ${comp.mentionCount} mentions, ${sentiment} sentiment`,
            margin + 4,
            y
        );
        y += 5;
    }
    y += 8;

    // Insights
    checkPage(20);
    doc.setFontSize(14);
    doc.text("Key Insights", margin, y);
    y += 8;

    for (const insight of insights) {
        checkPage(40);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const confidenceLabel =
            insight.sourceQuotes.length >= 5
                ? "High"
                : insight.sourceQuotes.length >= 2
                    ? "Medium"
                    : "Low";
        doc.text(
            `${insight.title} [${confidenceLabel} Confidence — ${insight.sourceQuotes.length} sources]`,
            margin,
            y
        );
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(insight.description, contentWidth - 8);
        doc.text(descLines, margin + 4, y);
        y += descLines.length * 4 + 4;

        // Source quotes
        if (insight.sourceQuotes.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(80);
            doc.text("Sources:", margin + 4, y);
            y += 4;

            for (const sq of insight.sourceQuotes.slice(0, 3)) {
                checkPage(15);
                const quoteLines = doc.splitTextToSize(
                    `"${sq.claim.quoteText}" — ${sq.review.productName}, ${sq.review.platform}, ${sq.review.rating}★, ${sq.review.reviewDate}`,
                    contentWidth - 16
                );
                doc.text(quoteLines, margin + 8, y);
                y += quoteLines.length * 3.5 + 2;
            }
            doc.setTextColor(0);
        }

        y += 6;
    }

    // Action Items
    checkPage(20);
    doc.setFontSize(14);
    doc.text("Action Items", margin, y);
    y += 8;

    for (const item of actionItems) {
        checkPage(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`[${item.priority.toUpperCase()}] ${item.title}`, margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(item.description, contentWidth - 8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 4 + 6;
    }

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="reviewintel-battlecard.pdf"`,
        },
    });
}

function generateCSVExport(
    insights: Array<{
        title: string;
        description: string;
        category: string;
        impact: string;
        confidenceScore: number;
        sourceQuotes: Array<{
            claim: { quoteText: string; claimText: string };
            review: {
                reviewDate: string;
                platform: string;
                rating: number;
                reviewerName: string;
                productName: string;
            };
        }>;
    }>,
    competitors: Array<{
        name: string;
        mentionCount: number;
        avgSentiment: number;
    }>,
    actionItems: Array<{
        title: string;
        description: string;
        priority: string;
        status: string;
    }>
): NextResponse {
    const rows: string[] = [];

    // Header
    rows.push(
        "Type,Title,Description,Category,Impact,Confidence,Source Quote,Source Platform,Source Rating,Source Date,Source Product"
    );

    // Insights with source quotes
    for (const insight of insights) {
        if (insight.sourceQuotes.length === 0) {
            rows.push(
                csvRow([
                    "Insight",
                    insight.title,
                    insight.description,
                    insight.category,
                    insight.impact,
                    String(insight.confidenceScore),
                    "",
                    "",
                    "",
                    "",
                    "",
                ])
            );
        } else {
            for (const sq of insight.sourceQuotes) {
                rows.push(
                    csvRow([
                        "Insight",
                        insight.title,
                        insight.description,
                        insight.category,
                        insight.impact,
                        String(insight.confidenceScore),
                        sq.claim.quoteText,
                        sq.review.platform,
                        String(sq.review.rating),
                        sq.review.reviewDate,
                        sq.review.productName,
                    ])
                );
            }
        }
    }

    // Competitors
    for (const comp of competitors) {
        rows.push(
            csvRow([
                "Competitor",
                comp.name,
                `${comp.mentionCount} mentions`,
                "",
                "",
                String(comp.avgSentiment),
                "",
                "",
                "",
                "",
                "",
            ])
        );
    }

    // Action Items
    for (const item of actionItems) {
        rows.push(
            csvRow([
                "Action Item",
                item.title,
                item.description,
                "",
                item.priority,
                "",
                "",
                "",
                "",
                "",
                "",
            ])
        );
    }

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="reviewintel-export.csv"`,
        },
    });
}

function csvRow(fields: string[]): string {
    return fields.map((f) => `"${(f || "").replace(/"/g, '""')}"`).join(",");
}
