/**
 * LLM Prompt Templates for ReviewIntel Evidence Engine
 * Used by GPT-4o-mini (extraction) and GPT-4o (synthesis)
 */

export interface ReviewForExtraction {
    id: string;
    reviewText: string;
    rating: number;
    platform: string;
    productName: string;
    reviewDate: string;
}

export interface ClaimForSynthesis {
    claimText: string;
    category: string;
    quoteText: string;
    confidence: string;
    reviewId: string;
    platform: string;
    rating: number;
    reviewDate: string;
    productName: string;
}

export interface ClaimCluster {
    theme: string;
    claims: ClaimForSynthesis[];
}

export function getExtractionSystemPrompt(): string {
    return `You are a competitive intelligence analyst specializing in HR Tech SaaS. Extract structured insights from product reviews.

For each claim you find (feature request, complaint, praise, or churn signal), output a JSON object with:
1. "claimText": A short, clear summary of the claim (1-2 sentences)
2. "category": One of "feature_request", "complaint", "praise", or "churn_signal"
3. "quoteText": The exact quote from the review supporting this claim (copy verbatim)
4. "confidence": "high" if the claim is explicit and clear, "medium" if implied, "low" if ambiguous
5. "competitorMentions": An array of competitor product names mentioned in the context of this claim (empty array if none)

Rules:
- Only extract claims explicitly stated or strongly implied in the review text
- Each claim must have a direct supporting quote from the review
- A single review may contain multiple claims
- Do NOT fabricate or infer claims beyond what the review states
- Focus on actionable intelligence: feature gaps, pain points, competitive comparisons, churn risks

Return a JSON array of claim objects. If no claims can be extracted, return an empty array [].`;
}

export function getExtractionUserPrompt(reviews: ReviewForExtraction[]): string {
    const reviewsText = reviews
        .map(
            (r, i) =>
                `--- Review ${i + 1} (ID: ${r.id}) ---
Product: ${r.productName}
Platform: ${r.platform}
Rating: ${r.rating}/5
Date: ${r.reviewDate}
Text: ${r.reviewText}`
        )
        .join("\n\n");

    return `Extract structured claims from these ${reviews.length} product reviews:\n\n${reviewsText}\n\nFor each claim, include the review ID in a "reviewId" field. Return a JSON array.`;
}

export function getSynthesisSystemPrompt(): string {
    return `You are synthesizing competitive intelligence from multiple HR Tech product reviews. Given clusters of related claims about product gaps, strengths, or concerns, generate actionable insights.

For each insight, output a JSON object with:
1. "title": A short, punchy insight title (5-10 words)
2. "description": A 2-3 sentence description explaining the insight and its business implications
3. "category": One of "feature_gap", "churn_driver", "product_strength", "pricing_concern"
4. "impact": "high" if affects >30% of reviews, "medium" if 10-30%, "low" if <10%
5. "supportingClaimIds": Array of claim indices (0-based) from the input that support this insight
6. "affectedCompetitors": Array of competitor names this insight relates to
7. "suggestedAction": A specific, actionable recommendation (1-2 sentences)

Rules:
- Be concise and ground all claims in the provided quotes
- Only generate insights supported by at least 2 claims
- Prioritize insights that reveal competitive advantages or vulnerabilities
- Group related claims into single insights rather than creating duplicate insights

Return a JSON array of insight objects.`;
}

export function getSynthesisUserPrompt(clusters: ClaimCluster[]): string {
    const clustersText = clusters
        .map(
            (c, i) =>
                `--- Cluster ${i + 1}: "${c.theme}" (${c.claims.length} claims) ---\n` +
                c.claims
                    .map(
                        (claim, j) =>
                            `  [${j}] ${claim.claimText}\n      Quote: "${claim.quoteText}"\n      Product: ${claim.productName} | Platform: ${claim.platform} | Rating: ${claim.rating}/5`
                    )
                    .join("\n")
        )
        .join("\n\n");

    return `Synthesize these ${clusters.length} claim clusters into actionable competitive insights:\n\n${clustersText}\n\nReturn a JSON array of insight objects.`;
}

export function getBattlecardSystemPrompt(): string {
    return `You are generating competitive battlecards for an HR Tech SaaS company. Given synthesized insights with supporting evidence, create action items that a Product Marketing Manager can execute.

For each action item, output a JSON object with:
1. "title": Action item title (clear, specific, 5-10 words)
2. "description": Detailed description of what to do and why (2-3 sentences)
3. "priority": "high", "medium", or "low" based on impact and urgency
4. "relatedInsightTitle": The insight title this action item addresses

Rules:
- Make actions specific and executable (not vague)
- Tie each action to specific evidence from the insights
- Prioritize actions that exploit competitor weaknesses backed by strong evidence

Return a JSON array of action item objects.`;
}

export function getBattlecardUserPrompt(
    insights: Array<{
        title: string;
        description: string;
        category: string;
        impact: string;
        supportingQuoteCount: number;
    }>
): string {
    const insightsText = insights
        .map(
            (ins, i) =>
                `[${i + 1}] ${ins.title} (${ins.category}, ${ins.impact} impact, ${ins.supportingQuoteCount} supporting reviews)\n    ${ins.description}`
        )
        .join("\n");

    return `Generate actionable battlecard items from these insights:\n\n${insightsText}\n\nReturn a JSON array.`;
}

export function getCompetitorExtractionSystemPrompt(): string {
    return `You are analyzing HR Tech product reviews to identify competitors and sentiment. Given a batch of product review data, extract:

For each unique product/competitor found, output a JSON object with:
1. "name": The product/competitor name
2. "mentionCount": How many reviews mention this product
3. "avgSentiment": Average sentiment score from -1 (very negative) to 1 (very positive)
4. "complaintThemes": Array of top complaint themes (strings, max 5)
5. "praiseThemes": Array of top praise themes (strings, max 5)

Rules:
- Group mentions of the same product (e.g., "BambooHR" and "Bamboo HR" should be one entry)
- Sentiment should be derived from the review text and rating
- Only include products that appear in at least 1 review

Return a JSON array of competitor objects.`;
}

export function getCompetitorExtractionUserPrompt(
    reviews: Array<{ productName: string; reviewText: string; rating: number }>
): string {
    const reviewsText = reviews
        .map(
            (r, i) =>
                `[${i + 1}] Product: ${r.productName} | Rating: ${r.rating}/5\n    ${r.reviewText.substring(0, 300)}`
        )
        .join("\n");

    return `Analyze these reviews and extract competitor information:\n\n${reviewsText}\n\nReturn a JSON array of competitor objects.`;
}
