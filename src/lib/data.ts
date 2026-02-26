export interface Competitor {
  name: string;
  initials: string;
  rating: number;
  reviews: number;
  url: string;
  sentiment: "positive" | "mixed" | "negative";
  trend: "up" | "down" | "neutral";
  topStrength: string;
  topWeakness: string;
}

export type Strategy =
  | "exploit_weakness"
  | "outpace_strength"
  | "differentiate"
  | "counter_position";

export interface ActionItem {
  id: string;
  title: string;
  insight: string;
  action: string;
  impact: string;
  strategy: Strategy;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  source: string;
  competitorName: string;
  reviewsAnalyzed: number;
  confidencePercent: number;
}

export interface Industry {
  id: string;
  label: string;
  icon: string;
}

export const industries: Industry[] = [
  { id: "restaurant", label: "Restaurants & Food", icon: "🍽️" },
  { id: "tech", label: "Technology & SaaS", icon: "💻" },
  { id: "retail", label: "Retail & E-commerce", icon: "🛍️" },
  { id: "hospitality", label: "Hotels & Hospitality", icon: "🏨" },
  { id: "health", label: "Health & Wellness", icon: "🏥" },
  { id: "finance", label: "Finance & Banking", icon: "🏦" },
  { id: "education", label: "Education & EdTech", icon: "📚" },
  { id: "automotive", label: "Automotive", icon: "🚗" },
];

export const competitorsByIndustry: Record<string, Competitor[]> = {
  restaurant: [
    { name: "FreshBite", initials: "FB", rating: 4.3, reviews: 2841, url: "freshbite.com", sentiment: "positive", trend: "up", topStrength: "Fast delivery", topWeakness: "Portion sizes" },
    { name: "QuickPlate", initials: "QP", rating: 4.1, reviews: 1923, url: "quickplate.com", sentiment: "mixed", trend: "down", topStrength: "Menu variety", topWeakness: "Customer support" },
    { name: "GreenFork", initials: "GF", rating: 4.6, reviews: 3102, url: "greenfork.co", sentiment: "positive", trend: "up", topStrength: "Organic ingredients", topWeakness: "Pricing" },
    { name: "UrbanEats", initials: "UE", rating: 3.9, reviews: 1456, url: "urbaneats.com", sentiment: "negative", trend: "down", topStrength: "Late-night hours", topWeakness: "Food quality" },
  ],
  tech: [
    { name: "CloudSync Pro", initials: "CS", rating: 4.5, reviews: 5230, url: "cloudsyncpro.io", sentiment: "positive", trend: "up", topStrength: "99.9% uptime", topWeakness: "Complex onboarding" },
    { name: "DataFlow", initials: "DF", rating: 4.2, reviews: 3812, url: "dataflow.dev", sentiment: "mixed", trend: "neutral", topStrength: "API flexibility", topWeakness: "Documentation gaps" },
    { name: "NexaTool", initials: "NT", rating: 4.0, reviews: 2190, url: "nexatool.com", sentiment: "mixed", trend: "down", topStrength: "Affordable pricing", topWeakness: "Feature limitations" },
    { name: "StackPilot", initials: "SP", rating: 4.4, reviews: 4105, url: "stackpilot.io", sentiment: "positive", trend: "up", topStrength: "Developer experience", topWeakness: "Enterprise pricing" },
  ],
  retail: [
    { name: "ShopNova", initials: "SN", rating: 4.1, reviews: 8920, url: "shopnova.com", sentiment: "mixed", trend: "up", topStrength: "Product selection", topWeakness: "Shipping speed" },
    { name: "CartWise", initials: "CW", rating: 3.8, reviews: 4560, url: "cartwise.co", sentiment: "negative", trend: "down", topStrength: "Discount programs", topWeakness: "Return process" },
    { name: "BuyBetter", initials: "BB", rating: 4.3, reviews: 6780, url: "buybetter.com", sentiment: "positive", trend: "up", topStrength: "Customer service", topWeakness: "Mobile app UX" },
    { name: "TrendMart", initials: "TM", rating: 4.0, reviews: 5340, url: "trendmart.shop", sentiment: "mixed", trend: "neutral", topStrength: "Trend curation", topWeakness: "Stock availability" },
  ],
  hospitality: [
    { name: "StayEase", initials: "SE", rating: 4.4, reviews: 12300, url: "stayease.com", sentiment: "positive", trend: "up", topStrength: "Seamless booking", topWeakness: "Cancellation policy" },
    { name: "LuxRooms", initials: "LR", rating: 4.7, reviews: 8750, url: "luxrooms.com", sentiment: "positive", trend: "up", topStrength: "Room quality", topWeakness: "Price premium" },
    { name: "WanderInn", initials: "WI", rating: 4.1, reviews: 6200, url: "wanderinn.co", sentiment: "mixed", trend: "neutral", topStrength: "Unique locations", topWeakness: "Inconsistent wifi" },
    { name: "CozyStay", initials: "CZ", rating: 4.2, reviews: 9100, url: "cozystay.com", sentiment: "mixed", trend: "down", topStrength: "Loyalty program", topWeakness: "Check-in process" },
  ],
  health: [
    { name: "VitaCare", initials: "VC", rating: 4.3, reviews: 3400, url: "vitacare.com", sentiment: "positive", trend: "up", topStrength: "Holistic approach", topWeakness: "Wait times" },
    { name: "MedPulse", initials: "MP", rating: 4.0, reviews: 2100, url: "medpulse.io", sentiment: "mixed", trend: "neutral", topStrength: "Telehealth access", topWeakness: "Insurance coverage" },
    { name: "WellPath", initials: "WP", rating: 4.5, reviews: 4200, url: "wellpath.co", sentiment: "positive", trend: "up", topStrength: "Personalized plans", topWeakness: "App complexity" },
    { name: "HealthHub", initials: "HH", rating: 4.1, reviews: 3800, url: "healthhub.com", sentiment: "mixed", trend: "down", topStrength: "Affordable plans", topWeakness: "Limited specialists" },
  ],
  finance: [
    { name: "FinEdge", initials: "FE", rating: 4.2, reviews: 6700, url: "finedge.com", sentiment: "positive", trend: "up", topStrength: "Low fees", topWeakness: "Complex interface" },
    { name: "WealthStack", initials: "WS", rating: 4.4, reviews: 5100, url: "wealthstack.io", sentiment: "positive", trend: "up", topStrength: "Robo-advisor", topWeakness: "Minimum deposit" },
    { name: "CashFlow+", initials: "CF", rating: 3.9, reviews: 4300, url: "cashflowplus.com", sentiment: "mixed", trend: "down", topStrength: "Cash back rewards", topWeakness: "Transfer speed" },
    { name: "BankSmart", initials: "BS", rating: 4.0, reviews: 7200, url: "banksmart.co", sentiment: "mixed", trend: "neutral", topStrength: "Mobile banking", topWeakness: "Customer support" },
  ],
  education: [
    { name: "LearnPeak", initials: "LP", rating: 4.5, reviews: 4800, url: "learnpeak.com", sentiment: "positive", trend: "up", topStrength: "Course quality", topWeakness: "Certificate value" },
    { name: "EduVerse", initials: "EV", rating: 4.3, reviews: 3600, url: "eduverse.io", sentiment: "positive", trend: "up", topStrength: "Interactive content", topWeakness: "Pricing tiers" },
    { name: "SkillForge", initials: "SF", rating: 4.1, reviews: 5200, url: "skillforge.com", sentiment: "mixed", trend: "neutral", topStrength: "Hands-on labs", topWeakness: "Outdated curriculum" },
    { name: "ClassUp", initials: "CU", rating: 4.2, reviews: 2900, url: "classup.co", sentiment: "mixed", trend: "down", topStrength: "Live sessions", topWeakness: "Scheduling rigidity" },
  ],
  automotive: [
    { name: "AutoPrime", initials: "AP", rating: 4.1, reviews: 3200, url: "autoprime.com", sentiment: "mixed", trend: "up", topStrength: "Inventory size", topWeakness: "Financing terms" },
    { name: "DriveMax", initials: "DM", rating: 4.3, reviews: 4600, url: "drivemax.co", sentiment: "positive", trend: "up", topStrength: "Test drive experience", topWeakness: "Service wait times" },
    { name: "MotorElite", initials: "ME", rating: 3.9, reviews: 2800, url: "motorelite.com", sentiment: "negative", trend: "down", topStrength: "Premium brands", topWeakness: "Price transparency" },
    { name: "CarSphere", initials: "CS", rating: 4.0, reviews: 3900, url: "carsphere.io", sentiment: "mixed", trend: "neutral", topStrength: "Online configurator", topWeakness: "Delivery delays" },
  ],
};

export const actionItemsByIndustry: Record<string, ActionItem[]> = {
  restaurant: [
    {
      id: "r1", competitorName: "FreshBite", source: "2,841 FreshBite reviews", reviewsAnalyzed: 2841, confidencePercent: 91, strategy: "exploit_weakness", priority: "high", status: "todo",
      title: "Capture market share with larger portions",
      insight: "Across 2,841 FreshBite reviews, \"portion size\" appears in 34% of negative mentions. Despite their 4.3 rating, customers are actively seeking alternatives that offer better value per dollar. FreshBite's average order value is high, but repeat order rate dropped 12% last quarter.",
      action: "Launch a \"Generous Plates\" campaign emphasizing our larger portions. Introduce a side-by-side value comparison on our ordering page. Target FreshBite's dissatisfied customers through social ads referencing portion value.",
      impact: "Projected to capture 8-12% of FreshBite's dissatisfied customer base, translating to ~340 new monthly orders.",
    },
    {
      id: "r2", competitorName: "FreshBite", source: "2,841 FreshBite reviews", reviewsAnalyzed: 2841, confidencePercent: 94, strategy: "outpace_strength", priority: "high", status: "in_progress",
      title: "Beat FreshBite's delivery speed advantage",
      insight: "FreshBite's delivery speed is mentioned positively in 47% of their 5-star reviews — it's the #1 driver of their rating growth. Their average delivery time is ~28 minutes. However, reviews from the last 90 days show delivery times creeping up to 33 minutes as they scale.",
      action: "Partner with a second delivery fleet to guarantee sub-25-minute delivery. Introduce a real-time tracking experience and a \"delivered late, next one free\" guarantee to build trust and outpace their slowing delivery performance.",
      impact: "Closing the delivery gap neutralizes their strongest differentiator and positions us as the faster, more reliable option as they struggle to scale.",
    },
    {
      id: "r3", competitorName: "GreenFork", source: "3,102 GreenFork reviews", reviewsAnalyzed: 3102, confidencePercent: 87, strategy: "counter_position", priority: "high", status: "todo",
      title: "Undercut GreenFork's organic premium with accessible pricing",
      insight: "GreenFork's 4.6 rating is driven by ingredient quality, but their pricing is their #1 weakness — 41% of 3-star reviews cite \"too expensive\" or \"not worth the price.\" They charge a 30-40% premium over competitors. Their customer base skews affluent, leaving the mid-market underserved.",
      action: "Introduce an \"Organic Essentials\" menu line with locally sourced ingredients at 15-20% below GreenFork's prices. Market it as \"premium ingredients without the premium markup\" to capture price-conscious health-focused diners.",
      impact: "Opens a new mid-market segment that GreenFork's pricing model structurally cannot serve. Estimated 15-20% revenue uplift in the health-conscious segment.",
    },
    {
      id: "r4", competitorName: "QuickPlate", source: "1,923 QuickPlate reviews", reviewsAnalyzed: 1923, confidencePercent: 89, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Win QuickPlate's churning customers with superior support",
      insight: "QuickPlate's rating is trending down (4.1 and falling) and \"customer support\" is the dominant theme in their 1-star reviews (62% mention it). Their response time averages 4+ hours, and refund disputes are a recurring pain point. This is actively driving customer churn.",
      action: "Launch a \"Switch to Us\" campaign targeting QuickPlate customers on social media. Offer a first-order bonus and guarantee 15-minute support response times. Build a frictionless onboarding flow specifically for customers migrating from competitor apps.",
      impact: "QuickPlate's declining trend makes their customer base vulnerable. Targeting their churning users is the lowest-cost acquisition channel available — estimated CAC 60% lower than cold acquisition.",
    },
    {
      id: "r5", competitorName: "UrbanEats", source: "1,456 UrbanEats reviews", reviewsAnalyzed: 1456, confidencePercent: 82, strategy: "differentiate", priority: "medium", status: "in_progress",
      title: "Own the late-night market with quality UrbanEats can't match",
      insight: "UrbanEats is the only competitor operating after 11 PM, but their food quality is rated 2.1/5 for late-night orders. 73% of their negative reviews cite cold food, limited menu after hours, or long waits. There's clear demand (1,456 reviews despite a 3.9 rating) but the experience is poor.",
      action: "Extend hours to 2 AM with a curated late-night menu optimized for speed and quality. Use dedicated kitchen staff for the late shift to avoid the quality drop UrbanEats suffers from. Run geo-targeted ads between 10 PM and 1 AM.",
      impact: "Captures an underserved time slot with zero quality competition. Late-night orders typically carry higher margins due to lower delivery density competition.",
    },
    {
      id: "r6", competitorName: "QuickPlate", source: "1,923 QuickPlate reviews", reviewsAnalyzed: 1923, confidencePercent: 85, strategy: "outpace_strength", priority: "low", status: "done",
      title: "Surpass QuickPlate's menu variety with AI-powered recommendations",
      insight: "QuickPlate's menu variety is their top strength — 38% of positive reviews mention selection breadth. However, analysis shows customers are overwhelmed: \"too many choices\" appears in 15% of neutral reviews, and average order time is 40% longer than industry standard.",
      action: "Instead of matching their breadth, add a smart recommendation engine that learns preferences and surfaces personalized picks. Offer curated \"Chef's Picks\" and seasonal rotations to create variety without decision fatigue.",
      impact: "Reframes the competitive narrative from \"who has more options\" to \"who understands what you actually want\" — a harder advantage to replicate.",
    },
  ],
  tech: [
    {
      id: "t1", competitorName: "CloudSync Pro", source: "5,230 CloudSync Pro reviews", reviewsAnalyzed: 5230, confidencePercent: 93, strategy: "exploit_weakness", priority: "high", status: "in_progress",
      title: "Steal CloudSync Pro's signups with frictionless onboarding",
      insight: "CloudSync Pro dominates on uptime (99.9%) but 28% of their 1-2 star reviews cite onboarding complexity. Their setup process takes an average of 3.2 hours, and 22% of trial users never complete configuration. This is a leak in their funnel that they haven't addressed in 18+ months.",
      action: "Build a one-click setup wizard that auto-detects infrastructure and pre-configures connections. Offer a \"Migrate from CloudSync\" tool that imports existing configurations. Target their trial dropoffs with ads highlighting our 5-minute setup.",
      impact: "CloudSync Pro's trial-to-paid conversion leak represents ~1,150 lost customers/quarter. Capturing even 10% of those dropoffs adds significant ARR with near-zero acquisition cost.",
    },
    {
      id: "t2", competitorName: "DataFlow", source: "3,812 DataFlow reviews", reviewsAnalyzed: 3812, confidencePercent: 88, strategy: "exploit_weakness", priority: "high", status: "todo",
      title: "Dominate developer trust with documentation DataFlow can't match",
      insight: "DataFlow's API flexibility is praised, but documentation gaps are their Achilles heel — mentioned in 31% of negative reviews. Developers report spending 2-3x expected time on integration due to missing examples and outdated guides. Their GitHub issues show 400+ open documentation requests.",
      action: "Invest in auto-generated, versioned API docs with runnable code examples in every major language. Launch a developer community forum with official support. Publish a \"DataFlow to Us\" migration guide with side-by-side API comparisons.",
      impact: "Developer trust compounds — strong docs drive organic adoption through word-of-mouth. This is the #1 factor in developer tool switching decisions and the hardest for DataFlow to retroactively fix.",
    },
    {
      id: "t3", competitorName: "NexaTool", source: "2,190 NexaTool reviews", reviewsAnalyzed: 2190, confidencePercent: 86, strategy: "counter_position", priority: "medium", status: "todo",
      title: "Trap NexaTool in the low-end with a superior mid-tier offering",
      insight: "NexaTool wins on price (their top-mentioned positive), but feature limitations are driving churn among growing teams — 45% of cancellations cite outgrowing the platform. Their pricing model structurally prevents them from adding enterprise features without alienating their budget-focused base.",
      action: "Launch a mid-tier plan priced 20% above NexaTool but with features they can't offer: SSO, team permissions, and audit logs. Target NexaTool customers who've hit growth ceilings with \"You've outgrown your tools\" messaging.",
      impact: "Positions NexaTool as the \"starter tool\" while we own the growth segment. Their pricing trap means they can't respond without cannibalizing their core value proposition.",
    },
    {
      id: "t4", competitorName: "StackPilot", source: "4,105 StackPilot reviews", reviewsAnalyzed: 4105, confidencePercent: 90, strategy: "outpace_strength", priority: "high", status: "todo",
      title: "Outbuild StackPilot's developer experience with open-source tooling",
      insight: "StackPilot's DX is their moat — 52% of 5-star reviews praise their CLI and SDK. But their tools are closed-source, locking developers into their ecosystem. Recent reviews show growing frustration with vendor lock-in, especially among teams adopting multi-cloud strategies.",
      action: "Open-source our CLI and SDK, invest in plugins for major IDEs, and build a StackPilot compatibility layer for painless migration. Sponsor developer meetups and OSS projects to build community credibility.",
      impact: "Open-source DX tools create network effects StackPilot's closed model can't match. Developer communities rally around open tools, making this a compounding advantage over 12-24 months.",
    },
    {
      id: "t5", competitorName: "StackPilot", source: "4,105 StackPilot reviews", reviewsAnalyzed: 4105, confidencePercent: 84, strategy: "exploit_weakness", priority: "medium", status: "done",
      title: "Undercut StackPilot's enterprise pricing with transparent tiers",
      insight: "StackPilot's enterprise pricing is opaque — \"contact sales\" is the only option above their Team plan. 26% of mid-market reviews complain about surprise pricing and long sales cycles. Their average enterprise deal takes 47 days to close, creating a window for competitors.",
      action: "Publish fully transparent enterprise pricing on our website. Offer self-serve enterprise sign-up with instant provisioning. Run comparison pages showing our pricing clarity vs. their \"call us\" approach.",
      impact: "Transparent pricing becomes a trust signal that accelerates deal velocity. Mid-market buyers increasingly prefer self-serve — this structural difference compounds as the market shifts.",
    },
    {
      id: "t6", competitorName: "CloudSync Pro", source: "5,230 CloudSync Pro reviews", reviewsAnalyzed: 5230, confidencePercent: 92, strategy: "outpace_strength", priority: "medium", status: "in_progress",
      title: "Match and publicize uptime SLA to neutralize CloudSync's moat",
      insight: "CloudSync Pro's 99.9% uptime is their #1 differentiator, mentioned in 39% of positive reviews. But analysis of status page history shows they've actually dipped below this twice in the last 6 months. Meanwhile, our actual uptime has been 99.95% — we just haven't marketed it.",
      action: "Publish a public status page with historical uptime data. Announce a 99.95% SLA guarantee with financial credits for breaches. Create comparison content showing our actual uptime record vs. CloudSync Pro's recent incidents.",
      impact: "Neutralizes their strongest selling point with hard data. Once uptime parity is established in buyer perception, the competition shifts to areas where we're stronger (onboarding, pricing).",
    },
  ],
  retail: [
    {
      id: "re1", competitorName: "ShopNova", source: "8,920 ShopNova reviews", reviewsAnalyzed: 8920, confidencePercent: 92, strategy: "exploit_weakness", priority: "high", status: "todo",
      title: "Win impatient shoppers with same-day delivery ShopNova can't offer",
      insight: "ShopNova has the widest product selection (their strength), but shipping speed is their critical weakness — 38% of 1-3 star reviews complain about 5-7 day delivery times. Their warehouse infrastructure is centralized, making same-day delivery structurally impossible for them without massive investment.",
      action: "Launch same-day delivery in top 10 metro areas using distributed micro-fulfillment centers. Run A/B tested ads targeting \"ShopNova slow shipping\" related search queries. Offer a \"Get it today\" badge on qualifying products.",
      impact: "Speed is the #1 purchase driver in e-commerce. ShopNova's centralized warehouse model means they can't respond quickly — this creates a 12-18 month window of competitive advantage.",
    },
    {
      id: "re2", competitorName: "CartWise", source: "4,560 CartWise reviews", reviewsAnalyzed: 4560, confidencePercent: 90, strategy: "exploit_weakness", priority: "high", status: "in_progress",
      title: "Convert CartWise defectors with hassle-free returns",
      insight: "CartWise is hemorrhaging customers over returns — 54% of their 1-star reviews mention the return process. Their policy requires forms, shipping labels, and 14-day processing. Rating is 3.8 and trending down. Their discount programs keep some customers, but loyalty is eroding fast.",
      action: "Introduce instant, no-questions-asked returns with same-day refund processing. Create a \"CartWise Customer\" landing page offering first-order free returns + 10% welcome discount. Publicize our return policy in direct comparison to theirs.",
      impact: "CartWise's structural inability to fix returns quickly (it's tied to their cost model) makes their customer base permanently vulnerable. Each converted customer also brings high LTV since return-sensitive shoppers are typically high-frequency buyers.",
    },
    {
      id: "re3", competitorName: "BuyBetter", source: "6,780 BuyBetter reviews", reviewsAnalyzed: 6780, confidencePercent: 87, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Outperform BuyBetter on mobile where they're weakest",
      insight: "BuyBetter leads on customer service (4.3 rating, trending up), but their mobile app is rated 2.8 stars on app stores. 42% of negative reviews cite crashes, slow loading, and a checkout flow that requires 7 taps. Mobile accounts for 68% of e-commerce traffic — this gap is massive.",
      action: "Invest in a best-in-class mobile experience: 2-tap checkout, biometric payment, real-time order tracking. Benchmark every flow against the best apps in any industry (not just retail). Run mobile-specific retargeting ads.",
      impact: "Mobile is where the market is going. BuyBetter's desktop-first architecture makes this a multi-year rebuild for them. A superior mobile experience becomes our primary acquisition channel.",
    },
    {
      id: "re4", competitorName: "TrendMart", source: "5,340 TrendMart reviews", reviewsAnalyzed: 5340, confidencePercent: 85, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Never go out of stock on trending items TrendMart can't keep available",
      insight: "TrendMart's trend curation drives traffic, but stock availability is their persistent failure — 47% of negative reviews mention \"out of stock\" on trending items. Their demand forecasting is reactive, not predictive. Customers discover products there but can't buy them.",
      action: "Build predictive inventory management using social trend signals and pre-order capabilities. When TrendMart is out of stock on viral products, run real-time ads: \"Looking for [product]? We have it.\" Partner with trending product suppliers on exclusivity deals.",
      impact: "Converts TrendMart's marketing spend into our sales. Every out-of-stock moment on their site is an acquisition opportunity for us — they do the trend-spotting, we capture the revenue.",
    },
    {
      id: "re5", competitorName: "BuyBetter", source: "6,780 BuyBetter reviews", reviewsAnalyzed: 6780, confidencePercent: 91, strategy: "outpace_strength", priority: "medium", status: "in_progress",
      title: "Match BuyBetter's service quality with AI-powered support at scale",
      insight: "BuyBetter's customer service is their moat — human agents with 4-minute avg response time, mentioned positively in 51% of 5-star reviews. But this model is expensive and doesn't scale. Their support costs are estimated at 3x the industry average, which is reflected in higher prices.",
      action: "Deploy AI-powered support that resolves 70% of queries instantly, with seamless handoff to human agents for complex issues. Achieve sub-2-minute resolution while keeping costs at 1/3 of BuyBetter's model. Pass the savings on as lower prices.",
      impact: "Matches their service quality at a fraction of the cost. The savings fund lower prices, creating a double advantage they can't counter without dismantling their service model.",
    },
    {
      id: "re6", competitorName: "CartWise", source: "4,560 CartWise reviews", reviewsAnalyzed: 4560, confidencePercent: 83, strategy: "outpace_strength", priority: "low", status: "done",
      title: "Build a loyalty program that outearns CartWise's discount model",
      insight: "CartWise's discount programs drive repeat purchases (their top strength), but analysis reveals diminishing returns — customers are trained to wait for sales and never pay full price. Their average margin per order has dropped 18% year-over-year. The model is unsustainable.",
      action: "Build a points-based loyalty program with experiential rewards (early access, exclusives) instead of pure discounts. Create tiered membership that increases engagement without eroding margins. Position discounts as bonuses, not the primary value prop.",
      impact: "Creates stickier retention than CartWise's discount-dependent model. Experiential loyalty programs show 2.5x higher retention than pure-discount programs and protect margin long-term.",
    },
  ],
  hospitality: [
    {
      id: "h1", competitorName: "StayEase", source: "12,300 StayEase reviews", reviewsAnalyzed: 12300, confidencePercent: 94, strategy: "outpace_strength", priority: "high", status: "in_progress",
      title: "Outbuild StayEase's booking flow with AI-powered trip planning",
      insight: "StayEase's seamless booking (2-step process) drives their 4.4 rating — 43% of 5-star reviews mention booking ease. But their flow is transactional only. Reviews show guests increasingly want personalized recommendations, local tips, and itinerary help that StayEase doesn't offer.",
      action: "Go beyond booking simplicity — build an AI concierge that suggests rooms based on travel style, recommends local experiences, and builds full itineraries. Make the booking flow not just easy, but delightful and personal.",
      impact: "Redefines the category from \"where to book\" to \"who plans the best trip.\" StayEase's strength becomes table stakes while we own the next frontier of guest experience.",
    },
    {
      id: "h2", competitorName: "LuxRooms", source: "8,750 LuxRooms reviews", reviewsAnalyzed: 8750, confidencePercent: 89, strategy: "counter_position", priority: "high", status: "todo",
      title: "Offer LuxRooms-quality stays at 30% lower price",
      insight: "LuxRooms has the highest rating (4.7) but their price premium is their achilles heel — 37% of 3-star reviews say \"amazing quality but not worth the price.\" Their brand positioning prevents them from lowering prices without diluting perceived luxury. A quality-at-fair-price gap exists.",
      action: "Invest in room quality upgrades that match LuxRooms' standards (premium bedding, amenities, design). Price 25-30% below them. Run side-by-side comparison marketing: \"Same quality, honest pricing.\" Target their price-sensitive 3-star reviewers.",
      impact: "LuxRooms can't lower prices without destroying their luxury brand. This structural constraint means they'll lose the value-conscious luxury segment permanently once a quality alternative exists.",
    },
    {
      id: "h3", competitorName: "WanderInn", source: "6,200 WanderInn reviews", reviewsAnalyzed: 6200, confidencePercent: 86, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Guarantee connectivity that WanderInn's unique locations can't",
      insight: "WanderInn differentiates on unique, remote locations — but wifi reliability appears in 52% of negative reviews. Remote workers and digital nomads (a growing segment) are choosing alternatives specifically because of this. WanderInn's locations make infrastructure upgrades structurally difficult.",
      action: "Guarantee high-speed internet at all properties with Starlink backup for remote locations. Create a \"Work From Anywhere\" package with dedicated workspaces, ergonomic setups, and guaranteed bandwidth SLAs. Target digital nomad communities.",
      impact: "Captures the fast-growing remote worker travel segment that WanderInn is losing. Reliable connectivity in unique locations is a differentiator that combines the best of both worlds.",
    },
    {
      id: "h4", competitorName: "CozyStay", source: "9,100 CozyStay reviews", reviewsAnalyzed: 9100, confidencePercent: 88, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Replace front desk friction with instant mobile check-in",
      insight: "CozyStay's check-in process frustrates 44% of reviewers who mention it. Average wait time is 12 minutes at peak hours. Despite having a loyalty program (their strength), check-in friction is the #1 reason loyal customers leave negative reviews. They've been \"working on\" mobile check-in for 2 years.",
      action: "Launch keyless mobile check-in: guests get room access via phone 2 hours before arrival. Zero front-desk interaction required. Promote this as our signature experience and a reason to switch from CozyStay.",
      impact: "Eliminates the single biggest friction point in the hotel experience. CozyStay's 2-year delay on this suggests organizational blockers — this gap will persist and widen.",
    },
    {
      id: "h5", competitorName: "StayEase", source: "12,300 StayEase reviews", reviewsAnalyzed: 12300, confidencePercent: 91, strategy: "exploit_weakness", priority: "low", status: "done",
      title: "Turn StayEase's rigid cancellation policy into our advantage",
      insight: "StayEase's cancellation policy is their most-cited weakness — 29% of negative reviews mention it. They charge 50% for cancellations within 7 days. Post-pandemic, travelers prioritize flexibility. StayEase's revenue model depends on cancellation fees, making change unlikely.",
      action: "Offer free cancellation up to 24 hours before check-in with no fees. Make this a prominent booking-page differentiator. Run campaigns during peak booking seasons when cancellation anxiety is highest.",
      impact: "Cancellation flexibility has become a primary booking decision factor. StayEase's dependency on cancellation revenue makes this a permanent competitive gap we can exploit.",
    },
    {
      id: "h6", competitorName: "CozyStay", source: "9,100 CozyStay reviews", reviewsAnalyzed: 9100, confidencePercent: 84, strategy: "outpace_strength", priority: "medium", status: "in_progress",
      title: "Build a loyalty program with experiences CozyStay's can't match",
      insight: "CozyStay's loyalty program is their top strength (mentioned in 35% of positive reviews), but it's purely points-for-discounts. Analysis shows engagement plateaus after 6 months — members stop caring once they've redeemed the obvious rewards. No experiential differentiation.",
      action: "Launch a tiered loyalty program with experiential rewards: room upgrades, local experience access, surprise amenities, and a \"loyalty concierge\" for top-tier members. Make each stay feel more personalized than the last.",
      impact: "Experiential loyalty creates emotional connection that points-based programs can't match. Higher-tier members become brand advocates, driving organic acquisition through word-of-mouth.",
    },
  ],
  health: [
    {
      id: "he1", competitorName: "VitaCare", source: "3,400 VitaCare reviews", reviewsAnalyzed: 3400, confidencePercent: 90, strategy: "exploit_weakness", priority: "high", status: "in_progress",
      title: "Capture VitaCare's frustrated patients with zero-wait scheduling",
      insight: "VitaCare's holistic approach drives their 4.3 rating, but wait times are destroying satisfaction — 48% of negative reviews mention waits exceeding 45 minutes. Their provider-to-patient ratio is 1:2,200, well above the recommended 1:1,500. They're growing patients faster than hiring providers.",
      action: "Implement AI-powered scheduling that dynamically adjusts appointment slots based on visit complexity. Offer guaranteed \"seen within 10 minutes of appointment time\" with a credit for breaches. Target VitaCare patients in areas with the longest reported wait times.",
      impact: "Wait times are the #1 driver of healthcare provider switching. VitaCare's growth-vs-hiring gap means this problem will worsen, creating a steady stream of available patients.",
    },
    {
      id: "he2", competitorName: "MedPulse", source: "2,100 MedPulse reviews", reviewsAnalyzed: 2100, confidencePercent: 85, strategy: "outpace_strength", priority: "high", status: "todo",
      title: "Build telehealth that goes beyond MedPulse's video-call model",
      insight: "MedPulse pioneered telehealth access (their top strength), but their implementation is basic — video calls with limited follow-up. 33% of reviews say \"video visit felt rushed\" and \"no continuity of care.\" Patients want telehealth that integrates with their overall health journey, not isolated appointments.",
      action: "Launch integrated telehealth with async messaging, continuous remote monitoring via wearables, AI-powered symptom triage, and automatic follow-up scheduling. Make virtual care feel like a relationship, not a transaction.",
      impact: "Redefines telehealth from \"convenient appointment\" to \"continuous care.\" MedPulse's transactional model is architecturally limited — they'd need to rebuild from scratch to match this approach.",
    },
    {
      id: "he3", competitorName: "WellPath", source: "4,200 WellPath reviews", reviewsAnalyzed: 4200, confidencePercent: 88, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Deliver WellPath-level personalization with a simpler interface",
      insight: "WellPath's personalized wellness plans are their #1 strength (4.5 rating), but app complexity drives 39% of negative reviews. Users report needing 20+ minutes to set up their profile and find navigation confusing. Older demographics (45+) abandon the app at 3x the rate of younger users.",
      action: "Build personalization that works invisibly — learn preferences from behavior rather than requiring extensive input. Use progressive disclosure: start simple, reveal complexity as users engage more. Specifically optimize for 45+ UX patterns.",
      impact: "Captures WellPath's underserved 45+ demographic (the highest healthcare spending segment) while matching their personalization quality. Simplicity becomes our moat — it's harder to simplify than to add features.",
    },
    {
      id: "he4", competitorName: "HealthHub", source: "3,800 HealthHub reviews", reviewsAnalyzed: 3800, confidencePercent: 87, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Fill the specialist gap HealthHub can't close",
      insight: "HealthHub's affordable plans attract patients, but limited specialist access drives 41% of negative reviews. Patients report 6-8 week waits for specialist referrals. Their narrow provider network is a cost-saving choice they can't easily reverse without raising prices (which would kill their core value prop).",
      action: "Build a specialist marketplace with same-week availability through partnerships with independent specialists and telehealth specialist consultations. Offer specialist access as an add-on so base pricing stays competitive.",
      impact: "HealthHub's affordable-but-limited model creates a structural gap they can't close without price increases. Our modular approach gives patients choice without forcing a trade-off.",
    },
    {
      id: "he5", competitorName: "WellPath", source: "4,200 WellPath reviews", reviewsAnalyzed: 4200, confidencePercent: 92, strategy: "outpace_strength", priority: "high", status: "todo",
      title: "Go beyond WellPath with AI-driven predictive health plans",
      insight: "WellPath's personalized plans are based on patient questionnaires — static snapshots that don't adapt. 27% of returning users say their plan \"feels the same\" after 6 months. Their personalization is rules-based, not truly adaptive. The initial wow factor fades.",
      action: "Build AI-driven health plans that continuously adapt based on lab results, wearable data, lifestyle changes, and outcomes. Offer proactive health nudges and automatic plan adjustments. Make the experience feel like having a personal health advisor that gets smarter over time.",
      impact: "Moves from WellPath's \"set it and forget it\" personalization to living, breathing health plans. This is the future of preventive care and creates a data moat that compounds with every patient interaction.",
    },
    {
      id: "he6", competitorName: "MedPulse", source: "2,100 MedPulse reviews", reviewsAnalyzed: 2100, confidencePercent: 81, strategy: "exploit_weakness", priority: "low", status: "done",
      title: "Accept every major insurance plan MedPulse rejects",
      insight: "MedPulse's limited insurance coverage is their biggest churn driver — 35% of cancellations cite insurance issues. They only accept 3 of the top 10 insurance providers. Patients discover this after signing up, creating frustration and negative word-of-mouth.",
      action: "Negotiate contracts with all top 10 insurance providers. Make insurance verification instant during sign-up (before patients invest time). Create a \"We accept your insurance\" checker prominently on the homepage.",
      impact: "Removes the #1 barrier to patient acquisition. MedPulse's insurance limitations are contractual and slow to fix — this advantage compounds as we build network effects with more insurers.",
    },
  ],
  finance: [
    {
      id: "f1", competitorName: "FinEdge", source: "6,700 FinEdge reviews", reviewsAnalyzed: 6700, confidencePercent: 91, strategy: "exploit_weakness", priority: "high", status: "in_progress",
      title: "Win FinEdge's confused users with a radically simple interface",
      insight: "FinEdge's low fees drive adoption, but their interface complexity causes 34% of new users to abandon within the first week. Power users love the depth, but the majority (72%) use fewer than 5 features. Their interface was built by engineers for engineers — the mass market is underserved.",
      action: "Build a \"smart default\" interface that shows only what each user needs, with progressive disclosure for advanced features. Offer a guided first-time experience that sets up portfolios in 3 clicks. Run ads targeting \"FinEdge is too complicated\" sentiment.",
      impact: "Captures the mass-market segment FinEdge's complexity alienates. Simplifying their interface would anger their power-user base — they're stuck serving two audiences badly.",
    },
    {
      id: "f2", competitorName: "WealthStack", source: "5,100 WealthStack reviews", reviewsAnalyzed: 5100, confidencePercent: 93, strategy: "outpace_strength", priority: "high", status: "todo",
      title: "Build a robo-advisor that outperforms WealthStack's with transparency",
      insight: "WealthStack's robo-advisor is their defining feature (mentioned in 56% of positive reviews), but 23% of users express concern about algorithmic transparency — \"I don't understand why it made this trade.\" Trust erosion is subtle but growing, especially after market downturns.",
      action: "Launch a robo-advisor with full explainability: every trade decision comes with a plain-language rationale. Offer \"what-if\" scenario modeling so users understand risk. Publish quarterly performance reports with honest attribution.",
      impact: "Transparent AI in finance is a massive trust differentiator. As regulatory pressure on algorithmic transparency increases, this positions us ahead of inevitable industry requirements.",
    },
    {
      id: "f3", competitorName: "CashFlow+", source: "4,300 CashFlow+ reviews", reviewsAnalyzed: 4300, confidencePercent: 87, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Offer instant transfers that expose CashFlow+'s infrastructure lag",
      insight: "CashFlow+ attracts users with cash back rewards, but transfer speeds are a critical weakness — 43% of negative reviews cite 2-3 business day transfers. Their banking infrastructure is built on legacy batch processing. Younger users especially expect instant money movement.",
      action: "Implement real-time transfers using modern payment rails. Offer instant P2P payments and same-day ACH as standard (not premium) features. Market the speed difference directly in acquisition campaigns targeting CashFlow+ users.",
      impact: "CashFlow+'s legacy infrastructure makes instant transfers a multi-year rebuild. This creates a persistent technical moat that widens as user expectations continue to shift toward real-time finance.",
    },
    {
      id: "f4", competitorName: "BankSmart", source: "7,200 BankSmart reviews", reviewsAnalyzed: 7200, confidencePercent: 89, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Offer human-quality support at scale where BankSmart fails",
      insight: "BankSmart's mobile banking is strong, but customer support is consistently poor — 39% of negative reviews cite long hold times (avg. 28 minutes) and unhelpful responses. They've outsourced support to reduce costs, but it's destroying trust. NPS dropped 15 points in 12 months.",
      action: "Deploy AI-first support that resolves 80% of queries instantly, with intelligent escalation to expert agents for complex financial matters. Guarantee 2-minute response times with financial resolution authority for agents. Publicize response time guarantees.",
      impact: "Financial services customers have zero tolerance for bad support when money is involved. BankSmart's outsourcing decision is hard to reverse without major cost increases — their support gap will persist.",
    },
    {
      id: "f5", competitorName: "WealthStack", source: "5,100 WealthStack reviews", reviewsAnalyzed: 5100, confidencePercent: 86, strategy: "exploit_weakness", priority: "medium", status: "in_progress",
      title: "Capture younger investors locked out by WealthStack's minimums",
      insight: "WealthStack requires a $5,000 minimum deposit — 31% of negative reviews come from younger users (18-30) who can't meet this threshold. This demographic has the highest growth potential but lowest current assets. WealthStack's fund structure requires minimums for operational reasons.",
      action: "Launch with no minimum deposit and fractional share investing. Build financial education features targeting 18-30 demographics. Create a \"Start with $1\" campaign directly targeting WealthStack's rejected applicants.",
      impact: "Acquiring young investors early creates lifetime value as their income and assets grow. WealthStack's structural minimum requirement permanently cedes this demographic. First-mover advantage in this segment compounds over decades.",
    },
    {
      id: "f6", competitorName: "CashFlow+", source: "4,300 CashFlow+ reviews", reviewsAnalyzed: 4300, confidencePercent: 84, strategy: "counter_position", priority: "low", status: "done",
      title: "Reframe CashFlow+'s rewards model as a margin-eroding trap",
      insight: "CashFlow+'s cash back rewards are their primary retention tool (top strength), but analysis reveals the model is unsustainable — their reward costs have grown 22% YoY while user growth is only 8%. Users are reward-optimizers who leave when better offers appear. Loyalty is mercenary, not genuine.",
      action: "Build value through superior product experience rather than cash back. Offer a modest rewards program but invest savings into better rates, faster transfers, and superior UX. Create content explaining how aggressive cash back programs ultimately hurt users through hidden fees.",
      impact: "Positions us as the trustworthy alternative to the \"rewards race to the bottom.\" As CashFlow+'s reward costs become unsustainable, they'll have to cut benefits — creating a natural migration wave to more sustainable platforms.",
    },
  ],
  education: [
    {
      id: "e1", competitorName: "LearnPeak", source: "4,800 LearnPeak reviews", reviewsAnalyzed: 4800, confidencePercent: 92, strategy: "outpace_strength", priority: "high", status: "in_progress",
      title: "Surpass LearnPeak's course quality with industry-embedded curriculum",
      insight: "LearnPeak's course quality is their top strength (4.5 rating), but their content is created by educators, not practitioners. 28% of working professional reviews say courses \"feel academic\" and \"don't reflect real-world challenges.\" There's a gap between educational quality and practical applicability.",
      action: "Partner with engineers, designers, and leaders from top companies to co-create courses built around real projects and actual company challenges. Offer \"taught by practitioners\" as a core differentiator. Include portfolio-ready projects in every course.",
      impact: "Shifts the quality benchmark from \"well-structured lessons\" to \"will this actually help me at work.\" LearnPeak's educator-driven model is hard to pivot without rebuilding their entire content pipeline.",
    },
    {
      id: "e2", competitorName: "EduVerse", source: "3,600 EduVerse reviews", reviewsAnalyzed: 3600, confidencePercent: 88, strategy: "counter_position", priority: "high", status: "todo",
      title: "Offer EduVerse-level interactivity with simple, fair pricing",
      insight: "EduVerse's interactive content (quizzes, simulations) is their strength, but confusing pricing tiers are their biggest weakness — 45% of negative reviews cite surprise charges, unclear tier differences, and \"features locked behind paywalls.\" Users feel nickel-and-dimed.",
      action: "Match EduVerse's interactivity with a single, transparent pricing plan — everything included. No tiers, no locked features, no surprises. Run comparison campaigns: \"All features, one price, no gotchas.\" Target frustrated EduVerse users directly.",
      impact: "Pricing transparency is a permanent differentiator EduVerse can't easily adopt — their revenue model depends on upselling between tiers. Simple pricing becomes a trust signal that compounds through word-of-mouth.",
    },
    {
      id: "e3", competitorName: "SkillForge", source: "5,200 SkillForge reviews", reviewsAnalyzed: 5200, confidencePercent: 90, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Steal SkillForge's learners with always-current curriculum",
      insight: "SkillForge's hands-on labs are popular, but outdated curriculum is driving churn — 43% of negative reviews mention deprecated tools, old framework versions, or techniques no longer used in industry. Their content update cycle is 18-24 months, while technology moves in 6-month cycles.",
      action: "Build a continuous curriculum update system: AI-assisted content refresh triggered by industry changes, versioned courses that always teach the latest tools, and \"freshness badges\" showing when content was last updated. Run ads: \"Still learning last year's tech?\"",
      impact: "Curriculum freshness becomes our brand identity. SkillForge's manual update process means this gap widens over time — every month they don't update, more learners become available for acquisition.",
    },
    {
      id: "e4", competitorName: "ClassUp", source: "2,900 ClassUp reviews", reviewsAnalyzed: 2900, confidencePercent: 85, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Offer learn-anytime flexibility ClassUp's live model can't",
      insight: "ClassUp's live sessions create engagement (their strength), but scheduling rigidity is their #1 weakness — 51% of negative reviews mention timezone conflicts, missed sessions with no replay, and an inability to learn at their own pace. Their entire model depends on synchronous delivery.",
      action: "Build a hybrid model: on-demand content as the core, with optional live sessions for Q&A and community. Every session is automatically recorded with AI-generated summaries and timestamps. Offer \"catch up in 10 minutes\" recaps for missed sessions.",
      impact: "Flexibility is the future of education. ClassUp's synchronous-only model structurally can't serve global, asynchronous learners. This hybrid approach captures the best of both worlds.",
    },
    {
      id: "e5", competitorName: "LearnPeak", source: "4,800 LearnPeak reviews", reviewsAnalyzed: 4800, confidencePercent: 83, strategy: "exploit_weakness", priority: "low", status: "done",
      title: "Partner with employers to make certificates LearnPeak's can't match",
      insight: "LearnPeak's certificates lack industry recognition — 36% of job-seeking reviewers say certificates \"didn't help in interviews\" and \"employers don't know LearnPeak.\" Their certificates are self-issued with no third-party validation. This undermines the entire value proposition for career-driven learners.",
      action: "Partner with 50+ employers to co-certify completion (e.g., \"Certified by [Company] and ReviewIntel\"). Build an employer network that recognizes our certificates in hiring. Publish placement statistics publicly.",
      impact: "Employer-backed certificates create a flywheel: more employer partners attract more learners, which attracts more employers. LearnPeak's self-issued model can't compete with actual industry endorsement.",
    },
    {
      id: "e6", competitorName: "SkillForge", source: "5,200 SkillForge reviews", reviewsAnalyzed: 5200, confidencePercent: 87, strategy: "outpace_strength", priority: "medium", status: "in_progress",
      title: "Build labs that go beyond SkillForge with real-world environments",
      insight: "SkillForge's hands-on labs are their top strength (mentioned in 44% of positive reviews), but they're sandboxed — simulated environments that don't reflect production complexity. 22% of advanced users say labs \"feel artificial\" and \"don't prepare you for real work.\" There's a ceiling to their sandbox model.",
      action: "Build labs that run on actual cloud infrastructure, with real databases, real API integrations, and real deployment pipelines. Offer \"production-grade\" labs where learners build and deploy real applications. Partner with cloud providers for free credits.",
      impact: "Moves beyond SkillForge's sandbox ceiling into territory they can't easily follow (real infra is expensive and complex to manage). This becomes the definitive differentiator for serious learners.",
    },
  ],
  automotive: [
    {
      id: "a1", competitorName: "AutoPrime", source: "3,200 AutoPrime reviews", reviewsAnalyzed: 3200, confidencePercent: 88, strategy: "exploit_weakness", priority: "high", status: "in_progress",
      title: "Win buyers with transparent financing AutoPrime obscures",
      insight: "AutoPrime has the largest inventory (their strength), but financing terms are their #1 complaint — 46% of negative reviews mention hidden fees, misleading APR quotes, and \"bait-and-switch\" financing. Their profit model depends on financing markups, making transparency structurally opposed to their incentives.",
      action: "Publish real-time, personalized financing offers on every vehicle listing — no \"contact dealer\" required. Show total cost of ownership including all fees upfront. Create a \"Financing Transparency Guarantee\" with a price-match commitment. Target AutoPrime's frustrated buyers in search ads.",
      impact: "Financing transparency is the single biggest trust signal in auto sales. AutoPrime's margin model depends on opacity — they literally cannot match our transparency without restructuring their revenue.",
    },
    {
      id: "a2", competitorName: "DriveMax", source: "4,600 DriveMax reviews", reviewsAnalyzed: 4600, confidencePercent: 91, strategy: "outpace_strength", priority: "high", status: "todo",
      title: "Redefine test drives beyond what DriveMax offers in-store",
      insight: "DriveMax's test drive experience is their #1 differentiator (mentioned in 48% of positive reviews) — spacious lots, no-pressure sales, and extended test drives. But it's limited to physical locations. 35% of buyers now prefer to minimize dealership visits. There's an opportunity to take the test drive to the customer.",
      action: "Launch at-home test drives with 48-hour vehicle loans — no salesperson present. Pair with a digital comparison tool that lets buyers evaluate vehicles on their own terms. Offer virtual reality showroom tours for initial exploration before the in-person test.",
      impact: "Extends test drive convenience beyond what DriveMax's physical-location model can offer. At-home test drives with no sales pressure fundamentally change the buying power dynamic in the customer's favor.",
    },
    {
      id: "a3", competitorName: "MotorElite", source: "2,800 MotorElite reviews", reviewsAnalyzed: 2800, confidencePercent: 86, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Expose MotorElite's price games with radical pricing clarity",
      insight: "MotorElite carries premium brands (their strength) but price transparency is their worst weakness — 53% of negative reviews cite \"sticker shock,\" unexpected dealer fees, and prices that change between online listing and showroom. Their negative trend (rating declining) correlates directly with pricing complaints increasing 40% YoY.",
      action: "List every vehicle with all-inclusive pricing: purchase price, taxes, fees, delivery — one number, guaranteed. Create a \"MotorElite Price Check\" tool where buyers can compare our transparent pricing against MotorElite's listed price + hidden fees. Publicize the typical markup difference.",
      impact: "MotorElite's declining trajectory creates a migration opportunity. Price transparency in premium automotive is a blue ocean — no major player owns it. First-mover advantage builds brand trust that's nearly impossible to replicate.",
    },
    {
      id: "a4", competitorName: "CarSphere", source: "3,900 CarSphere reviews", reviewsAnalyzed: 3900, confidencePercent: 85, strategy: "exploit_weakness", priority: "medium", status: "todo",
      title: "Guarantee delivery timelines CarSphere consistently misses",
      insight: "CarSphere's online configurator drives engagement (their strength), but delivery delays destroy the post-purchase experience — 49% of negative reviews mention missed delivery dates, poor communication, and vehicles arriving weeks late. The configurator sets expectations their logistics can't meet.",
      action: "Build a real-time delivery tracker with proactive status updates at every stage. Guarantee delivery dates with compensation for delays. Use this reliability as a key differentiator in marketing: \"Configure it, track it, get it — on time, guaranteed.\"",
      impact: "The post-purchase experience is the most underinvested area in automotive. CarSphere's logistics gap means they promise a modern digital buying experience but deliver (literally) a traditional one. Reliability becomes our brand.",
    },
    {
      id: "a5", competitorName: "DriveMax", source: "4,600 DriveMax reviews", reviewsAnalyzed: 4600, confidencePercent: 82, strategy: "exploit_weakness", priority: "low", status: "done",
      title: "Turn DriveMax's service bottleneck into our retention advantage",
      insight: "DriveMax wins on test drives but loses on service — 37% of negative reviews cite long service wait times (avg. 8 days for scheduled maintenance). Their service centers are at 140% capacity. Post-sale experience is where they hemorrhage customer loyalty.",
      action: "Offer guaranteed next-day service appointments with free pickup and delivery. Build a mobile service fleet for basic maintenance that comes to the customer. Use service quality as the retention hook that keeps customers in our ecosystem for their next purchase.",
      impact: "Service experience drives 70% of repeat automotive purchases. DriveMax's capacity constraints make this a persistent gap. Winning on service means winning the second, third, and fourth car purchase — the real lifetime value.",
    },
    {
      id: "a6", competitorName: "CarSphere", source: "3,900 CarSphere reviews", reviewsAnalyzed: 3900, confidencePercent: 89, strategy: "outpace_strength", priority: "medium", status: "in_progress",
      title: "Build a configurator that converts better than CarSphere's",
      insight: "CarSphere's online configurator is engaging (their top strength, mentioned in 41% of positive reviews), but it's a toy — pretty to use but doesn't connect to real inventory or pricing. 30% of users report configuring a vehicle that wasn't actually available, or getting a different price at the dealership.",
      action: "Build a configurator that connects to real-time inventory and shows only buildable, available configurations with locked-in pricing. Add AR visualization to see the configured car in your driveway. Make the configured price the final price — no surprises at the dealership.",
      impact: "Transforms the configurator from a marketing tool into an actual sales tool. CarSphere's disconnect between digital experience and reality is a trust problem they'd need to rebuild their entire inventory system to fix.",
    },
  ],
};
