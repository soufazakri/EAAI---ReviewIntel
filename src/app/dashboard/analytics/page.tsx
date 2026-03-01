"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
} from "recharts";

const COLORS = [
    "hsl(221, 83%, 53%)",
    "hsl(142, 71%, 45%)",
    "hsl(0, 84%, 60%)",
    "hsl(38, 92%, 50%)",
    "hsl(262, 83%, 58%)",
    "hsl(175, 80%, 40%)",
];

export default function AnalyticsPage() {
    const { competitors, insights, reviewCount, analysisStatus } =
        useAppStore();

    const hasData = analysisStatus === "complete" && competitors.length > 0;

    // Competitor mention distribution
    const mentionData = useMemo(() => {
        return competitors.map((c) => ({
            name: c.name,
            mentions: c.mentionCount,
        }));
    }, [competitors]);

    // Sentiment distribution
    const sentimentData = useMemo(() => {
        const positive = competitors.filter((c) => c.avgSentiment > 0.3).length;
        const mixed = competitors.filter(
            (c) => c.avgSentiment >= -0.3 && c.avgSentiment <= 0.3
        ).length;
        const negative = competitors.filter((c) => c.avgSentiment < -0.3).length;
        return [
            { name: "Positive", value: positive, color: "hsl(142, 71%, 45%)" },
            { name: "Mixed", value: mixed, color: "hsl(38, 92%, 50%)" },
            { name: "Negative", value: negative, color: "hsl(0, 84%, 60%)" },
        ].filter((d) => d.value > 0);
    }, [competitors]);

    // Insight category distribution
    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {};
        for (const ins of insights) {
            const label =
                ins.category === "feature_gap"
                    ? "Feature Gap"
                    : ins.category === "churn_driver"
                        ? "Churn Driver"
                        : ins.category === "product_strength"
                            ? "Product Strength"
                            : "Pricing Concern";
            cats[label] = (cats[label] ?? 0) + 1;
        }
        return Object.entries(cats).map(([name, count]) => ({ name, count }));
    }, [insights]);

    // Competitor sentiment comparison
    const sentimentCompare = useMemo(() => {
        return competitors.map((c) => ({
            name: c.name,
            sentiment: Number((c.avgSentiment * 100).toFixed(0)),
        }));
    }, [competitors]);

    if (!hasData) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">
                        Upload and analyze reviews to see analytics.
                    </p>
                </div>
                <div className="flex items-center justify-center rounded-xl border border-dashed py-16">
                    <p className="text-muted-foreground">
                        No data available. Complete an analysis first.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">
                    Visual breakdown of {reviewCount} reviews across{" "}
                    {competitors.length} competitors.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Competitor Mentions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Competitor Mention Volume
                        </CardTitle>
                        <CardDescription>
                            Number of reviews per competitor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={mentionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
                                    {mentionData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sentiment Distribution</CardTitle>
                        <CardDescription>
                            Overall sentiment across competitors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={sentimentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, value }) => `${name} (${value})`}
                                    labelLine={false}
                                    dataKey="value"
                                >
                                    {sentimentData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Insight Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Insight Categories</CardTitle>
                        <CardDescription>
                            Distribution of generated insights by type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sentiment Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sentiment Comparison</CardTitle>
                        <CardDescription>
                            Sentiment score by competitor (-100 to +100)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sentimentCompare}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    domain={[-100, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sentiment"
                                    stroke={COLORS[0]}
                                    strokeWidth={2}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
