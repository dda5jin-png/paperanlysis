import { NextResponse } from "next/server";
import {
  discoverAcademicSources,
  fetchArxivPapers,
  fetchCorePapers,
  fetchCrossrefDOI,
  fetchOpenAlexWorks,
  fetchSemanticScholar,
} from "@/lib/source-integrations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const doi = searchParams.get("doi")?.trim() ?? "";
  const provider = searchParams.get("provider") ?? "all";
  const limit = Number(searchParams.get("limit") ?? "10");

  if (!query && !doi) {
    return NextResponse.json(
      { error: "q or doi is required", results: [] },
      { status: 400 },
    );
  }

  if (doi) {
    const results = await fetchCrossrefDOI(doi, { limit });
    return NextResponse.json({ results });
  }

  const results =
    provider === "openalex"
      ? await fetchOpenAlexWorks(query, { limit })
      : provider === "arxiv"
        ? await fetchArxivPapers(query, { limit })
        : provider === "semantic-scholar"
          ? await fetchSemanticScholar(query, { limit })
          : provider === "core"
            ? await fetchCorePapers(query, { limit })
            : await discoverAcademicSources({ query, limit });

  return NextResponse.json({ results });
}
