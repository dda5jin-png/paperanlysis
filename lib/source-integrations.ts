export type AcademicSourceProvider =
  | "openalex"
  | "crossref"
  | "arxiv"
  | "semantic-scholar"
  | "core";

export type NormalizedAcademicWork = {
  title: string;
  authors: string[];
  abstract: string;
  source: AcademicSourceProvider;
  url: string;
  published_year: string;
  doi: string;
  relevance_score: number;
};

export type OpenAlexSearchOptions = {
  page?: number;
  perPage?: number;
  fromYear?: number;
  toYear?: number;
  openAccessOnly?: boolean;
};

export type PaperSearchOptions = {
  limit?: number;
  timeoutMs?: number;
};

type SourceSearchInput = {
  query: string;
  limit?: number;
};

const DEFAULT_LIMIT = 10;
const DEFAULT_TIMEOUT_MS = 8000;

function clampLimit(limit: number | undefined, max = 25) {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(limit, max));
}

function getYearFromDateParts(dateParts?: number[][]) {
  const year = dateParts?.[0]?.[0];
  return typeof year === "number" ? String(year) : "";
}

function normalizeDoi(doi?: string | null) {
  if (!doi) return "";
  return doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
}

function cleanXmlText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractXmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXmlEntities(cleanXmlText(match[1])) : "";
}

function safeYear(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

async function safeFetchJson<T>(url: URL | string, init?: RequestInit & { timeoutMs?: number }): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      console.error("[academic-api] request failed", {
        status: response.status,
        providerUrl: typeof url === "string" ? url.split("?")[0] : url.origin + url.pathname,
      });
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("[academic-api] request error", {
      message: error instanceof Error ? error.message : "Unknown error",
      providerUrl: typeof url === "string" ? url.split("?")[0] : url.origin + url.pathname,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function safeFetchText(url: URL | string, init?: RequestInit & { timeoutMs?: number }): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("[academic-api] text request failed", {
        status: response.status,
        providerUrl: typeof url === "string" ? url.split("?")[0] : url.origin + url.pathname,
      });
      return null;
    }

    return response.text();
  } catch (error) {
    console.error("[academic-api] text request error", {
      message: error instanceof Error ? error.message : "Unknown error",
      providerUrl: typeof url === "string" ? url.split("?")[0] : url.origin + url.pathname,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchOpenAlexWorks(
  query: string,
  options: OpenAlexSearchOptions & PaperSearchOptions = {},
): Promise<NormalizedAcademicWork[]> {
  if (!query.trim()) return [];

  const perPage = clampLimit(options.perPage ?? options.limit);
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("page", String(options.page ?? 1));
  url.searchParams.set("per-page", String(perPage));

  const filters = [
    options.fromYear ? `from_publication_date:${options.fromYear}-01-01` : "",
    options.toYear ? `to_publication_date:${options.toYear}-12-31` : "",
    options.openAccessOnly ? "is_oa:true" : "",
  ].filter(Boolean);

  if (filters.length) url.searchParams.set("filter", filters.join(","));
  const data = await safeFetchJson<{ results?: any[] }>(url, {
    timeoutMs: options.timeoutMs,
    next: { revalidate: 60 * 60 * 24 },
  });

  return (data?.results ?? []).map((item) => ({
    title: item.title ?? "",
    authors: (item.authorships ?? [])
      .map((authorship: any) => authorship.author?.display_name)
      .filter(Boolean),
    abstract: item.abstract_inverted_index ? reconstructOpenAlexAbstract(item.abstract_inverted_index) : "",
    source: "openalex",
    url: item.id ?? item.primary_location?.landing_page_url ?? "",
    published_year: safeYear(item.publication_year),
    doi: normalizeDoi(item.doi),
    relevance_score: typeof item.relevance_score === "number" ? item.relevance_score : 0,
  }));
}

export async function fetchCrossrefDOI(
  doi: string,
  options: PaperSearchOptions = {},
): Promise<NormalizedAcademicWork[]> {
  const normalizedDoi = normalizeDoi(doi);
  if (!normalizedDoi) return [];

  const url = new URL(`https://api.crossref.org/works/${encodeURIComponent(normalizedDoi)}`);
  const data = await safeFetchJson<{ message?: any }>(url, {
    timeoutMs: options.timeoutMs,
    next: { revalidate: 60 * 60 * 24 },
  });

  const item = data?.message;
  if (!item) return [];

  return [
    {
      title: item.title?.[0] ?? "",
      authors: (item.author ?? [])
        .map((author: any) => [author.given, author.family].filter(Boolean).join(" "))
        .filter(Boolean),
      abstract: item.abstract ? cleanXmlText(item.abstract) : "",
      source: "crossref",
      url: item.URL ?? (normalizedDoi ? `https://doi.org/${normalizedDoi}` : ""),
      published_year: getYearFromDateParts(item.published?.["date-parts"]),
      doi: normalizeDoi(item.DOI ?? normalizedDoi),
      relevance_score: typeof item.score === "number" ? item.score : 1,
    },
  ];
}

export async function fetchArxivPapers(
  query: string,
  options: PaperSearchOptions = {},
): Promise<NormalizedAcademicWork[]> {
  if (!query.trim()) return [];

  const limit = clampLimit(options.limit);
  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `all:${query}`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(limit));

  const xml = await safeFetchText(url, {
    timeoutMs: options.timeoutMs,
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!xml) return [];

  return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)).map((match) => {
    const entry = match[1];
    const published = extractXmlValue(entry, "published");
    const authors = Array.from(entry.matchAll(/<author>([\s\S]*?)<\/author>/gi))
      .map((authorMatch) => extractXmlValue(authorMatch[1], "name"))
      .filter(Boolean);
    const links = Array.from(entry.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)).map((linkMatch) => linkMatch[1]);
    const doi = extractXmlValue(entry, "arxiv:doi") || extractXmlValue(entry, "doi");

    return {
      title: extractXmlValue(entry, "title"),
      authors,
      abstract: extractXmlValue(entry, "summary"),
      source: "arxiv" as const,
      url: links[0] ?? extractXmlValue(entry, "id"),
      published_year: published ? published.slice(0, 4) : "",
      doi: normalizeDoi(doi),
      relevance_score: 1,
    };
  });
}

export async function fetchSemanticScholar(
  query: string,
  options: PaperSearchOptions = {},
): Promise<NormalizedAcademicWork[]> {
  if (!query.trim()) return [];

  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) return [];

  const limit = clampLimit(options.limit);
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", "title,abstract,year,url,authors,externalIds");

  const data = await safeFetchJson<{ data?: any[] }>(url, {
    timeoutMs: options.timeoutMs,
    headers: { "x-api-key": apiKey },
    next: { revalidate: 60 * 60 * 24 },
  });

  return (data?.data ?? []).map((item) => ({
    title: item.title ?? "",
    authors: (item.authors ?? []).map((author: any) => author.name).filter(Boolean),
    abstract: item.abstract ?? "",
    source: "semantic-scholar",
    url: item.url ?? "",
    published_year: safeYear(item.year),
    doi: normalizeDoi(item.externalIds?.DOI),
    relevance_score: 1,
  }));
}

export async function fetchCorePapers(
  query: string,
  options: PaperSearchOptions = {},
): Promise<NormalizedAcademicWork[]> {
  if (!query.trim()) return [];

  const apiKey = process.env.CORE_API_KEY;
  if (!apiKey) return [];

  const limit = clampLimit(options.limit);
  const url = new URL("https://api.core.ac.uk/v3/search/works");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));

  const data = await safeFetchJson<{ results?: any[] }>(url, {
    timeoutMs: options.timeoutMs,
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 60 * 60 * 24 },
  });

  return (data?.results ?? []).map((item) => ({
    title: item.title ?? "",
    authors: (item.authors ?? [])
      .map((author: any) => (typeof author === "string" ? author : author.name))
      .filter(Boolean),
    abstract: item.abstract ?? "",
    source: "core",
    url: item.downloadUrl ?? item.fullTextLink ?? item.links?.[0]?.url ?? "",
    published_year: safeYear(item.yearPublished ?? item.publishedYear),
    doi: normalizeDoi(item.doi),
    relevance_score: typeof item.score === "number" ? item.score : 1,
  }));
}

export async function discoverAcademicSources(
  input: SourceSearchInput,
): Promise<NormalizedAcademicWork[]> {
  const results = await Promise.allSettled([
    fetchOpenAlexWorks(input.query, { limit: input.limit }),
    fetchArxivPapers(input.query, { limit: input.limit }),
    fetchSemanticScholar(input.query, { limit: input.limit }),
    fetchCorePapers(input.query, { limit: input.limit }),
  ]);

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

function reconstructOpenAlexAbstract(invertedIndex: Record<string, number[]>) {
  const words: string[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      words[position] = word;
    }
  }
  return words.filter(Boolean).join(" ");
}
