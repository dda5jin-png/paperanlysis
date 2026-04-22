# Academic API Integrations

All academic API calls must run on the server. Never call OpenAlex, Crossref, arXiv, Semantic Scholar, or CORE directly from browser components.

## Environment Variables

```bash
OPENALEX_API_KEY=
SEMANTIC_SCHOLAR_API_KEY=
CORE_API_KEY=
ARCHIVE_CRON_SECRET=
```

OpenAlex and Crossref do not require keys. Semantic Scholar is used only when `SEMANTIC_SCHOLAR_API_KEY` exists. CORE is used only when `CORE_API_KEY` exists.

## Utility Layer

Reusable functions live in `lib/source-integrations.ts`.

```ts
import {
  fetchOpenAlexWorks,
  fetchCrossrefDOI,
  fetchArxivPapers,
  fetchSemanticScholar,
  fetchCorePapers,
  discoverAcademicSources,
} from "@/lib/source-integrations";

const openAlex = await fetchOpenAlexWorks("literature review", {
  page: 1,
  perPage: 10,
  fromYear: 2020,
  openAccessOnly: true,
});

const doiMetadata = await fetchCrossrefDOI("10.1145/3368089.3409712");
const arxiv = await fetchArxivPapers("academic writing", { limit: 5 });
const all = await discoverAcademicSources({ query: "research question", limit: 10 });
```

## API Route

Example server route:

```http
GET /api/archive/search?q=research%20question&limit=10
GET /api/archive/search?provider=openalex&q=literature%20review
GET /api/archive/search?provider=arxiv&q=research%20methods
GET /api/archive/search?doi=10.1038/s41586-020-2649-2
```

The route returns normalized records only. API keys are never included in the response.

```ts
{
  title: "",
  authors: [],
  abstract: "",
  source: "",
  url: "",
  published_year: "",
  doi: "",
  relevance_score: 0
}
```

## Error Handling Pattern

- External API failure returns an empty array.
- Missing optional API key returns an empty array.
- Pipeline continues with partial data.
- Internal logs include provider URL path and status only, never secret values.
- Timeouts use `AbortController` and default to 8 seconds.

## Security Rules

- Do not add `.env` or `.env.local` to Git.
- Configure keys in Vercel Project Settings.
- Do not expose academic API keys through `NEXT_PUBLIC_*`.
- Do not log request headers, environment variables, or raw authorization errors.

## Weekly Archive Update Agent

The weekly agent is implemented as a server-side job:

```http
POST /api/archive/weekly-update
Authorization: Bearer $ARCHIVE_CRON_SECRET
Content-Type: application/json

{ "dryRun": false, "limitPerTopic": 5 }
```

The job:

- searches academic sources for a fixed weekly topic queue
- normalizes candidate records
- deduplicates by DOI, URL, or title
- stores verified candidates in `sources`
- writes an internal `logs` event
- never publishes public guide pages automatically

Use `dryRun: true` when testing the endpoint. The response may include candidate metadata, but never includes secrets.

### GitHub Actions

`.github/workflows/weekly-archive-update.yml` calls the endpoint every Monday 00:00 UTC, which is Monday 09:00 in Korea.

Required GitHub repository secrets:

```bash
ARCHIVE_UPDATE_URL=https://paperanalysis.cloud/api/archive/weekly-update
ARCHIVE_CRON_SECRET=...
```

### Vercel Cron

`vercel.json` also declares a weekly cron for the same endpoint. Configure `ARCHIVE_CRON_SECRET` in Vercel Environment Variables. If both GitHub Actions and Vercel Cron are enabled, the endpoint may run twice, so keep only one scheduler active in production.
