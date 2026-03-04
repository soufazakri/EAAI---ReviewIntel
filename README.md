# ReviewIntel

> **AI-powered competitive intelligence from customer reviews.**

ReviewIntel is a SaaS platform that aggregates and analyzes competitor product reviews from platforms like G2, Capterra, Trustpilot, Amazon, and app stores. It uses Google Gemini (LLM) to extract actionable competitive intelligence — surfacing insight themes, competitor mentions, churn signals, feature gaps, and prioritized action items.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite (via [Prisma ORM](https://www.prisma.io/)) |
| AI / LLM | [Google Gemini API](https://aistudio.google.com/) (`gemini-2.0-flash`) |
| Charts | Recharts |
| Animations | Framer Motion |
| PDF Export | jsPDF |

---

## Prerequisites

- **Node.js** v18 or later — [Download here](https://nodejs.org/)
- **npm** v9 or later (bundled with Node.js)
- A **Google Gemini API key** — see [Acquiring the API Key](#acquiring-the-api-key) below

---

## Acquiring the API Key

ReviewIntel uses the **Google Gemini API** to perform multi-step LLM analysis on your review data. The API has a generous free tier that is sufficient for development and moderate usage.

**Steps to get your key:**

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account (any personal or Workspace account works)
3. Click **"Create API key"**
4. Select an existing Google Cloud project, or click **"Create API key in new project"** to let Google create one for you automatically
5. Copy the generated API key — it looks like `AIzaSy...`

> **Note:** The Gemini API free tier includes generous rate limits (e.g. 15 requests per minute on `gemini-2.0-flash`). For production or high-volume use, you may want to enable billing on your Google Cloud project to increase quotas.

> **Security:** Never commit your API key to version control. The `.env.local` file is already listed in `.gitignore` to keep it safe.

---

## Environment Setup

The app requires environment variables to connect to the database and the Gemini API. An example file is provided at `.env.example` for reference.

**Steps:**

1. In the root of the project, create a file named `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor and fill in your values:

   ```env
   # Google Gemini API key for LLM-powered review analysis
   # Get one at: https://aistudio.google.com/app/apikey
   GEMINI_API_KEY=your_api_key_here

   # SQLite database path (relative to the prisma/ directory)
   DATABASE_URL="file:./dev.db"
   ```

3. Replace `your_api_key_here` with the API key you copied from Google AI Studio.

> **Tip:** Leave `DATABASE_URL` as-is for local development. Prisma will create the `prisma/dev.db` SQLite file automatically when you run the migration step.

---

## Getting Started

Follow these steps in order to get the app running locally:

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

### 2. Set up the database

Run the Prisma migration to create the SQLite database and all required tables:

```bash
npx prisma migrate dev --name init
```

If the database already exists and you just need to sync the schema, use:

```bash
npx prisma db push
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

```
.
├── prisma/
│   └── schema.prisma       # Database schema (Dataset, Review, Claim, InsightTheme, etc.)
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   ├── components/         # Reusable UI components (shadcn/ui + custom)
│   └── lib/                # Core logic (evidence engine, Prisma client, utilities)
├── public/                 # Static assets
├── .env.example            # Example environment variable file
├── .env.local              # Your local secrets (not committed to git)
└── package.json
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open the Prisma visual database browser |
| `npx prisma migrate dev` | Apply schema changes to the local database |

---

## Data Format

The app accepts CSV files containing customer reviews. The expected columns are:

| Column | Description |
|---|---|
| `review_text` | Full text of the review |
| `rating` | Numeric rating (e.g. 1–5) |
| `review_date` | Date of the review |
| `platform` | Source platform (e.g. G2, Capterra, AppStore) |
| `reviewer_name` | Name of the reviewer |
| `reviewer_role` | Job title or role of the reviewer |
| `product_name` | Name of the product being reviewed |
| `review_url` | URL to the original review (optional) |

Sample CSV data is included in the `public/` directory to help you get started quickly.

---

## Troubleshooting

**`GEMINI_API_KEY` is missing or invalid**
Make sure your `.env.local` file exists at the project root and contains a valid `GEMINI_API_KEY`. Restart the dev server after making changes to environment variables.

**Database errors on first run**
Run `npx prisma migrate dev --name init` before starting the server. If you encounter conflicts, delete `prisma/dev.db` and re-run the migration.

**Port 3000 already in use**
Next.js will automatically try port 3001, 3002, etc. Check the terminal output for the actual URL.
