import { NextResponse } from "next/server";

export async function GET() {
    const geminiKey = process.env.GEMINI_API_KEY;
    return NextResponse.json({
        geminiKeyConfigured: !!geminiKey && geminiKey.length >= 10,
    });
}
